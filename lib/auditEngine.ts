import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import { load, type CheerioAPI } from 'cheerio';
import { randomBytes } from 'node:crypto';
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
const text = ($: CheerioAPI) => $('body').clone().find('script,style,noscript,svg').remove().end().text().replace(/\s+/g, ' ').trim();

type SubPage = { url: string; label: string; $: CheerioAPI };

function analyse(page: Page, $: CheerioAPI, extra: { robots: { ok: boolean; text: string }; sitemap: boolean; httpRedirects: boolean | null }, subs: SubPage[] = []): Check[] {
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
  const title = $('head > title').first().text().trim();
  add({ id: 'title', cat: 'google', label: 'Titre de la page pour Google', weight: 2,
    status: !title ? 'bad' : title.length < 25 || title.length > 65 ? 'warn' : 'ok',
    detail: !title ? 'Aucun titre n’est défini.' : `« ${title.slice(0, 90)} » (${title.length} caractères).`,
    advice: !title ? 'Ajouter un titre qui contient votre métier et votre ville : c’est la ligne bleue cliquable dans Google.' : title.length < 25 ? 'Titre trop court : précisez votre métier et votre ville pour être trouvé sur les bonnes recherches.' : title.length > 65 ? 'Titre trop long : Google le coupe. Gardez l’essentiel (métier + ville) en moins de 60 caractères.' : 'Bonne longueur. Vérifiez qu’il contient bien votre métier et votre ville.' });

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
    status: words < 150 ? 'bad' : words < 350 ? 'warn' : 'ok',
    detail: `Environ ${words} mots.`,
    advice: words < 150 ? 'Très peu de texte : Google a du mal à comprendre ce que vous faites. Présentez vos services, votre zone et ce qui vous distingue.' : words < 350 ? 'Texte un peu léger : développez vos services et répondez aux questions de vos clients.' : 'Volume de texte suffisant.' });

  const imgs = $('img');
  const noAlt = imgs.filter((_, i) => !($(i).attr('alt') || '').trim()).length;
  add({ id: 'alt', cat: 'contenu', label: 'Description des images',
    status: imgs.length === 0 ? 'warn' : noAlt === 0 ? 'ok' : noAlt / imgs.length > 0.5 ? 'bad' : 'warn',
    detail: imgs.length === 0 ? 'Aucune image sur la page.' : `${noAlt} image(s) sur ${imgs.length} sans description.`,
    advice: imgs.length === 0 ? 'Ajouter des photos réelles de votre activité : elles rassurent et retiennent les visiteurs.' : noAlt === 0 ? 'Rien à faire.' : 'Décrire chaque image : Google Images peut alors vous faire apparaître, et le site devient accessible aux malvoyants.' });

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
    status: lastYear === null ? 'ok' : lastYear >= year - 1 ? 'ok' : 'warn',
    detail: lastYear === null ? 'Aucune date visible.' : `Date affichée en bas de page : ${lastYear}.`,
    advice: lastYear !== null && lastYear < year - 1 ? 'Une date ancienne donne l’impression d’un site abandonné : mettez-la à jour.' : 'Rien à faire.' });

  /* --- Mobile et vitesse (la vitesse détaillée vient de Google PageSpeed) --- */
  const viewport = $('meta[name="viewport"]').attr('content') || '';
  add({ id: 'viewport', cat: 'mobile', label: 'Adaptation au téléphone', weight: 3,
    status: viewport.includes('width=device-width') ? 'ok' : 'bad',
    detail: viewport.includes('width=device-width') ? 'Le site s’adapte à la taille de l’écran.' : 'Le site n’est pas configuré pour les téléphones.',
    advice: viewport.includes('width=device-width') ? 'Rien à faire.' : 'Urgent : la majorité des visiteurs arrivent sur téléphone. Le site doit s’adapter à leur écran.' });

  const kb = Math.round(page.bytes / 1024);
  add({ id: 'weight', cat: 'mobile', label: 'Poids du code de la page',
    status: kb > 600 ? 'bad' : kb > 250 ? 'warn' : 'ok', detail: `${kb} Ko.`,
    advice: kb > 250 ? 'Page lourde : elle se charge lentement sur mobile. Alléger le code et les éléments inutiles.' : 'Poids raisonnable.' });

  add({ id: 'ttfb', cat: 'mobile', label: 'Réactivité du serveur',
    status: page.ms > 1800 ? 'bad' : page.ms > 800 ? 'warn' : 'ok', detail: `Première réponse en ${(page.ms / 1000).toFixed(1)} s.`,
    advice: page.ms > 800 ? 'Le serveur met du temps à répondre : un hébergement plus performant ou un cache accélérerait tout le site.' : 'Bonne réactivité.' });

  /* --- Sécurité et conformité --- */
  const https = page.url.startsWith('https://');
  add({ id: 'https', cat: 'securite', label: 'Connexion sécurisée (cadenas)', weight: 3,
    status: https ? 'ok' : 'bad',
    detail: https ? 'Le site est servi en HTTPS.' : 'Le site n’est pas sécurisé (HTTP).',
    advice: https ? 'Rien à faire.' : 'Urgent : les navigateurs affichent « Non sécurisé », ce qui fait fuir les visiteurs et pénalise le référencement.' });

  if (extra.httpRedirects !== null) add({ id: 'redirect', cat: 'securite', label: 'Redirection vers la version sécurisée',
    status: extra.httpRedirects ? 'ok' : 'warn',
    detail: extra.httpRedirects ? 'La version non sécurisée renvoie bien vers HTTPS.' : 'La version non sécurisée reste accessible.',
    advice: extra.httpRedirects ? 'Rien à faire.' : 'Rediriger automatiquement toutes les adresses en HTTP vers HTTPS.' });

  const mixed = https ? $('img[src^="http:"], script[src^="http:"], link[href^="http:"][rel="stylesheet"], iframe[src^="http:"]').length : 0;
  if (https) add({ id: 'mixed', cat: 'securite', label: 'Éléments non sécurisés dans la page',
    status: mixed ? 'warn' : 'ok', detail: mixed ? `${mixed} élément(s) chargé(s) sans sécurité.` : 'Aucun.',
    advice: mixed ? 'Certaines images ou scripts sont chargés sans HTTPS : le cadenas peut disparaître.' : 'Rien à faire.' });

  const hsts = !!page.headers.get('strict-transport-security');
  const nosniff = (page.headers.get('x-content-type-options') || '').toLowerCase() === 'nosniff';
  const frame = !!page.headers.get('x-frame-options') || /frame-ancestors/i.test(page.headers.get('content-security-policy') || '');
  const sec = [hsts, nosniff, frame].filter(Boolean).length;
  add({ id: 'headers', cat: 'securite', label: 'Protections techniques du serveur',
    status: sec === 3 ? 'ok' : sec >= 1 ? 'warn' : 'bad', detail: `${sec} protection(s) sur 3 activée(s).`,
    advice: sec === 3 ? 'Rien à faire.' : 'Activer les protections de base (HSTS, anti-détournement, anti-intégration) pour limiter les risques de piratage.' });

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

  const cta = /devis|contactez|contact|rendez-vous|r[ée]server|appelez|demander/i.test(linkTexts + ' ' + $('button').text().toLowerCase());
  add({ id: 'cta', cat: 'contact', label: 'Bouton d’appel à l’action',
    status: cta ? 'ok' : 'bad', detail: cta ? 'Un bouton invite le visiteur à agir.' : 'Aucun bouton clair (devis, contact, rendez-vous).',
    advice: cta ? 'Vérifier qu’il est visible dès l’arrivée sur la page, sans faire défiler.' : 'Ajouter un bouton visible « Demander un devis » ou « Nous contacter » en haut de page.' });

  const address = /\b\d{5}\b/.test(siteBody) || all.some((d) => d('address').length > 0) || /"postalCode"/.test(jsonld);
  add({ id: 'address', cat: 'contact', label: 'Adresse ou zone d’intervention',
    status: address ? 'ok' : 'warn', detail: address ? 'Une adresse ou un code postal est visible.' : 'Aucune adresse ni zone géographique détectée.',
    advice: address ? 'Rien à faire.' : 'Indiquer votre ville et votre zone d’intervention : essentiel pour apparaître dans les recherches locales.' });

  return c;
}


