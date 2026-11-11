import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import tls from 'node:tls';
import { load, type CheerioAPI } from 'cheerio';
import { randomBytes, createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { buildBulletin, type AuditResult, type Bulletin, type Check, type Speed, type TextReview, type Level } from '../components/auditTypes';

/* Moteur d'audit partagé : outil privé (/outil-audit) et demandes publiques (/audit-gratuit). Code serveur uniquement. */
const UA = 'Mozilla/5.0 (compatible; SEOKRAFT-Audit/1.0; +https://www.seokraft.fr)';
const MAX_BYTES = 3_000_000;

/* ---------- Accès : outil privé de Marc ---------- */
function authorised(request: Request) {
  const expected = process.env.AUDIT_TOOL_PASSWORD;
  const given = request.headers.get('x-audit-key') || '';
  if (!expected || given.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ given.charCodeAt(i);
  return diff === 0;
}

/* ---------- Sécurité : on n'analyse que des sites publics (pas de réseau interne) ---------- */
function privateIp(ip: string) {
  if (isIP(ip) === 6) {
    const v = ip.toLowerCase();
    if (v.startsWith('::ffff:')) return privateIp(v.slice(7));
    return v === '::1' || v === '::' || v.startsWith('fc') || v.startsWith('fd') || v.startsWith('fe8') || v.startsWith('fe9') || v.startsWith('fea') || v.startsWith('feb');
  }
  const [a, b] = ip.split('.').map(Number);
  return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224;
}
export async function assertPublic(url: URL) {
  if (!/^https?:$/.test(url.protocol)) throw new Error('Adresse non prise en charge');
  if (process.env.AUDIT_ALLOW_LOCAL === '1') return;
  if (url.port && !['80', '443'].includes(url.port)) throw new Error('Port non autorisé');
  const host = url.hostname.replace(/^\[|\]$/g, '');
  const ips = isIP(host) ? [host] : (await lookup(host, { all: true })).map((r) => r.address);
  if (!ips.length || ips.some(privateIp)) throw new Error('Adresse non autorisée');
}

type Page = { url: string; status: number; headers: Headers; html: string; ms: number; bytes: number; hops: string[] };

/* Suit les redirections une par une, en vérifiant chaque étape. */
async function fetchPage(start: string, maxHops = 5): Promise<Page> {
  let current = new URL(start);
  const hops: string[] = [];
  const t0 = Date.now();
  for (let i = 0; i <= maxHops; i++) {
    await assertPublic(current);
    const res = await fetch(current, { redirect: 'manual', headers: { 'User-Agent': UA, Accept: 'text/html,*/*' }, signal: AbortSignal.timeout(12000) });
    if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
      hops.push(current.toString());
      current = new URL(res.headers.get('location')!, current);
      continue;
    }
    const ms = Date.now() - t0;
    const reader = res.body?.getReader();
    const chunks: Uint8Array[] = [];
    let bytes = 0;
    if (reader) {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.length;
        if (bytes > MAX_BYTES) { await reader.cancel(); break; }
        chunks.push(value);
      }
    }
    const html = new TextDecoder('utf-8').decode(Buffer.concat(chunks));
    return { url: current.toString(), status: res.status, headers: res.headers, html, ms, bytes, hops };
  }
  throw new Error('Trop de redirections');
}

async function exists(url: string) {
  try {
    const u = new URL(url);
    await assertPublic(u);
    const r = await fetch(u, { headers: { 'User-Agent': UA }, redirect: 'follow', signal: AbortSignal.timeout(8000) });
    const text = r.ok ? (await r.text()).slice(0, 200000) : '';
    return { ok: r.ok, text };
  } catch {
    return { ok: false, text: '' };
  }
}

/* ---------- Les vérifications ---------- */
/* Texte visible, avec un espace entre chaque bloc (sinon « Ustaritz » et « Accueil » se collent). */
const text = ($: CheerioAPI) => {
  const b = $('body').clone();
  b.find('script,style,noscript,svg,template').remove();
  b.find('br,p,div,li,td,th,tr,h1,h2,h3,h4,h5,h6,a,span,section,article,header,footer,nav,button,label,dt,dd,address,figcaption').each((_, e) => { $(e).append(' '); });
  return b.text().replace(/\s+/g, ' ').trim();
};

type SubPage = { url: string; label: string; $: CheerioAPI };

type Extra = {
  robots: { ok: boolean; text: string }; sitemap: boolean; httpRedirects: boolean | null;
  internalPages: number; broken: string[];
  images: { count: number; heavy: number; biggestKb: number; totalKb: number } | null;
  certDays: number | null;
};

