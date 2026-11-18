/* Audit SEOKRAFT « par les faits » : uniquement des points vérifiés par l'outil, sans IA.
   Chaque point a un texte écrit à l'avance (méthode entonnoir : ce que fait le client → ce qui bloque → ce que ça coûte),
   une preuve vérifiable, et un poids dans la note. La note est calculée, jamais devinée. */
import type { AuditResult, Check, Speed, Status } from './auditTypes';

export type FactPoint = {
  id: string;
  status: Status;
  label: string;      // nom court du point (détail)
  title: string;      // titre du problème (ou du point vérifié)
  text: string;       // explication en entonnoir
  proof: string;      // preuve vérifiable
  strength?: string;  // phrase positive quand le point est bon
  heavy?: boolean;    // corriger demande de reprendre le site en profondeur
  rank: number;       // importance commerciale (plus haut = plus grave)
  weight: number;     // poids dans la note
};
export type FactReport = {
  format: 'faits-1';
  points: FactPoint[];
  problems: string[];       // les 3 points mis en avant (ids)
  strengths: string[];      // phrases « ce qui va déjà bien »
  verdictTitle: string;
  verdictSub: string;
  baseLine: string;         // phrase sous les forces
};

const SCORE: Record<Status, number> = { ok: 1, warn: 0.5, bad: 0 };
const half = (n: number) => Math.round(n * 2) / 2;
const q = (s: string) => `« ${s} »`;

type Draft = Omit<FactPoint, 'title' | 'text' | 'proof'> & Partial<Pick<FactPoint, 'title' | 'text' | 'proof'>>;