export class AuditError extends Error {}

/* Repère jusqu'à 4 pages principales du même site : liens du menu d'abord, puis le reste de la page. */
const SKIP = /\.(pdf|jpe?g|png|gif|webp|svg|zip|docx?|xlsx?|mp4|mp3)$|\/(wp-admin|wp-login|login|connexion|compte|account|panier|cart|checkout|feed|tag|author)(\/|$)/i;
function discoverPages($: CheerioAPI, base: string, max = 4) {
  const limit = 12;
  const home = new URL(base);
  const host = home.hostname.replace(/^www\./, '');
  const seen = new Set([home.pathname.replace(/\/$/, '') || '/']);
  const out: { url: string; label: string }[] = [];
  const pick = (sel: string) => $(sel).each((_, a) => {
    if (out.length >= limit) return;
    const href = ($(a).attr('href') || '').trim();
    if (!href || /^(#|mailto:|tel:|javascript:)/i.test(href)) return;
    let u: URL;
    try { u = new URL(href, base); } catch { return; }
    if (!/^https?:$/.test(u.protocol) || u.hostname.replace(/^www\./, '') !== host || SKIP.test(u.pathname)) return;
    const key = u.pathname.replace(/\/$/, '') || '/';
    if (seen.has(key)) return;
    seen.add(key);
    u.hash = ''; u.search = '';
    const label = $(a).text().replace(/\s+/g, ' ').trim().slice(0, 40) || decodeURIComponent(key.split('/').filter(Boolean).pop() || key).replace(/[-_]/g, ' ');
    out.push({ url: u.toString(), label });
  });
  pick('header a[href], nav a[href], [role="navigation"] a[href]');
  pick('a[href]');
  /* La page de contact passe en premier : c'est elle qui décide si le client vous écrit. */
  const isContact = (p: { url: string; label: string }) => /contact|joindre|devis|rendez|ecrire|écrire/i.test(p.label + ' ' + p.url);
  return [...out.filter(isContact).slice(0, 1), ...out.filter((p) => !isContact(p))].slice(0, max);
}

async function readSubPages(list: { url: string; label: string }[]): Promise<SubPage[]> {
  const pages = await Promise.all(list.map(async (p) => {
    try {
      const pg = await fetchPage(p.url, 3);
      if (pg.status >= 400 || !/<html|<body|<title/i.test(pg.html.slice(0, 5000))) return null;
      return { url: pg.url, label: p.label, $: load(pg.html) };
    } catch { return null; }
  }));
  return pages.filter((p): p is SubPage => p !== null);
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
    const $ = load(page.html);
    const origin = new URL(page.url).origin;
    const [subs, robots, sitemap, httpRes] = await Promise.all([
      readSubPages(discoverPages($, page.url)),
      exists(`${origin}/robots.txt`),
      exists(`${origin}/sitemap.xml`).then(async (r) => r.ok || (await exists(`${origin}/sitemap_index.xml`)).ok),
      (async () => {
        if (!page.url.startsWith('https://')) return null;
        try {
          const u = new URL(page.url.replace(/^https:/, 'http:'));
          await assertPublic(u);
          const r = await fetch(u, { redirect: 'manual', headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(8000) });
          return r.status >= 300 && r.status < 400 && (r.headers.get('location') || '').startsWith('https://');
        } catch { return null; }
      })(),
    ]);
    const robotsTxt = robots.ok && /sitemap:/i.test(robots.text) ? true : sitemap;
    const result: AuditResult = {
      url: page.url,
      host: new URL(page.url).hostname.replace(/^www\./, ''),
      fetchedAt: new Date().toISOString(),
      title: $('head > title').first().text().trim(),
      checks: analyse(page, $, { robots, sitemap: robotsTxt, httpRedirects: httpRes }, subs),
      pages: [{ url: page.url, label: 'Accueil' }, ...subs.map((p) => ({ url: p.url, label: p.label }))],
      content: {
        description: $('meta[name="description"]').attr('content')?.trim() || '',
        h1: $('h1').first().text().replace(/\s+/g, ' ').trim(),
        h2: $('h2').map((_, h) => $(h).text().replace(/\s+/g, ' ').trim()).get().filter(Boolean).slice(0, 20),
        ctas: [...new Set($('a, button').map((_, a) => $(a).text().replace(/\s+/g, ' ').trim()).get().filter((t) => t.length > 2 && t.length < 60))].slice(0, 40),
        text: [text($).slice(0, 7000), ...subs.map((p) => `\n\n=== Page « ${p.label} » (${new URL(p.url).pathname}) ===\n${text(p.$).slice(0, 2500)}`)].join('').slice(0, 17000),
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
    const r = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${p}`, { signal: AbortSignal.timeout(45000) });
    if (!r.ok) return null;
    const d = await r.json();
    const cat = d.lighthouseResult?.categories || {};
    const a = d.lighthouseResult?.audits || {};
    const s = (x: { score?: number } | undefined) => (x && typeof x.score === 'number' ? Math.round(x.score * 100) : null);
    return { strategy, performance: s(cat.performance), accessibility: s(cat.accessibility), seo: s(cat.seo), bestPractices: s(cat['best-practices']),
      lcp: a['largest-contentful-paint']?.displayValue || '–', cls: a['cumulative-layout-shift']?.displayValue || '–', fcp: a['first-contentful-paint']?.displayValue || '–', tbt: a['total-blocking-time']?.displayValue || '–',
      screenshot: typeof a['final-screenshot']?.details?.data === 'string' && a['final-screenshot'].details.data.length < 400000 ? a['final-screenshot'].details.data : undefined };
  } catch { return null; }
}


/* ===================== Analyse des textes par l'IA (Claude) ===================== */
const SYSTEM = `Tu es Marc Bretzner, créateur de sites internet à Strasbourg (SEOKRAFT). Tu évalues le site d'un professionnel (sa page d'accueil et ses pages principales) comme le ferait un client qui le découvre : son message, ses textes et sa capacité à donner envie de contacter l'entreprise.
Règles :
- Tu t'appuies UNIQUEMENT sur le contenu fourni. Tu n'inventes aucun fait, chiffre, avis ou service. Si une information manque, tu le dis.
- Tu écris en français simple, sans jargon technique, sans anglicisme inutile, au vouvoiement, avec un ton bienveillant et franc.
- Tu ne critiques jamais la personne, seulement la page.
- Tu réponds UNIQUEMENT avec un objet JSON valide, sans texte autour.`;

function reviewPrompt(r: AuditResult) {
  const c = r.content!;
  return `Site analysé : ${r.url}
Titre affiché par Google : ${r.title || '(aucun)'}
Description Google : ${c.description || '(aucune)'}
Titre principal (H1) : ${c.h1 || '(aucun)'}
Intertitres (H2) : ${c.h2.join(' | ') || '(aucun)'}
Textes des boutons et liens : ${c.ctas.join(' | ') || '(aucun)'}
Titre et éléments ci-dessus : page d'accueil.
Texte visible des pages analysées (accueil, puis pages principales) :
"""
${c.text.slice(0, 17000)}
"""

Réponds avec ce JSON exactement :
{
  "score": nombre de 0 à 20 (demi-points autorisés) évaluant le message et les textes : clarté de l'offre en 5 secondes, problèmes et bénéfices clients, preuves de confiance (avis, réalisations, chiffres), appel à l'action clair, mots que tapent les clients (métier, ville, service),
  "essentiel": "3 ou 4 phrases qui résument ce que vaut le site pour un client, puis la priorité principale",
  "constats": [ exactement 5 objets { "question": "question courte posée par un client", "reponse": "constat en moins de 12 mots" } pour : comprend-on l'offre en 5 secondes ; parle-t-on des problèmes des clients ; voit-on ce que le client y gagne ; qu'est-ce qui prouve que l'entreprise est fiable ; sait-on quoi faire pour la contacter ],
  "priorities": [ 2 ou 3 objets { "level": "critique" | "important" | "planifier", "title": "titre court du problème", "text": "1 ou 2 phrases : ce qui ne va pas et ce qu'il faut faire" } ],
  "positives": [ 2 ou 3 points forts réels, en une phrase courte chacun ]
}`;
}

export async function reviewTexts(r: AuditResult): Promise<TextReview | null> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key || !r.content || r.content.text.length < 40) return null;
  try {
    const res = await fetch(`${process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com'}/v1/messages`, {
      method: 'POST',
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: process.env.AUDIT_AI_MODEL || 'claude-sonnet-5-5', max_tokens: 1800, system: SYSTEM, messages: [{ role: 'user', content: reviewPrompt(r) }] }),
      signal: AbortSignal.timeout(40000),
    });
    if (!res.ok) { console.error('IA audit', res.status, (await res.text()).slice(0, 300)); return null; }
    const d = await res.json();
    const raw = (d.content?.[0]?.text || '').trim();
    const json = JSON.parse(raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1));
    const str = (v: unknown, n: number) => (typeof v === 'string' ? v.trim().slice(0, n) : '');
    const levels: Level[] = ['critique', 'important', 'planifier'];
    return {
      score: Math.max(0, Math.min(20, Number(json.score) || 0)),
      essentiel: str(json.essentiel, 900),
      constats: (Array.isArray(json.constats) ? json.constats : []).slice(0, 5).map((x: Record<string, unknown>) => ({ question: str(x.question, 160), reponse: str(x.reponse, 140) })).filter((x: { question: string }) => x.question),
      priorities: (Array.isArray(json.priorities) ? json.priorities : []).slice(0, 3).map((x: Record<string, unknown>) => ({ level: levels.includes(x.level as Level) ? (x.level as Level) : 'important', title: str(x.title, 120), text: str(x.text, 400) })).filter((x: { title: string }) => x.title),
      positives: (Array.isArray(json.positives) ? json.positives : []).slice(0, 3).map((x: unknown) => str(x, 200)).filter(Boolean),
    };
  } catch (e) {
    console.error('IA audit', e instanceof Error ? e.message : e);
    return null;
  }
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

/* Audit complet : technique + vitesse Google + textes (en parallèle), puis bulletin enregistré. */
export async function createBulletin(url: string): Promise<Bulletin> {
  const result = await runAudit(url);
  const [speed, desktop, review] = await Promise.all([pageSpeedServer(result.url, 'mobile'), pageSpeedServer(result.url, 'desktop'), reviewTexts(result)]);
  const b = buildBulletin(randomBytes(12).toString('hex'), result, speed, review);
  if (desktop?.screenshot) b.desktopScreenshot = desktop.screenshot;
  await saveBulletin(b);
  return b;
}