function analyse(page: Page, $: CheerioAPI, extra: Extra, subs: SubPage[] = []): Check[] {
  const c: Check[] = [];
  const add = (x: Check) => c.push(x);
  const body = text($);
  const lower = body.toLowerCase();
  const hrefs = $('a[href]').map((_, a) => ($(a).attr('href') || '').trim()).get();
  const linkTexts = $('a').map((_, a) => $(a).text().toLowerCase()).get().join(' | ');
  /* Éléments valables pour tout le site : on cherche sur toutes les pages lues. */
  const all = [$, ...subs.map((p) => p.$)];
  const siteHrefs = all.flatMap((d) => d('a[href]').map((_, a) => (d(a).attr('href') || '').trim()).get());
  const siteLinkTexts = all.map((d) => d('a').map((_, a) => d(a).text().toLowerCase()).get().join(' | ')).join(' | ');
  const siteBody = [body, ...subs.map((p) => text(p.$))].join(' ');
  const where = subs.length ? 'sur les pages analysées' : 'sur la page d’accueil';
  const year = new Date().getFullYear();

  /* --- Présence sur Google --- */
  const title = $('head > title').first().text().replace(/\s+/g, ' ').trim();
  const generic = /^(accueil|home|bienvenue|page d.accueil|index|untitled|sans titre|document)\b/i.test(title) || (!!title && title.split(/\s+/).length <= 2);
  add({ id: 'title', cat: 'google', label: 'Titre de la page pour Google', weight: 2,
    status: !title || generic ? 'bad' : title.length < 25 || title.length > 65 ? 'warn' : 'ok',
    detail: !title ? 'Aucun titre n’est défini.' : `« ${title.slice(0, 90)} » (${title.length} caractères).`,
    advice: !title ? 'Ajouter un titre qui contient votre métier et votre ville : c’est la ligne bleue cliquable dans Google.' : generic ? 'Ce titre ne dit ni votre métier ni votre ville : Google ne peut pas vous proposer sur les bonnes recherches.' : title.length < 25 ? 'Titre trop court : précisez votre métier et votre ville pour être trouvé sur les bonnes recherches.' : title.length > 65 ? 'Titre trop long : Google le coupe. Gardez l’essentiel (métier + ville) en moins de 60 caractères.' : 'Bonne longueur. Vérifiez qu’il contient bien votre métier et votre ville.' });

  const desc = $('meta[name="description"]').attr('content')?.trim() || '';
  add({ id: 'description', cat: 'google', label: 'Description dans les résultats Google',
    status: !desc ? 'bad' : desc.length < 70 || desc.length > 170 ? 'warn' : 'ok',
    detail: !desc ? 'Aucune description n’est définie.' : `${desc.length} caractères.`,
    advice: !desc ? 'Rédiger une description de 140 à 160 caractères qui donne envie de cliquer : c’est votre « vitrine » dans Google.' : desc.length < 70 ? 'Description trop courte : ajoutez ce qui vous distingue et une invitation à vous contacter.' : desc.length > 170 ? 'Description trop longue : Google la coupe. Visez 140 à 160 caractères.' : 'Bonne description.' });

  const h1 = $('h1');
  const h1Text = h1.first().text().replace(/\s+/g, ' ').trim();
  add({ id: 'h1', cat: 'google', label: 'Titre principal de la page (H1)',
    status: h1.length === 0 ? 'bad' : h1.length > 1 ? 'warn' : 'ok',
    detail: h1.length === 0 ? 'Aucun titre principal.' : h1.length > 1 ? `${h1.length} titres principaux sur la page.` : `« ${h1Text.slice(0, 90)} »`,
    advice: h1.length === 0 ? 'Ajouter un titre principal clair : il indique à Google et aux visiteurs le sujet de la page.' : h1.length > 1 ? 'Garder un seul titre principal par page pour ne pas brouiller le message.' : 'Un seul titre principal : c’est correct.' });

  /* Ville ciblée : on repère la ville de l'entreprise (code postal + ville, ou données structurées) et on vérifie qu'elle est dans le titre ou le grand titre. */
  const jsonldAll = all.map((d) => d('script[type="application/ld+json"]').map((_, s) => d(s).text()).get().join(' ')).join(' ');
  const cities = new Set<string>();
  const CITY = "[A-ZÀ-Ý][a-zà-ÿ'’]+(?:-[A-Za-zÀ-ÿ'’]+)*(?:[ -](?:sur|sous|lès|les|en|de|du|la|le)[ -][A-ZÀ-Ý][a-zà-ÿ'’]+(?:-[A-Za-zÀ-ÿ'’]+)*)?";
  for (const m of siteBody.matchAll(new RegExp(`\\b\\d{5}\\s+(${CITY})`, 'g'))) cities.add(m[1].trim());
  for (const m of jsonldAll.matchAll(/"addressLocality"\s*:\s*"([^"]{2,40})"/g)) cities.add(m[1].trim());
  for (const m of jsonldAll.matchAll(/"@type"\s*:\s*"City"\s*,\s*"name"\s*:\s*"([^"]{2,40})"/g)) cities.add(m[1].trim());
  const headline = `${title} ${$('h1').text()} ${$('meta[name="description"]').attr('content') || ''}`;
  for (const m of headline.matchAll(new RegExp(`(?:^|\\s)(?:à|au|sur|près de|autour de)\\s+(${CITY})`, 'g'))) if (!/^(Votre|Vos|Nos|Notre|Domicile|Distance|Partir|Vous)$/i.test(m[1])) cities.add(m[1].trim());
  const cityList = [...cities].filter((c) => !/^(Tel|Tél|Fax|Mail|France|Siret|SIRET|Rcs|RCS)$/i.test(c)).slice(0, 4);
  const norm = (x: string) => x.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const target = norm(title + ' ' + $('h1').text());
  const cityOk = cityList.some((c) => target.includes(norm(c.split(/[ -]/)[0])));
  add({ id: 'title-local', cat: 'google', label: 'Ville ciblée sur Google', weight: 2,
    status: !cityList.length ? 'warn' : cityOk ? 'ok' : 'bad',
    detail: !cityList.length ? 'Aucune ville clairement identifiable sur le site.' : cityOk ? `La ville (${cityList[0]}) apparaît dans le titre ou le grand titre.` : `Votre ville (${cityList[0]}) n’apparaît ni dans le titre Google ni dans le grand titre de l’accueil.`,
    advice: cityOk ? 'Rien à faire.' : 'Vos clients cherchent « votre métier + votre ville ». Sans la ville dans le titre, Google vous montre rarement sur ces recherches.' });

  const h2n = $('h2').length;
  add({ id: 'structure', cat: 'google', label: 'Organisation du texte (intertitres)',
    status: h2n === 0 ? 'bad' : h2n < 3 ? 'warn' : 'ok', detail: `${h2n} intertitre(s) sur la page d’accueil.`,
    advice: h2n >= 3 ? 'Rien à faire.' : 'Découper la page en parties avec des intertitres clairs (vos services, votre zone, vos avis) : plus lisible pour les clients et pour Google.' });

  /* Hiérarchie des titres : H1 puis H2 puis H3, sans sauter de niveau. */
  const levels = $('h1,h2,h3,h4').map((_, h) => Number(h.tagName.slice(1))).get() as number[];
  let jumps = 0; levels.forEach((l, i) => { if (i && l > levels[i - 1] + 1) jumps++; });
  const h3n = $('h3').length;
  add({ id: 'hierarchy', cat: 'google', label: 'Hiérarchie des titres (H1, H2, H3)',
    status: !levels.length || levels[0] !== 1 && h1.length === 0 ? 'bad' : jumps > 1 ? 'warn' : 'ok',
    detail: `${h1.length} H1, ${h2n} H2, ${h3n} H3${jumps ? `, ${jumps} saut(s) de niveau` : ''}.`,
    advice: jumps > 1 || !levels.length ? 'Organiser les titres comme un sommaire (un H1, puis des H2, puis des H3) : Google comprend mieux de quoi parle chaque partie.' : 'Rien à faire.' });

  /* Maillage interne : liens de l'accueil vers les autres pages, et textes de liens parlants. */
  const host0 = new URL(page.url).hostname.replace(/^www\./, '');
  const internal = $('a[href]').filter((_, a) => { try { const u = new URL($(a).attr('href') || '', page.url); return u.hostname.replace(/^www\./, '') === host0 && !/^#/.test($(a).attr('href') || ''); } catch { return false; } });
  const inBody = internal.filter((_, a) => $(a).closest('header, nav, footer').length === 0).length;
  const vague = internal.filter((_, a) => /^(ici|cliquez ici|en savoir plus|lire la suite|voir plus|suite|plus|>>|→)$/i.test($(a).text().trim())).length;
  add({ id: 'maillage', cat: 'google', label: 'Liens entre les pages (maillage interne)',
    status: inBody === 0 ? 'bad' : inBody < 3 || vague > 2 ? 'warn' : 'ok',
    detail: `${inBody} lien(s) vers d’autres pages dans le contenu de l’accueil (hors menu)${vague ? `, dont ${vague} au texte vague (« en savoir plus », « ici »…)` : ''}.`,
    advice: inBody >= 3 && vague <= 2 ? 'Rien à faire.' : 'Relier les pages entre elles dans le texte, avec des liens qui disent où ils mènent (« nos rénovations de salle de bain » plutôt que « en savoir plus ») : Google découvre et valorise mieux vos pages.' });

  add({ id: 'site-size', cat: 'google', label: 'Nombre de pages du site', weight: 2,
    status: extra.internalPages >= 5 ? 'ok' : extra.internalPages >= 2 ? 'warn' : 'bad',
    detail: extra.internalPages === 0 ? 'Le site ne contient qu’une seule page.' : `${extra.internalPages} page(s) trouvée(s) en plus de l’accueil.`,
    advice: extra.internalPages >= 5 ? 'Rien à faire.' : 'Une page par service permet d’apparaître sur beaucoup plus de recherches Google. Un site d’une ou deux pages reste presque invisible.' });

  add({ id: 'broken', cat: 'google', label: 'Liens cassés',
    status: extra.broken.length === 0 ? 'ok' : 'bad',
    detail: extra.broken.length === 0 ? 'Aucun lien cassé parmi les pages vérifiées.' : `${extra.broken.length} lien(s) mène(nt) à une page d’erreur : ${extra.broken.slice(0, 3).join(', ')}.`,
    advice: extra.broken.length === 0 ? 'Rien à faire.' : 'Un lien qui mène à une erreur donne une image de site abandonné, et Google le remarque. À corriger.' });

  const robotsMeta = ($('meta[name="robots"]').attr('content') || '').toLowerCase() + ' ' + (page.headers.get('x-robots-tag') || '').toLowerCase();
  const noindex = robotsMeta.includes('noindex');
  add({ id: 'indexable', cat: 'google', label: 'Page autorisée dans Google', weight: 3,
    status: noindex ? 'bad' : 'ok',
    detail: noindex ? 'La page demande à Google de ne pas l’afficher (noindex).' : 'La page peut apparaître dans Google.',
    advice: noindex ? 'Urgent : retirer l’instruction « noindex », sinon la page n’apparaît jamais dans Google.' : 'Rien à faire.' });

  const robotsBlocks = extra.robots.ok && /user-agent:\s*\*[\s\S]*?disallow:\s*\/\s*$/im.test(extra.robots.text);
  add({ id: 'robots', cat: 'google', label: 'Fichier robots.txt',
    status: robotsBlocks ? 'bad' : extra.robots.ok ? 'ok' : 'warn',
    detail: robotsBlocks ? 'Le fichier robots.txt bloque tout le site.' : extra.robots.ok ? 'Présent.' : 'Absent.',
    advice: robotsBlocks ? 'Urgent : le site entier est interdit aux moteurs de recherche.' : extra.robots.ok ? 'Rien à faire.' : 'Ajouter un fichier robots.txt qui indique à Google où trouver le plan du site.' });

  add({ id: 'sitemap', cat: 'google', label: 'Plan du site (sitemap)',
    status: extra.sitemap ? 'ok' : 'warn',
    detail: extra.sitemap ? 'Présent.' : 'Introuvable à l’adresse habituelle.',
    advice: extra.sitemap ? 'Rien à faire. Pensez à le déclarer dans Google Search Console.' : 'Créer un plan du site et le déclarer dans Google Search Console pour que toutes vos pages soient découvertes.' });

  const lang = $('html').attr('lang') || '';
  add({ id: 'lang', cat: 'google', label: 'Langue déclarée', status: lang ? 'ok' : 'warn',
    detail: lang ? `Langue : ${lang}.` : 'Aucune langue déclarée.',
    advice: lang ? 'Rien à faire.' : 'Déclarer la langue (français) aide Google et les lecteurs d’écran.' });

  const jsonld = $('script[type="application/ld+json"]').map((_, s) => $(s).text()).get().join(' ');
  const localBiz = /LocalBusiness|ProfessionalService|Organization|Store|Restaurant|Plumber|Electrician|Dentist|Attorney|AutoRepair|HomeAndConstructionBusiness/i.test(jsonld);
  add({ id: 'schema', cat: 'google', label: 'Fiche d’identité pour Google et les IA',
    status: localBiz ? 'ok' : jsonld ? 'warn' : 'bad',
    detail: localBiz ? 'Des données structurées décrivent l’entreprise.' : jsonld ? 'Des données structurées existent, mais ne décrivent pas l’entreprise.' : 'Aucune donnée structurée.',
    advice: localBiz ? 'Rien à faire.' : 'Ajouter une « fiche d’identité » invisible (nom, activité, adresse, téléphone, horaires) que Google et les assistants IA lisent directement.' });

  if (subs.length) {
    const titles = [title, ...subs.map((p) => p.$('head > title').first().text().trim())];
    const noTitle = subs.filter((p) => !p.$('head > title').first().text().trim()).length;
    const noDesc = subs.filter((p) => !(p.$('meta[name="description"]').attr('content') || '').trim()).length;
    const dup = titles.filter(Boolean).length - new Set(titles.filter(Boolean)).size;
    const issues = noTitle + noDesc + dup;
    add({ id: 'pages-seo', cat: 'google', label: 'Titres et descriptions des autres pages', weight: 2,
      status: issues === 0 ? 'ok' : noTitle || dup > 1 || noDesc === subs.length ? 'bad' : 'warn',
      detail: issues === 0 ? `Les ${subs.length} autres pages analysées ont chacune leur titre et leur description.` : [noTitle && `${noTitle} page(s) sans titre`, noDesc && `${noDesc} page(s) sans description`, dup && `${dup} titre(s) identique(s) à une autre page`].filter(Boolean).join(', ') + '.',
      advice: issues === 0 ? 'Rien à faire.' : 'Chaque page doit avoir son propre titre et sa propre description dans Google : sinon, vos services ne ressortent pas sur les bonnes recherches.' });
  }

  /* --- Contenu et clarté --- */
  const words = body ? body.split(' ').length : 0;
  add({ id: 'words', cat: 'contenu', label: 'Quantité de texte sur la page d’accueil', weight: 2,
    status: words < 250 ? 'bad' : words < 500 ? 'warn' : 'ok',
    detail: `Environ ${words} mots.`,
    advice: words < 250 ? 'Très peu de texte : Google a du mal à comprendre ce que vous faites. Présentez vos services, votre zone et ce qui vous distingue.' : words < 500 ? 'Texte un peu léger : développez vos services et répondez aux questions de vos clients.' : 'Volume de texte suffisant.' });

  const imgs = $('img');
  const noAlt = imgs.filter((_, i) => !($(i).attr('alt') || '').trim()).length;
  add({ id: 'alt', cat: 'contenu', label: 'Description des images',
    status: imgs.length === 0 ? 'warn' : noAlt === 0 ? 'ok' : noAlt / imgs.length > 0.5 ? 'bad' : 'warn',
    detail: imgs.length === 0 ? 'Aucune image sur la page.' : `${noAlt} image(s) sur ${imgs.length} sans description.`,
    advice: imgs.length === 0 ? 'Ajouter des photos réelles de votre activité : elles rassurent et retiennent les visiteurs.' : noAlt === 0 ? 'Rien à faire.' : 'Décrire chaque image : Google Images peut alors vous faire apparaître, et le site devient accessible aux malvoyants.' });

  add({ id: 'photos', cat: 'contenu', label: 'Photos de l’activité',
    status: imgs.length >= 4 ? 'ok' : imgs.length >= 1 ? 'warn' : 'bad', detail: `${imgs.length} image(s) sur la page d’accueil.`,
    advice: imgs.length >= 4 ? 'Rien à faire.' : 'Montrer de vraies photos (équipe, réalisations, lieux) : c’est ce qui rassure le plus un client qui ne vous connaît pas.' });

  const og = $('meta[property="og:image"]').length > 0 && $('meta[property="og:title"]').length > 0;
  add({ id: 'og', cat: 'contenu', label: 'Aperçu lors d’un partage (réseaux sociaux)',
    status: og ? 'ok' : 'warn',
    detail: og ? 'Un aperçu avec image est prévu.' : 'Aucun aperçu prévu.',
    advice: og ? 'Rien à faire.' : 'Prévoir l’image et le titre affichés quand votre site est partagé sur Facebook, LinkedIn ou WhatsApp.' });

  const favicon = $('link[rel~="icon"], link[rel="apple-touch-icon"]').length > 0;
  add({ id: 'favicon', cat: 'contenu', label: 'Icône du site (onglet du navigateur)',
    status: favicon ? 'ok' : 'warn', detail: favicon ? 'Présente.' : 'Absente.',
    advice: favicon ? 'Rien à faire.' : 'Ajouter votre logo en icône : un détail qui fait professionnel.' });

  const years = [...body.matchAll(/(?:©|copyright)\s*(?:\d{4}\s*[-–]\s*)?(\d{4})/gi)].map((m) => Number(m[1]));
  const lastYear = years.length ? Math.max(...years) : null;
  add({ id: 'fresh', cat: 'contenu', label: 'Site tenu à jour',
    status: lastYear === null ? 'ok' : lastYear >= year - 1 ? 'ok' : lastYear >= year - 3 ? 'warn' : 'bad',
    detail: lastYear === null ? 'Aucune date visible.' : `Date affichée en bas de page : ${lastYear}.`,
    advice: lastYear !== null && lastYear < year - 1 ? 'Une date ancienne donne l’impression d’un site abandonné : mettez-la à jour.' : 'Rien à faire.' });

  /* --- Mobile et vitesse (la vitesse détaillée vient de Google PageSpeed) --- */
  const viewport = $('meta[name="viewport"]').attr('content') || '';
  add({ id: 'viewport', cat: 'mobile', label: 'Adaptation au téléphone', weight: 3,
    status: viewport.includes('width=device-width') ? 'ok' : 'bad',
    detail: viewport.includes('width=device-width') ? 'Le site s’adapte à la taille de l’écran.' : 'Le site n’est pas configuré pour les téléphones.',
    advice: viewport.includes('width=device-width') ? 'Rien à faire.' : 'Urgent : la majorité des visiteurs arrivent sur téléphone. Le site doit s’adapter à leur écran.' });

  /* Site ancien : signes d'une technique dépassée (cadres, Flash, balises abandonnées, ancien format de page). */
  const html0 = page.html;
  const signs = ([
    [/<frameset|<frame\s/i.test(html0), 'page construite en cadres (frames)'],
    [/\.swf\b|application\/x-shockwave-flash/i.test(html0), 'animation Flash (plus lue par aucun navigateur)'],
    [/<(font|center|marquee|blink)\b/i.test(html0), 'balises de mise en forme abandonnées'],
    [/<!DOCTYPE\s+html\s+PUBLIC/i.test(html0), 'ancien format de page (HTML 4 / XHTML)'],
    [$('table[width], td[width], table[bgcolor], td[bgcolor]').length > 3, 'mise en page en tableaux'],
  ] as [boolean, string][]).filter(([on]) => on).map(([, l]) => l);
  add({ id: 'outdated', cat: 'mobile', label: 'Technique du site à jour', weight: 3,
    status: signs.length >= 2 || /cadres|Flash/.test(signs.join()) ? 'bad' : signs.length ? 'warn' : 'ok',
    detail: signs.length ? `Signes d’un site ancien : ${signs.join(', ')}.` : 'Aucun signe de technique dépassée.',
    advice: signs.length ? 'Le site repose sur une technique d’une autre époque : il s’affiche mal sur téléphone, il est moins bien compris par Google, et il est plus difficile à sécuriser.' : 'Rien à faire.' });

  /* Site fait avec un outil « clé en main » : code lourd, peu de maîtrise de la vitesse et du référencement, site loué et non possédé. */
  const BUILDERS: [RegExp, string][] = [[/wix\.com|wixstatic|_wix/i, 'Wix'], [/jimdo/i, 'Jimdo'], [/squarespace/i, 'Squarespace'], [/webnode/i, 'Webnode'], [/e-monsite/i, 'e-monsite'], [/sitew\./i, 'SiteW'], [/weebly/i, 'Weebly'], [/sites\.google\.com|googleusercontent\.com\/sites/i, 'Google Sites'], [/godaddy.*(website|builder)|img1\.wsimg\.com/i, 'GoDaddy'], [/site123/i, 'SITE123'], [/hostinger.*builder|zyrosite|zyro\.com/i, 'Hostinger Builder'], [/duda(mobile|\.co)|multiscreensite/i, 'Duda'], [/strikingly/i, 'Strikingly'], [/ionos.*(mywebsite|builder)|mywebsite-editor/i, 'IONOS MyWebsite']];
  const builder = BUILDERS.find(([re]) => re.test(html0.slice(0, 200000)))?.[1] || (/\.gites\.fr$|\.gites-de-france\.com$|\.e-monsite\.com$|\.wixsite\.com$|\.jimdofree\.com$|\.webnode\.fr$|\.over-blog\.com$/i.test(new URL(page.url).hostname) ? 'une plateforme de sites clé en main' : '');
  add({ id: 'builder', cat: 'mobile', label: 'Site sur mesure ou site « clé en main »', weight: 3,
    status: builder ? 'bad' : 'ok',
    detail: builder ? `Le site est réalisé avec ${builder}.` : 'Aucun outil de site « clé en main » détecté.',
    advice: builder ? 'Ces outils chargent beaucoup de code inutile (site plus lent), limitent les réglages pour Google, et le site reste loué : vous ne le possédez pas et ne pouvez pas l’emporter ailleurs.' : 'Rien à faire.' });

  if (extra.images) {
    const im = extra.images;
    add({ id: 'images', cat: 'mobile', label: 'Poids des images', weight: 2,
      status: im.heavy === 0 && im.totalKb < 1500 ? 'ok' : im.biggestKb > 1000 || im.totalKb > 4000 ? 'bad' : 'warn',
      detail: `${im.count} image(s) vérifiée(s) : ${(im.totalKb / 1024).toFixed(1).replace('.', ',')} Mo au total${im.heavy ? `, dont ${im.heavy} de plus de 300 Ko (la plus lourde : ${im.biggestKb} Ko)` : ''}.`,
      advice: im.heavy === 0 && im.totalKb < 1500 ? 'Rien à faire.' : 'Des images trop lourdes ralentissent fortement le site sur téléphone. Les compresser divise souvent le temps de chargement par deux.' });
  }

  const kb = Math.round(page.bytes / 1024);
  add({ id: 'weight', cat: 'mobile', label: 'Poids du code de la page',
    status: kb > 600 ? 'bad' : kb > 250 ? 'warn' : 'ok', detail: `${kb} Ko.`,
    advice: kb > 250 ? 'Page lourde : elle se charge lentement sur mobile. Alléger le code et les éléments inutiles.' : 'Poids raisonnable.' });

  add({ id: 'ttfb', cat: 'mobile', label: 'Réactivité du serveur',
    status: page.ms > 1800 ? 'bad' : page.ms > 800 ? 'warn' : 'ok', detail: `Première réponse en ${(page.ms / 1000).toFixed(1).replace('.', ',')} s.`,
    advice: page.ms > 800 ? 'Le serveur met du temps à répondre : un hébergement plus performant ou un cache accélérerait tout le site.' : 'Bonne réactivité.' });

  /* --- Sécurité et conformité --- */
  const https = page.url.startsWith('https://');
  add({ id: 'https', cat: 'securite', label: 'Connexion sécurisée (cadenas)', weight: 3,
    status: https ? 'ok' : 'bad',
    detail: https ? 'Le site est servi en HTTPS.' : 'Le site n’est pas sécurisé (HTTP).',
    advice: https ? 'Rien à faire.' : 'Urgent : les navigateurs affichent « Non sécurisé », ce qui fait fuir les visiteurs et pénalise le référencement.' });

  if (extra.httpRedirects !== null) add({ id: 'redirect', cat: 'securite', label: 'Redirection vers la version sécurisée',
    status: extra.httpRedirects ? 'ok' : 'bad',
    detail: extra.httpRedirects ? 'La version non sécurisée renvoie bien vers HTTPS.' : 'La version non sécurisée reste accessible.',
    advice: extra.httpRedirects ? 'Rien à faire.' : 'Rediriger automatiquement toutes les adresses en HTTP vers HTTPS.' });

  const mixed = https ? $('img[src^="http:"], script[src^="http:"], link[href^="http:"][rel="stylesheet"], iframe[src^="http:"]').length : 0;
  if (https) add({ id: 'mixed', cat: 'securite', label: 'Éléments non sécurisés dans la page',
    status: mixed > 2 ? 'bad' : mixed ? 'warn' : 'ok', detail: mixed ? `${mixed} élément(s) chargé(s) sans sécurité.` : 'Aucun.',
    advice: mixed ? 'Certaines images ou scripts sont chargés sans HTTPS : le cadenas peut disparaître.' : 'Rien à faire.' });

  if (extra.certDays !== null) add({ id: 'cert', cat: 'securite', label: 'Certificat de sécurité', weight: 3,
    status: extra.certDays < 0 ? 'bad' : extra.certDays < 14 ? 'warn' : 'ok',
    detail: extra.certDays < 0 ? 'Le certificat est expiré : les navigateurs affichent une alerte rouge.' : `Valide encore ${extra.certDays} jour(s).`,
    advice: extra.certDays < 0 ? 'Urgent : renouveler le certificat. Aujourd’hui, la plupart des visiteurs font demi-tour devant l’alerte.' : extra.certDays < 14 ? 'Le certificat expire bientôt : vérifier que son renouvellement automatique fonctionne.' : 'Rien à faire.' });

  const H = (n: string) => page.headers.get(n) || '';
  const protections = [
    [!!H('strict-transport-security'), 'connexion sécurisée imposée (HSTS)'],
    [H('x-content-type-options').toLowerCase() === 'nosniff', 'protection contre les fichiers piégés'],
    [!!H('x-frame-options') || /frame-ancestors/i.test(H('content-security-policy')), 'protection contre l’imitation du site dans une autre page'],
    [!!H('content-security-policy'), 'liste des sources autorisées (CSP)'],
    [!!H('referrer-policy'), 'confidentialité des liens sortants'],
  ] as [boolean, string][];
  const sec = protections.filter(([on]) => on).length;
  add({ id: 'headers', cat: 'securite', label: 'Protections du serveur contre le piratage', weight: 2,
    status: sec >= 4 ? 'ok' : sec >= 2 ? 'warn' : 'bad', detail: `${sec} protection(s) sur 5 activée(s).${sec < 5 ? ` Manquantes : ${protections.filter(([on]) => !on).map(([, l]) => l).join(', ')}.` : ''}`,
    advice: sec >= 4 ? 'Rien à faire.' : 'Ces protections de base, gratuites, limitent les risques de piratage et d’usurpation du site. Elles se règlent en une fois sur l’hébergement.' });

  const leak = [H('server'), H('x-powered-by'), H('x-aspnet-version')].filter((v) => /\d+\.\d+/.test(v));
  add({ id: 'server-version', cat: 'securite', label: 'Informations techniques exposées',
    status: leak.length ? 'warn' : 'ok',
    detail: leak.length ? `Le serveur affiche publiquement ses versions de logiciels : ${leak.join(', ').slice(0, 80)}.` : 'Le serveur n’affiche pas ses versions de logiciels.',
    advice: leak.length ? 'Afficher les versions aide les pirates à cibler les failles connues. À masquer dans la configuration de l’hébergement.' : 'Rien à faire.' });

  const gen = $('meta[name="generator"]').attr('content') || '';
  const wp = gen.match(/WordPress\s+(\d+)\.(\d+)/i) || html0.match(/wp-(?:includes|content)[^"']*\?ver=(\d+)\.(\d+)/i);
  const joomla = /Joomla!?\s*(1\.|2\.|3\.)/i.test(gen);
  const oldWp = wp ? Number(wp[1]) < 6 || (Number(wp[1]) === 6 && Number(wp[2]) < 4) : false;
  if (wp || joomla) {
    const cms = joomla ? 'Joomla (ancienne version)' : `WordPress ${wp![1]}.${wp![2]}`;
    add({ id: 'old-cms', cat: 'securite', label: 'Version de l’outil de gestion du site', weight: 2,
      status: joomla || oldWp ? 'bad' : gen ? 'warn' : 'ok',
      detail: joomla || oldWp ? `Le site tourne sur ${cms}, une version qui n’est plus à jour.` : gen ? `Le site affiche publiquement sa version : ${cms}.` : `Site géré avec ${cms}.`,
      advice: joomla || oldWp ? 'Les versions anciennes ont des failles connues et sont la première cible des pirates. Mettre à jour en priorité, avec une sauvegarde.' : gen ? 'Masquer la version affichée et garder WordPress, le thème et les extensions à jour.' : 'Rien à faire, si les mises à jour sont faites régulièrement.' });
  }

  const jq = html0.match(/jquery[.-]?(\d)\.(\d+)(?:\.\d+)?(?:\.min)?\.js/i) || html0.match(/jquery(?:\.min)?\.js\?ver=(\d)\.(\d+)/i);
  const oldJq = jq ? Number(jq[1]) < 3 || (Number(jq[1]) === 3 && Number(jq[2]) < 5) : false;
  if (jq) add({ id: 'vuln-lib', cat: 'securite', label: 'Composants du site à jour', weight: 2,
    status: oldJq ? 'bad' : 'ok',
    detail: oldJq ? `Le site utilise jQuery ${jq[1]}.${jq[2]}, une version avec des failles de sécurité connues.` : `jQuery ${jq[1]}.${jq[2]} : version récente.`,
    advice: oldJq ? 'Mettre à jour cette bibliothèque : les failles des anciennes versions sont publiques et exploitées.' : 'Rien à faire.' });

  const httpForm = all.some((d) => d('form[action^="http:"]').length > 0) || (!https && all.some((d) => d('form input[type="password"], form input[type="email"], form textarea').length > 0));
  add({ id: 'form-http', cat: 'securite', label: 'Formulaires protégés', weight: 2,
    status: httpForm ? 'bad' : 'ok',
    detail: httpForm ? 'Au moins un formulaire envoie les informations des visiteurs sans chiffrement.' : 'Les formulaires envoient les données de façon chiffrée (ou le site n’a pas de formulaire).',
    advice: httpForm ? 'Les noms, e-mails et messages de vos clients circulent en clair : à corriger rapidement (obligation RGPD de sécurité).' : 'Rien à faire.' });

  const hx = page.headers as Headers & { getSetCookie?: () => string[] };
  const setCookie = typeof hx.getSetCookie === 'function' ? hx.getSetCookie() : [];
  const weakCookies = setCookie.filter((c) => !/;\s*secure/i.test(c) || !/;\s*httponly/i.test(c)).length;
  if (setCookie.length) add({ id: 'cookie-flags', cat: 'securite', label: 'Protection des cookies du site',
    status: weakCookies ? 'warn' : 'ok', detail: weakCookies ? `${weakCookies} cookie(s) sur ${setCookie.length} sans protection complète.` : 'Les cookies du site sont protégés.',
    advice: weakCookies ? 'Activer les options de protection des cookies (Secure, HttpOnly) pour éviter les vols de session.' : 'Rien à faire.' });

  const legal = /mentions[\s-]+l[ée]gales|legal|impressum/i.test(siteLinkTexts) || siteHrefs.some((h) => /mentions|legal/i.test(h));
  add({ id: 'legal', cat: 'securite', label: 'Mentions légales', weight: 2,
    status: legal ? 'ok' : 'bad', detail: legal ? 'Un lien vers les mentions légales est présent.' : 'Aucun lien vers des mentions légales.',
    advice: legal ? 'Rien à faire.' : 'Obligatoire en France pour un site professionnel : identité, adresse, hébergeur. Risque d’amende.' });

  const privacy = /confidentialit|donn[ée]es personnelles|rgpd|privacy/i.test(siteLinkTexts) || siteHrefs.some((h) => /confidential|privacy|rgpd|donnees/i.test(h));
  add({ id: 'privacy', cat: 'securite', label: 'Politique de confidentialité (RGPD)', weight: 2,
    status: privacy ? 'ok' : 'bad', detail: privacy ? 'Présente.' : `Introuvable ${where}.`,
    advice: privacy ? 'Rien à faire.' : 'Obligatoire dès qu’un formulaire ou des statistiques collectent des données (RGPD).' });

  const html = page.html;
  const trackers = /googletagmanager|google-analytics|gtag\(|fbq\(|connect\.facebook\.net|hotjar|clarity\.ms/i.test(html);
  const cmp = /tarteaucitron|axeptio|cookiebot|didomi|onetrust|cookie-consent|cookieconsent|complianz|cookie_notice|cookieyes|iubenda|klaro|sk-cookie|cookie-banner|cookie-law/i.test(html);
  if (trackers) add({ id: 'cookies', cat: 'securite', label: 'Consentement aux cookies',
    status: cmp ? 'ok' : 'warn',
    detail: cmp ? 'Des outils de suivi sont utilisés, avec un gestionnaire de consentement détecté.' : 'Des outils de suivi sont utilisés, sans gestionnaire de consentement détecté.',
    advice: cmp ? 'Vérifier que rien ne se charge avant l’accord du visiteur.' : 'Les statistiques et pixels publicitaires exigent l’accord préalable du visiteur (CNIL). À vérifier en priorité.' });

  /* --- Prise de contact --- */
  const tel = siteHrefs.some((h) => h.startsWith('tel:'));
  const phoneVisible = /(?:\+33\s?|0)[1-9](?:[\s.-]?\d{2}){4}/.test(siteBody);
  add({ id: 'phone', cat: 'contact', label: 'Téléphone visible et cliquable', weight: 2,
    status: tel ? 'ok' : phoneVisible ? 'warn' : 'bad',
    detail: tel ? 'Un numéro cliquable est présent.' : phoneVisible ? 'Un numéro est affiché, mais pas cliquable.' : `Aucun numéro de téléphone ${where}.`,
    advice: tel ? 'Rien à faire.' : phoneVisible ? 'Rendre le numéro cliquable : sur téléphone, un seul geste suffit pour vous appeler.' : 'Afficher un numéro de téléphone cliquable : c’est souvent le premier réflexe d’un client pressé.' });

  const form = all.some((d) => d('form').filter((_, f) => d(f).find('textarea, input[type="email"]').length > 0).length > 0);
  const mail = siteHrefs.some((h) => h.startsWith('mailto:'));
  add({ id: 'form', cat: 'contact', label: 'Formulaire ou e-mail de contact', weight: 2,
    status: form ? 'ok' : mail ? 'warn' : hrefs.some((h) => /contact/i.test(h)) ? 'warn' : 'bad',
    detail: form ? 'Un formulaire de contact est disponible.' : mail ? 'Seul un lien e-mail est proposé.' : hrefs.some((h) => /contact/i.test(h)) ? 'Un lien vers une page contact existe, sans formulaire.' : `Aucun moyen de contact écrit ${where}.`,
    advice: form ? 'Rien à faire.' : 'Proposer un formulaire simple (nom, e-mail, message) directement accessible : moins d’efforts, plus de demandes.' });

  const CTA = /devis|contactez|nous contacter|contact|rendez-vous|r[ée]server|r[ée]servation|appelez|demander|disponibilit/i;
  const cta = CTA.test(linkTexts + ' ' + $('button').text().toLowerCase());
  /* Visible dès l'arrivée : dans l'en-tête, le menu, ou dans le premier quart du texte de la page. */
  const ctaTop = $('header a, header button, nav a').filter((_, a) => CTA.test($(a).text())).length > 0
    || (() => { const i = lower.search(/demander un devis|devis gratuit|contactez|nous contacter|r[ée]server|prendre rendez-vous|appelez/); return i >= 0 && i < lower.length * 0.25; })();
  add({ id: 'cta', cat: 'contact', label: 'Bouton pour vous contacter dès l’arrivée', weight: 2,
    status: !cta ? 'bad' : ctaTop ? 'ok' : 'warn',
    detail: !cta ? 'Aucun bouton clair (devis, contact, rendez-vous, réservation).' : ctaTop ? 'Un bouton invite à agir dès le haut de la page.' : 'Un bouton existe, mais il faut descendre dans la page pour le trouver.',
    advice: ctaTop ? 'Rien à faire.' : 'Placer un bouton bien visible « Demander un devis », « Réserver » ou « Nous appeler » tout en haut : la plupart des visiteurs ne descendent pas.' });

  const reviews = /avis client|avis de nos|t[ée]moignage|ils nous font confiance|recommandation|[★⭐]{3,}|\b[45][,.]\d\s*\/\s*5|note (?:moyenne|google)|avis google|trustpilot|avis v[ée]rifi/i.test(siteBody) || /trustindex|elfsight|google-reviews|reviews-widget|trustpilot/i.test(html);
  add({ id: 'reviews', cat: 'contact', label: 'Avis clients visibles', weight: 2,
    status: reviews ? 'ok' : 'bad', detail: reviews ? 'Des avis ou témoignages de clients sont présentés.' : `Aucun avis client ${where}.`,
    advice: reviews ? 'Rien à faire.' : 'La grande majorité des clients lisent les avis avant de contacter une entreprise. Afficher quelques avis réels (Google ou témoignages) rassure immédiatement.' });

  const proof = /r[ée]alisations|r[ée]f[ée]rences|portfolio|nos clients|depuis (?:19|20)\d{2}|\d+\s*ans d.exp[ée]rience|certifi|qualibat|\brge\b|garantie d[ée]cennale|agr[ée][ée]|dipl[oô]m/i.test(siteBody);
  add({ id: 'proof', cat: 'contact', label: 'Preuves de sérieux',
    status: proof ? 'ok' : 'warn', detail: proof ? 'Le site montre des preuves de sérieux (réalisations, expérience, labels…).' : 'Aucune preuve de sérieux repérée (réalisations, années d’expérience, labels, garanties).',
    advice: proof ? 'Rien à faire.' : 'Montrer vos réalisations, vos années d’expérience, vos labels ou garanties : ce sont des raisons concrètes de vous faire confiance.' });

  const emails = [...new Set([...siteHrefs.filter((h) => h.startsWith('mailto:')).map((h) => h.slice(7).split('?')[0]), ...(siteBody.match(/[\w.+-]+@[\w-]+\.[\w.]+/g) || [])].map((e) => e.toLowerCase()))];
  const freeMail = emails.filter((e) => /@(gmail|hotmail|yahoo|orange|wanadoo|free|sfr|laposte|outlook|live|aol|icloud|neuf|bbox|gmx)\./i.test(e));
  if (emails.length) add({ id: 'email-pro', cat: 'contact', label: 'Adresse e-mail professionnelle',
    status: freeMail.length ? 'warn' : 'ok', detail: freeMail.length ? `Adresse affichée : ${freeMail[0]}.` : 'L’adresse e-mail utilise le nom du site.',
    advice: freeMail.length ? 'Une adresse personnelle (Gmail, Orange…) fait moins sérieux qu’une adresse à votre nom (contact@votresite.fr), et finit plus souvent en spam.' : 'Rien à faire.' });

  const address = cityList.length > 0 || /\b\d{5}\b/.test(siteBody) || all.some((d) => d('address').length > 0) || /"postalCode"/.test(jsonld);
  add({ id: 'address', cat: 'contact', label: 'Adresse ou zone d’intervention',
    status: address ? 'ok' : 'warn', detail: address ? 'Une adresse ou un code postal est visible.' : 'Aucune adresse ni zone géographique détectée.',
    advice: address ? 'Rien à faire.' : 'Indiquer votre ville et votre zone d’intervention : essentiel pour apparaître dans les recherches locales.' });

  return c;
}


export class AuditError extends Error {}

/* Repère les pages du même site : liens du menu d'abord, puis le reste de la page, puis le plan du site. */
const SKIP = /\.(pdf|jpe?g|png|gif|webp|svg|zip|docx?|xlsx?|mp4|mp3|css|js|xml|ico)$|\/(wp-admin|wp-login|wp-json|login|connexion|compte|account|panier|cart|checkout|feed|tag|author|cdn-cgi)(\/|$)/i;
type Link = { url: string; label: string };
function pageKey(u: URL) {
  const q = new URLSearchParams(u.search);
  [...q.keys()].forEach((k) => { if (/^(utm_|fbclid|gclid|lang$|ref$)/i.test(k)) q.delete(k); });
  return (u.pathname.replace(/\/$/, '') || '/') + (q.toString() ? '?' + q.toString() : '');
}
function collectLinks($: CheerioAPI, base: string): Link[] {
  const home = new URL(base);
  const host = home.hostname.replace(/^www\./, '');
  const seen = new Set([pageKey(home), '/index.html', '/index.php', '/index.htm']);
  const out: Link[] = [];
  const pick = (sel: string) => $(sel).each((_, a) => {
    const href = ($(a).attr('href') || $(a).attr('src') || '').trim();
    if (!href || /^(#|mailto:|tel:|javascript:|data:)/i.test(href)) return;
    let u: URL;
    try { u = new URL(href, base); } catch { return; }
    if (!/^https?:$/.test(u.protocol) || u.hostname.replace(/^www\./, '') !== host || SKIP.test(u.pathname)) return;
    u.hash = '';
    const key = pageKey(u);
    if (seen.has(key)) return;
    seen.add(key);
    if (/^(accueil|home|index|bienvenue)$/i.test($(a).text().trim()) || /[?&]page=(accueil|home|index)\b/i.test(u.search)) return;
    const own = $(a).clone(); own.find('*').each((_, e) => { $(e).append(' '); });
    const firstLine = ($(a).attr('title') || own.find('strong, b, h2, h3, h4, span').first().text() || own.text()).replace(/\s+/g, ' ').trim();
    const label = firstLine.slice(0, 40) || decodeURIComponent(key.split(/[/?=&]/).filter(Boolean).pop() || key).replace(/[-_]/g, ' ').replace(/\.(html?|php)$/, '');
    out.push({ url: u.toString(), label });
  });
  pick('header a[href], nav a[href], [role="navigation"] a[href], [class*="menu"] a[href]');
  pick('a[href], area[href], frame[src], iframe[src]');
  return out;
}
/* La page de contact passe en premier : c'est elle qui décide si le client vous écrit. */
function choosePages(links: Link[], max = 5) {
  const isContact = (p: Link) => /contact|joindre|devis|rendez|ecrire|écrire|r[ée]serv/i.test(p.label + ' ' + p.url);
  return [...links.filter(isContact).slice(0, 1), ...links.filter((p) => !isContact(p))].slice(0, max);
}
function sitemapLinks(xml: string, base: string): Link[] {
  const host = new URL(base).hostname.replace(/^www\./, '');
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]).filter((u) => {
    try { const x = new URL(u); return x.hostname.replace(/^www\./, '') === host && !SKIP.test(x.pathname) && !/\.xml$/i.test(x.pathname); } catch { return false; }
  }).slice(0, 60).map((u) => ({ url: u, label: decodeURIComponent(new URL(u).pathname.split('/').filter(Boolean).pop() || 'page').replace(/[-_]/g, ' ').replace(/\.(html?|php)$/, '') }));
}

async function readSubPages(list: Link[]): Promise<{ pages: SubPage[]; broken: string[] }> {
  const broken: string[] = [];
  const pages = await Promise.all(list.map(async (p) => {
    try {
      const pg = await fetchPage(p.url, 3);
      if (pg.status >= 400) { broken.push(p.label || new URL(p.url).pathname); return null; }
      if (!/<html|<body|<title/i.test(pg.html.slice(0, 5000))) return null;
      return { url: pg.url, label: p.label, $: load(pg.html), bytes: pg.bytes };
    } catch { return null; }
  }));
  return { pages: pages.filter((p): p is SubPage & { bytes: number } => p !== null), broken };
}

/* Poids réel des images de la page d'accueil (jusqu'à 20 images). */
async function imageWeights($: CheerioAPI, base: string) {
  const srcs = [...new Set($('img').map((_, i) => $(i).attr('src') || $(i).attr('data-src') || '').get().filter((x) => x && !x.startsWith('data:')))].slice(0, 20);
  if (!srcs.length) return null;
  const sizes = await Promise.all(srcs.map(async (src) => {
    try {
      const u = new URL(src, base);
      await assertPublic(u);
      const r = await fetch(u, { method: 'HEAD', headers: { 'User-Agent': UA }, redirect: 'follow', signal: AbortSignal.timeout(6000) });
      const n = Number(r.headers.get('content-length') || 0);
      return r.ok && n > 0 ? Math.round(n / 1024) : null;
    } catch { return null; }
  }));
  const ok = sizes.filter((n): n is number => n !== null);
  if (!ok.length) return null;
  return { count: ok.length, heavy: ok.filter((n) => n > 300).length, biggestKb: Math.max(...ok), totalKb: ok.reduce((a, b) => a + b, 0) };
}

/* Jours restants avant l'expiration du certificat HTTPS. */
function certDays(host: string): Promise<number | null> {
  return new Promise((resolve) => {
    try {
      const sock = tls.connect({ host, port: 443, servername: host, rejectUnauthorized: false, timeout: 6000 }, () => {
        const c = sock.getPeerCertificate();
        sock.end();
        resolve(c && c.valid_to ? Math.floor((new Date(c.valid_to).getTime() - Date.now()) / 86400000) : null);
      });
      sock.on('error', () => resolve(null));
      sock.on('timeout', () => { sock.destroy(); resolve(null); });
    } catch { resolve(null); }
  });
}

export async function runAudit(input: string): Promise<AuditResult> {
  let raw = input.trim().slice(0, 300);
  if (!raw) throw new AuditError('Adresse manquante');
  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;
  let page: Page;
  try {
    page = await fetchPage(raw);
  } catch (e) {
    if (raw.startsWith('https://')) page = await fetchPage(raw.replace(/^https:/, 'http:'));
    else throw e;
  }
  if (page.status >= 400) throw new AuditError(`Le site répond avec une erreur ${page.status}`);
  let $ = load(page.html);
  /* Site en cadres (frames) : le vrai contenu est dans le cadre principal. */
  const frameSrc = $('frame[src], iframe[src]').map((_, f) => $(f).attr('src') || '').get().find((src) => {
    try { return new URL(src, page.url).hostname === new URL(page.url).hostname; } catch { return false; }
  });
  let contentHtml = page.html;
  if (frameSrc && text($).split(' ').length < 60) {
    try { const fp = await fetchPage(new URL(frameSrc, page.url).toString(), 3); if (fp.status < 400) { contentHtml = fp.html; } } catch { /* on garde la page d'origine */ }
  }
  const $c = contentHtml === page.html ? $ : load(contentHtml);
  const origin = new URL(page.url).origin;
  const host = new URL(page.url).hostname;

  const [robots, smap] = await Promise.all([exists(`${origin}/robots.txt`), exists(`${origin}/sitemap.xml`)]);
  const smap2 = smap.ok ? smap : await exists(`${origin}/sitemap_index.xml`);
  let links = [...collectLinks($, page.url), ...($c !== $ ? collectLinks($c, page.url) : [])];
  const fromMap = smap2.ok ? sitemapLinks(smap2.text, page.url) : [];
  const known = new Set(links.map((l) => pageKey(new URL(l.url))));
  for (const l of fromMap) { const k = pageKey(new URL(l.url)); if (!known.has(k)) { known.add(k); links.push(l); } }
  links = links.filter((l, i, arr) => arr.findIndex((x) => x.url === l.url) === i);

  const [sub, httpRes, images, cert] = await Promise.all([
    readSubPages(choosePages(links)),
    (async () => {
      if (!page.url.startsWith('https://')) return null;
      try {
        const u = new URL(page.url.replace(/^https:/, 'http:'));
        await assertPublic(u);
        const r = await fetch(u, { redirect: 'manual', headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(8000) });
        return r.status >= 300 && r.status < 400 && (r.headers.get('location') || '').startsWith('https://');
      } catch { return null; }
    })(),
    imageWeights($c, page.url),
    page.url.startsWith('https://') ? certDays(host) : Promise.resolve(null),
  ]);
  const subs = sub.pages;
  const robotsTxt = robots.ok && /sitemap:/i.test(robots.text) ? true : smap2.ok;
  const analysed: Page = { ...page, html: contentHtml };
  const detail = (d: CheerioAPI, url: string, label: string) => ({
    label, path: new URL(url).pathname + new URL(url).search,
    title: d('head > title').first().text().replace(/\s+/g, ' ').trim(),
    description: !!(d('meta[name="description"]').attr('content') || '').trim(),
    h1: d('h1').first().text().replace(/\s+/g, ' ').trim().slice(0, 90),
    words: (text(d) || '').split(' ').filter(Boolean).length,
  });
  const result: AuditResult = {
    url: page.url,
    host: host.replace(/^www\./, ''),
    fetchedAt: new Date().toISOString(),
    title: $('head > title').first().text().trim() || $c('head > title').first().text().trim(),
    checks: analyse(analysed, $c, { robots, sitemap: robotsTxt, httpRedirects: httpRes, internalPages: links.length, broken: sub.broken, images, certDays: cert }, subs),
    pages: [{ url: page.url, label: 'Accueil' }, ...subs.map((p) => ({ url: p.url, label: p.label }))],
    pagesDetail: [detail($c, page.url, 'Accueil'), ...subs.map((p) => detail(p.$, p.url, p.label))],
    content: {
      description: $('meta[name="description"]').attr('content')?.trim() || '',
      h1: $c('h1').first().text().replace(/\s+/g, ' ').trim(),
      h2: $c('h2').map((_, h) => $c(h).text().replace(/\s+/g, ' ').trim()).get().filter(Boolean).slice(0, 20),
      ctas: [...new Set($c('a, button').map((_, a) => $c(a).text().replace(/\s+/g, ' ').trim()).get().filter((t) => t.length > 2 && t.length < 60))].slice(0, 40),
      text: text($c).slice(0, 1500),
      siteMap: links.slice(0, 60).map((l) => `${l.label} (${new URL(l.url).pathname})`).join(' | ').slice(0, 4000),
      outline: [{ label: 'Accueil', d: $c }, ...subs.map((p) => ({ label: p.label, d: p.$ }))].map(({ label, d }) => {
        const hs = d('h1,h2,h3').map((_, h) => `${h.tagName.toUpperCase()} ${d(h).text().replace(/\s+/g, ' ').trim().slice(0, 80)}`).get().slice(0, 25);
        const links = d('main a[href], article a[href], section a[href], p a[href]').map((_, a) => d(a).text().replace(/\s+/g, ' ').trim().slice(0, 40)).get().filter(Boolean).slice(0, 12);
        return `--- ${label} ---\n${hs.join('\n') || '(aucun titre)'}\nLiens dans le contenu : ${links.join(' | ') || '(aucun)'}`;
      }).join('\n').slice(0, 6000),
    },
  };
  return result;
}

/* Mesure Google PageSpeed (téléphone), côté serveur. Clé facultative : PSI_API_KEY. */
export async function pageSpeedServer(url: string, strategy: 'mobile' | 'desktop' = 'mobile'): Promise<Speed | null> {
  const p = new URLSearchParams({ url, strategy, locale: 'fr' });
  ['performance', 'accessibility', 'seo', 'best-practices'].forEach((c) => p.append('category', c));
  const key = process.env.PSI_API_KEY || process.env.NEXT_PUBLIC_PSI_KEY;
  if (key) p.set('key', key);
  try {
    let r = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${p}`, { signal: AbortSignal.timeout(50000) });
    if (!r.ok && r.status !== 400) { await new Promise((ok) => setTimeout(ok, 1500)); r = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${p}`, { signal: AbortSignal.timeout(40000) }); }
    if (!r.ok) { console.error('PageSpeed', strategy, r.status, (await r.text()).slice(0, 200)); return null; }
    const d = await r.json();
    const cat = d.lighthouseResult?.categories || {};
    const a = d.lighthouseResult?.audits || {};
    const s = (x: { score?: number } | undefined) => (x && typeof x.score === 'number' ? Math.round(x.score * 100) : null);
    return { strategy, performance: s(cat.performance), accessibility: s(cat.accessibility), seo: s(cat.seo), bestPractices: s(cat['best-practices']),
      lcp: a['largest-contentful-paint']?.displayValue || '–', cls: a['cumulative-layout-shift']?.displayValue || '–', fcp: a['first-contentful-paint']?.displayValue || '–', tbt: a['total-blocking-time']?.displayValue || '–',
      screenshot: typeof a['final-screenshot']?.details?.data === 'string' && a['final-screenshot'].details.data.length < 400000 ? a['final-screenshot'].details.data : undefined };
  } catch { return null; }
}


/* ===================== Analyse des textes et de l'apparence par l'IA (Claude) ===================== */
const SYSTEM = `Tu es un consultant SEO exigeant qui audite des sites de TPE et PME pour SEOKRAFT, studio web à Strasbourg. Tu juges si le site peut être trouvé sur Google par les clients qu'il vise, et s'il donne envie de contacter l'entreprise une fois trouvé.
Règles :
- Tu t'appuies UNIQUEMENT sur les éléments fournis (titres Google, descriptions, titres H1/H2/H3, liens, court extrait, captures). Tu n'inventes rien. Si une information manque, tu le dis.
- Tu es franc et précis, jamais complaisant. Tu cites des exemples concrets tirés du site (un titre, un intertitre, un lien).
- Tu écris en français simple, compréhensible par un artisan ou un commerçant : pas de jargon (dis « titre principal » plutôt que « H1 », « liens entre les pages » plutôt que « maillage »), vouvoiement.
- Tu réponds UNIQUEMENT avec un objet JSON valide, sans texte autour.`;

function reviewPrompt(r: AuditResult, shots: number) {
  const c = r.content!;
  const pages = (r.pagesDetail ?? []).map((p) => `- ${p.label} (${p.path}) : titre Google « ${p.title || 'aucun'} », description ${p.description ? 'présente' : 'absente'}, ${p.words} mots`).join('\n');
  return `Site analysé : ${r.url}
${shots ? `Captures jointes : ${shots === 2 ? 'la page d’accueil sur téléphone, puis sur ordinateur' : 'la page d’accueil'}.` : 'Aucune capture disponible : ne juge pas l’apparence.'}
Titre Google de l'accueil : ${r.title || '(aucun)'}
Description Google de l'accueil : ${c.description || '(aucune)'}
Pages lues en détail :
${pages || '- accueil uniquement'}

Toutes les pages du site trouvées dans les liens et le plan du site (${(c.siteMap || '').split(' | ').filter(Boolean).length} pages) :
${c.siteMap || '(aucune autre page)'}

Structure de chaque page (titres H1, H2, H3 et liens dans le contenu) :
${c.outline || '(non disponible)'}

Boutons et liens de l'accueil : ${c.ctas.slice(0, 25).join(' | ') || '(aucun)'}
Début du texte de l'accueil : """${c.text.slice(0, 1500)}"""

Audite le référencement : le métier, les services et la ville que tapent les clients apparaissent-ils dans les titres Google et les titres de page ? Chaque service a-t-il sa page ? Les pages sont-elles reliées par des liens parlants ? Le visiteur comprend-il vite quoi, où, et comment contacter ?

Barème STRICT de la note (sur 20) :
- 17 à 20 : exceptionnel, rare. Titres optimisés métier + ville, une page par service, liens parlants, message limpide.
- 13 à 16 : bon référencement avec des manques réels.
- 9 à 12 : moyen. Titres vagues ou incomplets, peu de pages, peu de liens.
- 5 à 8 : faible. Titres sans métier ni ville, structure absente.
- 0 à 4 : le site ne peut pas être trouvé sur Google.
Si ni le métier ni la ville ne sont dans le titre Google de l'accueil, la note ne dépasse pas 9.
IMPORTANT : vérifie dans la liste de toutes les pages avant d'affirmer qu'une page manque. N'écris jamais « non vérifié » ni « semble » : si tu n'es pas sûr d'un problème, ne le cite pas.
Niveau « critique » UNIQUEMENT pour un défaut qui fait perdre des clients de façon certaine (impossible de trouver le métier, la ville ou le contact). Un site déjà bien construit n'a pas de point critique.

Réponds avec ce JSON exactement (réponse courte, sans retour à la ligne dans les textes) :
{
  "score": nombre de 0 à 20 (demi-points autorisés),
  "essentiel": "3 phrases franches : ce que vaut le site pour être trouvé et choisi, ce que cela lui fait perdre, la priorité n°1",
  "impression": "${shots ? '2 phrases sur la première impression visuelle d’après les captures : moderne ou daté, soigné ou amateur, lisible sur téléphone' : ''}",
  "constats": [ exactement 6 objets { "question": "question courte", "reponse": "constat franc en moins de 14 mots, avec un exemple du site" } pour : le titre Google dit-il le métier et la ville ; chaque service a-t-il sa page ; les titres de page sont-ils clairs ; les pages sont-elles reliées entre elles ; comprend-on le métier en 5 secondes ; sait-on comment contacter ],
  "priorities": [ 3 objets { "level": "critique" | "important" | "planifier", "title": "titre court compréhensible par un non-spécialiste", "text": "2 phrases courtes, 280 caractères maximum : le problème (avec un exemple du site) et ce qu'il faut faire" } ],
  "positives": [ 0 à 2 points forts RÉELS et significatifs. Tableau vide si rien ne mérite d'être salué. ]
}`;
}

export async function reviewTexts(r: AuditResult, shots: string[] = []): Promise<{ review: TextReview | null; error: string }> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return { review: null, error: 'clé ANTHROPIC_API_KEY absente dans Vercel' };
  if (!r.content || r.content.text.length < 40) return { review: null, error: 'trop peu de texte lisible sur le site' };
  const images = shots.map((d) => d.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/)).filter((m): m is RegExpMatchArray => !!m)
    .map((m) => ({ type: 'image', source: { type: 'base64', media_type: m[1], data: m[2] } }));
  const ask = async (timeoutMs: number) => {
    const res = await fetch(`${process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com'}/v1/messages`, {
      method: 'POST',
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: process.env.AUDIT_AI_MODEL || 'claude-sonnet-5-5', max_tokens: 4000, system: SYSTEM,
        messages: [{ role: 'user', content: [...images, { type: 'text', text: reviewPrompt(r, images.length) }] }] }),
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) {
      const body = (await res.text()).slice(0, 300);
      console.error('IA audit', res.status, body);
      const why = /credit balance|billing/i.test(body) ? 'crédit épuisé sur console.anthropic.com' : res.status === 401 ? 'clé API refusée' : res.status === 404 ? 'modèle introuvable' : res.status === 429 || res.status === 529 ? 'service surchargé, réessayer' : `erreur ${res.status}`;
      return { fatal: why };
    }
    const d = await res.json();
    const raw = ((d.content || []) as { type: string; text?: string }[]).filter((x) => x.type === 'text').map((x) => x.text || '').join('').trim();
    return { raw, stop: String(d.stop_reason || '') };
  };
  /* Lecture tolérante : retire les balises de code et les retours à la ligne glissés dans les textes. */
  const parse = (raw: string) => {
    const body = raw.replace(/```(?:json)?/gi, '');
    const chunk = body.slice(body.indexOf('{'), body.lastIndexOf('}') + 1);
    try { return JSON.parse(chunk); } catch { return JSON.parse(chunk.replace(/[\r\n\t]+/g, ' ')); }
  };
  const t0 = Date.now();
  let lastError = 'réponse illisible';
  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt === 1 && Date.now() - t0 > 60000) break;
    try {
      const out = await ask(attempt === 0 ? 75000 : 55000);
      if ('fatal' in out) return { review: null, error: out.fatal as string };
      let json: Record<string, unknown>;
      try { json = parse(out.raw); } catch {
        console.error('IA audit illisible', out.stop, out.raw.slice(0, 400));
        lastError = out.stop === 'max_tokens' ? 'réponse trop longue, coupée' : 'réponse illisible';
        continue;
      }
      /* Coupe proprement à la fin d'une phrase, jamais au milieu d'un mot. */
      const str = (v: unknown, n: number) => {
        if (typeof v !== 'string') return '';
        const t = v.replace(/\s+/g, ' ').trim();
        if (t.length <= n) return t;
        const cut = t.slice(0, n);
        const end = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
        return end > n * 0.4 ? cut.slice(0, end + 1) : cut.slice(0, cut.lastIndexOf(' ')) + '…';
      };
      const levels: Level[] = ['critique', 'important', 'planifier'];
      const arr = (v: unknown) => (Array.isArray(v) ? v : []);
      return { error: '', review: {
        score: Math.max(0, Math.min(20, Number(json.score) || 0)),
        essentiel: str(json.essentiel, 1000),
        impression: images.length ? str(json.impression, 600) : '',
        constats: arr(json.constats).slice(0, 6).map((x: Record<string, unknown>) => ({ question: str(x.question, 160), reponse: str(x.reponse, 160) })).filter((x: { question: string }) => x.question),
        priorities: arr(json.priorities).slice(0, 4).map((x: Record<string, unknown>) => ({ level: levels.includes(x.level as Level) ? (x.level as Level) : 'important', title: str(x.title, 120), text: str(x.text, 700) })).filter((x: { title: string }) => x.title),
        positives: arr(json.positives).slice(0, 3).map((x: unknown) => str(x, 200)).filter(Boolean),
      } };
    } catch (e) {
      console.error('IA audit', e instanceof Error ? e.message : e);
      lastError = e instanceof Error && /timeout|abort/i.test(e.name + e.message) ? 'délai dépassé' : `erreur de connexion (${e instanceof Error ? e.message.slice(0, 60) : 'inconnue'})`;
    }
  }
  return { review: null, error: lastError };
}

/* ===================== Stockage des bulletins ===================== */
/* En ligne : Vercel Blob (variable BLOB_READ_WRITE_TOKEN). En local : dossier .data/bulletins. */
const LOCAL_DIR = path.join(process.cwd(), '.data', 'bulletins');
export const validId = (id: string) => /^[a-f0-9]{24}$/.test(id);

export async function saveBulletin(b: Bulletin) {
  const body = JSON.stringify(b);
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import('@vercel/blob');
    await put(`bulletins/${b.id}.json`, body, { access: 'public', addRandomSuffix: false, contentType: 'application/json' });
    return;
  }
  await fs.mkdir(LOCAL_DIR, { recursive: true });
  await fs.writeFile(path.join(LOCAL_DIR, `${b.id}.json`), body);
}

export async function loadBulletin(id: string): Promise<Bulletin | null> {
  if (!validId(id)) return null;
  try {
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { head } = await import('@vercel/blob');
      const meta = await head(`bulletins/${id}.json`);
      const r = await fetch(meta.url, { cache: 'no-store' });
      return r.ok ? ((await r.json()) as Bulletin) : null;
    }
    return JSON.parse(await fs.readFile(path.join(LOCAL_DIR, `${id}.json`), 'utf8')) as Bulletin;
  } catch {
    return null;
  }
}

/* Audit complet : technique, puis mesures Google (téléphone + ordinateur, avec captures), puis lecture par l'IA avec les captures. */
export type AuditRun = { bulletin: Bulletin; aiError: string; speedError: boolean };
export async function createBulletin(url: string): Promise<AuditRun> {
  const result = await runAudit(url);
  const [speed, desktop] = await Promise.all([pageSpeedServer(result.url, 'mobile'), pageSpeedServer(result.url, 'desktop')]);
  const shots = [speed?.screenshot, desktop?.screenshot].filter((x): x is string => !!x);
  const { review, error } = await reviewTexts(result, shots);
  const b = buildBulletin(randomBytes(12).toString('hex'), result, speed, review, desktop);
  if (desktop?.screenshot) b.desktopScreenshot = desktop.screenshot;
  if (b.speedDesktop) b.speedDesktop = { ...b.speedDesktop, screenshot: undefined };
  await saveBulletin(b);
  return { bulletin: b, aiError: error, speedError: !speed || speed.performance === null };
}

/* ===================== Quotas des audits publics ===================== */
/* Protège le crédit IA : une même adresse de site au plus 2 fois, une même adresse e-mail au plus 3 fois,
   et un plafond d'audits publics par jour (AUDIT_DAILY_MAX, 20 par défaut). Chaque audit laisse une petite trace
   dans le stockage (empreinte, jamais l'adresse en clair), que l'on compte ensuite. */
const QUOTA_DIR = path.join(process.cwd(), '.data', 'quota');
const fingerprint = (v: string) => createHash('sha256').update(`seokraft:${v.toLowerCase().trim()}`).digest('hex').slice(0, 32);
export const siteKey = (url: string) => { try { return new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`).hostname.replace(/^www\./, '').toLowerCase(); } catch { return url.toLowerCase(); } };

async function countMarks(prefix: string): Promise<number> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { list } = await import('@vercel/blob');
    const r = await list({ prefix, limit: 100 });
    return r.blobs.length;
  }
  try { return (await fs.readdir(path.join(QUOTA_DIR, prefix))).length; } catch { return 0; }
}
async function addMark(prefix: string) {
  const name = `${Date.now()}-${randomBytes(4).toString('hex')}`;
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import('@vercel/blob');
    await put(`${prefix}${name}.txt`, '1', { access: 'public', addRandomSuffix: false, contentType: 'text/plain' });
    return;
  }
  await fs.mkdir(path.join(QUOTA_DIR, prefix), { recursive: true });
  await fs.writeFile(path.join(QUOTA_DIR, prefix, name), '1');
}

export type QuotaResult = { ok: true } | { ok: false; reason: string };
export async function checkAndRecordQuota(url: string, email: string): Promise<QuotaResult> {
  const day = new Date().toISOString().slice(0, 10);
  const site = `quota/site/${fingerprint(siteKey(url))}/`;
  const mail = `quota/mail/${fingerprint(email)}/`;
  const daily = `quota/day/${day}/`;
  const max = Number(process.env.AUDIT_DAILY_MAX) || 20;
  try {
    const [s, m, d] = await Promise.all([countMarks(site), countMarks(mail), countMarks(daily)]);
    if (s >= 2) return { ok: false, reason: `ce site a déjà été audité ${s} fois` };
    if (m >= 3) return { ok: false, reason: `cette adresse e-mail a déjà demandé ${m} audits` };
    if (d >= max) return { ok: false, reason: `plafond de ${max} audits publics atteint aujourd’hui` };
    await Promise.all([addMark(site), addMark(mail), addMark(daily)]);
    return { ok: true };
  } catch (e) {
    /* En cas de panne du stockage, on ne dépense rien : l'audit sera lancé à la main. */
    console.error('Quota audit', e instanceof Error ? e.message : e);
    return { ok: false, reason: 'vérification des quotas indisponible' };
  }
}