export function buildFactReport(r: AuditResult, speed: Speed | null): { report: FactReport; global: number } {
  const ck = (id: string): Check | undefined => r.checks.find((c) => c.id === id);
  const f0 = r.facts ?? { leftovers: [], deadCtas: [], legalDeadUrl: '', broken: [] };
  /* Un même problème n'est compté qu'une fois : le lien de mentions légales cassé reste dans « Mentions légales ». */
  const brokenOthers = f0.broken.filter((x) => !(f0.legalDeadUrl && /mention|l[ée]gal/i.test(x)));
  const f = { ...f0, broken: brokenOthers, leftovers: f0.leftovers.filter((x) => !(x === 'dolor sit amet' && f0.leftovers.includes('lorem ipsum'))) };
  const pts: Draft[] = [];
  const add = (p: Draft) => pts.push(p);

  /* 1. Sécurité (cadenas, certificat) */
  const https = ck('https'); const cert = ck('cert');
  if (https) {
    const expired = cert?.status === 'bad';
    const bad = https.status === 'bad' || expired;
    add({ id: 'secure', label: 'Connexion sécurisée (cadenas)', status: bad ? 'bad' : 'ok', rank: 100, weight: 4,
      title: expired ? 'Le certificat de sécurité de votre site a expiré' : 'Votre site s’affiche « Non sécurisé »',
      text: expired
        ? 'Avant même d’ouvrir votre page, le navigateur du visiteur affiche une alerte rouge : « Votre connexion n’est pas privée ». La plupart des gens s’arrêtent là, et ne verront jamais ce que vous proposez.'
        : 'Quand un visiteur arrive sur votre site, son navigateur affiche « Non sécurisé » à côté de votre adresse. Beaucoup font demi-tour sans lire la suite, et Google met en avant les sites sécurisés avant le vôtre.',
      proof: expired ? (cert?.detail ?? '') : 'Votre site s’ouvre sans le cadenas (adresse en http://).',
      strength: 'Il est sécurisé : vos visiteurs voient le cadenas.' });
  }

  /* 2. Google a-t-il le droit d'afficher le site ? */
  const idx = ck('indexable'); const rob = ck('robots');
  const blocked = idx?.status === 'bad' || rob?.status === 'bad';
  add({ id: 'google-ok', label: 'Autorisé à apparaître sur Google', status: blocked ? 'bad' : 'ok', rank: 99, weight: 5,
    title: 'Votre site demande à Google de ne pas l’afficher',
    text: 'Pour apparaître dans les résultats, un site doit autoriser Google à le lire. Le vôtre contient une consigne qui le lui interdit : quoi qu’il arrive, vos clients ne peuvent pas vous trouver sur Google.',
    proof: idx?.status === 'bad' ? 'Votre page d’accueil contient la consigne « noindex » (ne pas afficher dans Google).' : 'Votre fichier robots.txt interdit l’accès à tout le site.',
    strength: 'Google a le droit de le lire et de l’afficher.' });

  /* 3. Site inachevé : restes de modèle, boutons qui ne mènent nulle part */
  if (f.leftovers.length || f.deadCtas.length) {
    const lo = f.leftovers.length > 0;
    add({ id: 'unfinished', label: 'Site terminé et fonctionnel', status: 'bad', rank: 96, weight: 3,
      title: lo ? 'Votre site donne l’impression de ne pas être terminé' : `Votre bouton ${q(f.deadCtas[0])} ne mène nulle part`,
      text: lo
        ? 'Un client qui découvre votre entreprise juge son sérieux en quelques secondes. Sur votre site, des textes d’exemple du modèle d’origine sont encore en ligne : il se demande si l’entreprise est encore active… et va voir ailleurs.'
        : `Un client convaincu clique sur ${q(f.deadCtas[0])}… et rien ne se passe. Le bouton ne mène vers aucune page : la demande que vous auriez pu recevoir est perdue, sans que vous le sachiez.`,
      proof: lo ? `Repéré sur votre site : ${f.leftovers.map(q).join(', ')}.` : `Bouton${f.deadCtas.length > 1 ? 's' : ''} sans destination : ${f.deadCtas.map(q).join(', ')}.` });
  } else add({ id: 'unfinished', label: 'Site terminé et fonctionnel', status: 'ok', rank: 96, weight: 3 });

  /* 4. Téléphone (affichage adapté) */
  const vp = ck('viewport');
  if (vp) add({ id: 'mobile', label: 'Adapté aux téléphones', status: vp.status === 'bad' ? 'bad' : 'ok', rank: 97, weight: 4, heavy: true,
    title: 'Votre site n’est pas adapté aux téléphones',
    text: 'La plupart de vos visiteurs arrivent depuis leur téléphone. Sur votre site, ils doivent zoomer et glisser sur le côté pour lire : beaucoup abandonnent en quelques secondes. Et Google classe moins bien les sites qui ne s’adaptent pas aux téléphones.',
    proof: 'Votre site n’est pas configuré pour s’adapter à la taille des écrans.',
    strength: 'Il s’adapte à l’écran des téléphones.' });

  /* 5. Vitesse sur téléphone (mesure officielle de Google) */
  const p = speed?.performance ?? null;
  if (p !== null) add({ id: 'speed', label: 'Vitesse sur téléphone (mesure Google)', status: p < 50 ? 'bad' : p < 80 ? 'warn' : 'ok', rank: p < 50 ? 81 : 52, weight: 3,
    title: p < 50 ? 'Votre site est lent sur téléphone' : 'Votre site pourrait s’afficher plus vite sur téléphone',
    text: p < 50
      ? `Sur téléphone, un visiteur n’attend pas : si la page tarde, il revient en arrière et clique sur le concurrent suivant. Google mesure votre site à ${p}/100 sur téléphone : beaucoup de visiteurs partent avant même de voir votre page.`
      : `Sur téléphone, chaque seconde d’attente fait partir des visiteurs. Google mesure votre site à ${p}/100 sur téléphone : correct, mais une page plus rapide garderait davantage de clients.`,
    proof: `Mesure officielle de Google (PageSpeed) sur téléphone : ${p}/100${speed?.lcp && speed.lcp !== '–' ? `, contenu principal affiché en ${speed.lcp}` : ''}.`,
    strength: `Il s’affiche vite sur téléphone : ${p}/100 selon Google.` });

  /* 6. Titre dans Google */
  const t = ck('title');
  if (t) {
    const m = /« (.*) » \((\d+) caractères\)/.exec(t.detail);
    const tt = m?.[1] ?? ''; const len = Number(m?.[2] ?? 0);
    const missing = !tt;
    add({ id: 'title', label: 'Titre dans les résultats Google', status: t.status, rank: t.status === 'bad' ? 90 : 42, weight: 3,
      title: missing ? 'Google n’a pas de titre à afficher pour votre site' : t.status === 'bad' ? 'Votre titre dans Google ne dit pas ce que vous faites' : 'Votre titre dans Google est mal calibré',
      text: missing
        ? 'Dans les résultats Google, chaque site apparaît avec un titre bleu cliquable. C’est souvent la seule chose qu’un client lit avant de choisir. Le vôtre n’en a pas : Google en fabrique un, et vous perdez le clic.'
        : t.status === 'bad'
          ? `Dans les résultats Google, chaque site apparaît avec un titre bleu cliquable. Le vôtre est ${q(tt)} : il ne dit ni votre métier ni votre ville. Google vous montre donc rarement aux clients qui cherchent vos services.`
          : len > 65
            ? `Dans les résultats Google, votre titre bleu est coupé au milieu (${len} caractères) : le client ne voit pas l’essentiel de ce que vous proposez au moment de choisir.`
            : `Dans les résultats Google, votre titre bleu est très court (${len} caractères) : il ne laisse pas la place de dire votre métier et votre ville, ce que vos clients tapent pour vous trouver.`,
      proof: missing ? 'Aucun titre défini sur votre page d’accueil.' : `Titre actuel : ${q(tt)}.`,
      strength: 'Il a un titre clair dans les résultats Google.' });
  }

  /* 7. Ville ciblée (seulement si la ville de l'entreprise a été identifiée) */
  const city = ck('title-local');
  if (city && city.status !== 'warn') {
    const town = /\(([^)]+)\)/.exec(city.detail)?.[1] ?? 'votre ville';
    add({ id: 'city', label: 'Ville visible pour Google', status: city.status, rank: 88, weight: 3,
      title: 'Votre ville n’apparaît pas là où Google regarde',
      text: `Vos clients tapent votre métier suivi de ${town}. Pour choisir qui afficher, Google regarde d’abord le titre de la page et son titre principal. Sur votre site, la ville n’y est pas : vous passez derrière les concurrents qui l’ont écrite.`,
      proof: city.detail,
      strength: 'Votre ville apparaît là où Google regarde.' });
  }

  /* 8. Titre principal (H1) */
  const h1 = ck('h1');
  if (h1) {
    const n = Number(/^(\d+) titres/.exec(h1.detail)?.[1] ?? 0);
    add({ id: 'h1', label: 'Titre principal de la page d’accueil', status: h1.status, rank: h1.status === 'bad' ? 86 : 30, weight: 2,
      title: h1.status === 'bad' ? 'Google ne sait pas ce que vous proposez' : 'Votre page d’accueil a plusieurs titres principaux',
      text: h1.status === 'bad'
        ? 'Pour comprendre une page, Google lit d’abord son titre principal. Sur votre page d’accueil, il n’y en a pas : Google ne sait ni quel service vous proposez ni où, et il montre vos concurrents avant vous.'
        : `Pour comprendre une page, Google s’attend à un seul titre principal. Votre page d’accueil en a ${n || 'plusieurs'} : le message se brouille, et Google hésite sur ce que vous proposez.`,
      proof: h1.status === 'bad' ? 'Vérifié sur votre page d’accueil : aucun titre principal trouvé.' : `Vérifié sur votre page d’accueil : ${n || 'plusieurs'} titres principaux.`,
      strength: 'Sa page d’accueil a un titre principal clair.' });
  }

  /* 9. Résumé dans Google (description) */
  const d = ck('description');
  if (d) {
    const len = Number(/(\d+) caractères/.exec(d.detail)?.[1] ?? 0);
    add({ id: 'description', label: 'Résumé dans les résultats Google', status: d.status, rank: d.status === 'bad' ? 62 : 25, weight: 1,
      title: d.status === 'bad' ? 'Google n’a pas de résumé de votre site' : 'Le résumé de votre site dans Google est mal calibré',
      text: d.status === 'bad'
        ? 'Sous le titre bleu, Google affiche un court résumé qui donne envie de cliquer… ou pas. Votre site n’en propose pas : Google prend un morceau de texte au hasard, rarement le plus convaincant.'
        : `Sous le titre bleu, Google affiche un court résumé qui donne envie de cliquer. Le vôtre fait ${len} caractères : ${len > 170 ? 'Google le coupe avant la fin' : 'c’est trop court pour convaincre'}.`,
      proof: d.status === 'bad' ? 'Aucun résumé (description) défini sur votre page d’accueil.' : `Résumé actuel : ${len} caractères (idéal : 140 à 160).`,
      strength: 'Il a un résumé soigné dans les résultats Google.' });
  }

  /* 10. Titres des autres pages */
  const ps = ck('pages-seo');
  if (ps) add({ id: 'pages', label: 'Titres des autres pages', status: ps.status, rank: ps.status === 'bad' ? 70 : 35, weight: 2,
    title: 'Vos pages se ressemblent aux yeux de Google',
    text: 'Chaque page de votre site peut attirer des clients sur une recherche différente, à condition d’avoir son propre titre et son propre résumé. Sur votre site, ce n’est pas le cas : vos pages se font concurrence au lieu de vous apporter des visites.',
    proof: `Constaté sur les pages lues : ${ps.detail.replace(/\.$/, '').toLowerCase()}.`,
    strength: 'Chaque page a son propre titre dans Google.' });

  /* 11. Nombre de pages */
  const sz = ck('site-size');
  if (sz) {
    const n = Number(/(\d+) page/.exec(sz.detail)?.[1] ?? 0);
    add({ id: 'size', label: 'Une page par service', status: sz.status, rank: sz.status === 'bad' ? 75 : 58, weight: 3, heavy: sz.status === 'bad',
      title: sz.status === 'bad' ? 'Votre site n’a qu’une seule page' : 'Votre site a trop peu de pages pour être trouvé',
      text: sz.status === 'bad'
        ? 'Chaque service que vous proposez correspond à une recherche différente sur Google. Avec une seule page, vous ne pouvez répondre qu’à quelques-unes : tous les clients qui cherchent un service précis tombent sur vos concurrents.'
        : `Chaque service que vous proposez correspond à une recherche différente sur Google. Avec ${n + 1} pages, la plupart de vos services n’ont pas la leur : les clients qui les cherchent tombent sur vos concurrents.`,
      proof: sz.status === 'bad' ? 'Une seule page trouvée (liens du site et plan du site).' : `${n + 1} pages trouvées en tout, accueil compris.`,
      strength: 'Il contient plusieurs pages, ce qui multiplie vos chances sur Google.' });
  }

  /* 12. Quantité de texte (seul le cas grave compte) */
  const w = ck('words');
  if (w) {
    const n = Number(/(\d+) mots/.exec(w.detail)?.[1] ?? 0);
    add({ id: 'words', label: 'Texte de la page d’accueil', status: w.status === 'bad' ? 'bad' : 'ok', rank: 60, weight: 2,
      title: 'Votre page d’accueil contient trop peu de texte',
      text: `Google ne devine pas : il lit. Avec environ ${n} mots sur votre page d’accueil, il ne sait pas assez ce que vous faites, pour qui et où. Il préfère montrer les concurrents qui l’expliquent.`,
      proof: `Environ ${n} mots sur votre page d’accueil (menus compris).`,
      strength: 'Sa page d’accueil explique votre activité avec assez de texte.' });
  }

  /* 13. Plan du site */
  const sm = ck('sitemap');
  if (sm) add({ id: 'sitemap', label: 'Plan du site pour Google', status: sm.status === 'ok' ? 'ok' : 'warn', rank: 40, weight: 1,
    title: 'Google n’a pas le plan de votre site',
    text: 'Pour découvrir toutes vos pages, Google s’aide d’un plan du site. Le vôtre n’en a pas : certaines pages risquent de ne jamais apparaître dans les résultats.',
    proof: 'Aucun plan du site (sitemap) trouvé à son adresse habituelle.',
    strength: 'Il a un plan pour aider Google à trouver toutes ses pages.' });

  /* 14. Liens en erreur */
  const br = ck('broken');
  if (br) add({ id: 'broken', label: 'Liens qui fonctionnent', status: br.status === 'bad' && (f.broken.length > 0 || !f0.broken.length) ? 'bad' : 'ok', rank: 78, weight: 2,
    title: 'Certains liens de votre site mènent à une page d’erreur',
    text: 'Un client qui clique pour en savoir plus tombe sur une page d’erreur. Il se dit que le site est abandonné, et Google, qui suit les mêmes liens, le remarque aussi.',
    proof: f.broken.length ? `Liens en erreur : ${f.broken.map(q).join(', ')}.` : br.detail,
    strength: 'Ses liens mènent tous à une vraie page.' });

  /* 15. Mentions légales */
  const lg = ck('legal');
  if (lg) {
    const dead = !!f.legalDeadUrl;
    const status: Status = dead ? (lg.status === 'bad' ? 'bad' : 'warn') : lg.status;
    const shown = f.legalDeadUrl.replace(/^https?:\/\/(www\.)?/, '');
    add({ id: 'legal', label: 'Mentions légales', status, rank: status === 'bad' ? 85 : 45, weight: 2,
      title: dead ? 'Votre lien « Mentions légales » mène à une page d’erreur' : lg.status === 'bad' ? 'Vos mentions légales sont introuvables' : 'Vos mentions légales sont cachées',
      text: dead
        ? 'Avant d’appeler un professionnel, un client vérifie qu’il est sérieux. Sur votre site, il tombe sur une page d’erreur, là où la loi impose vos informations. Il doute, et il appelle quelqu’un d’autre.'
        : lg.status === 'bad'
          ? 'Avant d’appeler un professionnel, un client vérifie qui se cache derrière le site. Sur le vôtre, aucune mention légale : elles sont pourtant obligatoires pour toute entreprise, et leur absence fait douter.'
          : 'Vos mentions légales existent, mais aucun lien visible n’y mène. La loi demande qu’elles soient faciles à trouver, et un client qui les cherche ne les voit pas.',
      proof: dead ? `Vérifiez vous-même : ${shown} → page introuvable.` : lg.status === 'bad' ? 'Recherchées dans les liens du site, à leurs adresses habituelles et en bas de page : introuvables.' : lg.detail,
      strength: 'Ses mentions légales sont en place.' });
  }

  /* 16. Confidentialité (grave seulement si un formulaire recueille des données) */
  const pv = ck('privacy'); const hasForm = ck('form')?.status === 'ok';
  if (pv) add({ id: 'privacy', label: 'Politique de confidentialité', status: pv.status === 'ok' ? 'ok' : hasForm ? 'bad' : 'warn', rank: hasForm ? 55 : 22, weight: 1,
    title: hasForm ? 'Votre formulaire recueille des données sans politique de confidentialité' : 'Votre site n’a pas de politique de confidentialité',
    text: hasForm
      ? 'Dès qu’un visiteur vous laisse son nom ou son e-mail, la loi (RGPD) vous oblige à lui dire ce que vous en faites. Votre site ne le dit nulle part : c’est un risque de sanction, et un client attentif s’en inquiète.'
      : 'La loi (RGPD) demande d’expliquer aux visiteurs ce que deviennent leurs données, même simplement mesurées par des statistiques. Votre site ne le dit nulle part.',
    proof: 'Recherchée dans les liens du site, les mentions légales et à ses adresses habituelles : introuvable.',
    strength: 'Il explique ce que deviennent les données des visiteurs.' });

  /* 17. Téléphone cliquable */
  const ph = ck('phone');
  if (ph) add({ id: 'phone', label: 'Numéro de téléphone cliquable', status: ph.status, rank: ph.status === 'bad' ? 82 : 68, weight: 2,
    title: ph.status === 'bad' ? 'Votre numéro de téléphone n’apparaît pas sur le site' : 'Le client prêt à vous appeler doit recopier votre numéro',
    text: ph.status === 'bad'
      ? 'Beaucoup de clients préfèrent appeler plutôt qu’écrire, surtout quand c’est urgent. Sur votre site, aucun numéro : ces clients-là appellent le concurrent dont le numéro est affiché.'
      : 'La plupart de vos visiteurs arrivent depuis leur téléphone, prêts à appeler. Votre numéro est affiché mais ne réagit pas quand on le touche : il faut le recopier. Chaque étape en plus, c’est un client en moins.',
    proof: ph.status === 'bad' ? 'Aucun numéro de téléphone trouvé sur les pages lues.' : 'Votre numéro est écrit sur le site, mais il n’est pas cliquable.',
    strength: 'Votre numéro s’appelle d’un simple geste sur téléphone.' });

  /* 18. Pouvoir écrire */
  const fm = ck('form');
  if (fm) add({ id: 'contact', label: 'Formulaire ou e-mail de contact', status: fm.status, rank: fm.status === 'bad' ? 84 : 32, weight: 2,
    title: fm.status === 'bad' ? 'Rien ne permet de vous écrire depuis le site' : 'Votre site n’a pas de formulaire de contact',
    text: fm.status === 'bad'
      ? 'Un client qui découvre votre site le soir ou le week-end veut vous écrire tout de suite. Sur votre site, ni formulaire ni adresse e-mail : il remet à plus tard… et oublie.'
      : 'Un client qui veut vous écrire doit ouvrir sa messagerie et recopier votre adresse. Une étape de plus, et une partie des demandes n’arrive jamais.',
    proof: fm.detail,
    strength: 'Les clients peuvent vous écrire directement depuis le site.' });

  /* 19. Bouton d'action dès l'arrivée */
  const ct = ck('cta');
  if (ct) add({ id: 'cta', label: 'Bouton de contact dès l’arrivée', status: ct.status, rank: ct.status === 'bad' ? 83 : 65, weight: 2,
    title: ct.status === 'bad' ? 'Aucun bouton n’invite à vous contacter' : 'Il faut descendre pour trouver comment vous contacter',
    text: ct.status === 'bad'
      ? 'Un visiteur intéressé cherche comment passer à l’action : demander un devis, réserver, appeler. Sur votre site, aucun bouton ne l’y invite : il doit chercher, et beaucoup s’arrêtent là.'
      : 'La plupart des visiteurs ne descendent pas jusqu’en bas de la page. Votre bouton de contact n’apparaît pas dès l’arrivée : ceux qui ne le voient pas repartent sans vous écrire.',
    proof: ct.detail,
    strength: 'Un bouton invite à vous contacter dès l’arrivée.' });

  /* Note : moyenne pondérée des points, puis plafonds pour les problèmes qui empêchent d'avoir des clients. */
  const points: FactPoint[] = pts.map((x) => ({ title: x.label, text: '', proof: '', ...x }));
  const total = points.reduce((s, x) => s + x.weight, 0);
  let global = total ? half((20 * points.reduce((s, x) => s + x.weight * SCORE[x.status], 0)) / total) : 0;
  const is = (id: string, st: Status = 'bad') => points.some((x) => x.id === id && x.status === st);
  const bads = points.filter((x) => x.status === 'bad').length;
  if (is('google-ok')) global = Math.min(global, 6);
  if (is('secure')) global = Math.min(global, 8);
  if (is('mobile')) global = Math.min(global, 10);
  if (is('unfinished')) global = Math.min(global, 11);
  if (bads >= 3) global = Math.min(global, 12);
  if (bads >= 1) global = Math.min(global, 15.5);

  /* Les 3 problèmes mis en avant : les graves d'abord, puis les plus coûteux en clients. */
  const issues = points.filter((x) => x.status !== 'ok').sort((a, b) => (b.status === 'bad' ? 1000 : 0) + b.rank - ((a.status === 'bad' ? 1000 : 0) + a.rank));
  const top = issues.slice(0, 3);
  const PREF = ['secure', 'speed', 'mobile', 'google-ok', 'legal', 'phone', 'contact', 'cta', 'title', 'h1', 'size', 'sitemap'];
  const strengths = PREF.map((id) => points.find((x) => x.id === id && x.status === 'ok')).filter((x): x is FactPoint => !!x?.strength).slice(0, 3).map((x) => x.strength!);
  const heavy = points.some((x) => x.status === 'bad' && x.heavy);
  const n = top.length;
  const verdictTitle = !n ? 'Votre site fait bien son travail'
    : global >= 16 ? 'Votre site fait déjà bien son travail'
    : global >= 12.5 ? 'Votre site a de bonnes bases, mais laisse filer des clients'
    : global >= 9 ? 'Aujourd’hui, une partie de ces clients vous échappe'
    : 'Aujourd’hui, une grande partie de ces clients vous échappe';
  const verdictSub = !n ? 'Aucun problème important : vous avez une base solide pour aller chercher plus de clients.'
    : heavy ? `La cause tient en ${n} point${n > 1 ? 's' : ''} principa${n > 1 ? 'ux' : 'l'}, et votre site demande à être repris en profondeur.`
    : `La cause tient en ${n} point${n > 1 ? 's' : ''}. Et ${n > 1 ? 'aucun ne demande' : 'il ne demande pas'} de refaire votre site.`;
  const baseLine = !strengths.length ? '' : !n ? '' : heavy ? 'Ce sont des acquis sur lesquels construire la suite.' : 'Vous partez donc avec une longueur d’avance : pas besoin de tout refaire, quelques corrections ciblées suffisent.';
  return { global, report: { format: 'faits-1', points, problems: top.map((x) => x.id), strengths, verdictTitle, verdictSub, baseLine } };
}

/* Phrase « Un point m’a frappé : … » du mail de prospection. */
export function factStrike(rep: FactReport): string {
  const p = rep.points.find((x) => x.id === rep.problems[0]);
  if (!p) return 'votre site a de bonnes bases, et il peut encore vous apporter plus de clients';
  return /^Google\b/.test(p.title) ? p.title : p.title.charAt(0).toLowerCase() + p.title.slice(1);
}
