/* Types partagés entre l'analyse serveur (/api/outil-audit) et l'outil (/outil-audit). */
export type Status = 'ok' | 'warn' | 'bad';
export type Category = 'google' | 'contenu' | 'mobile' | 'securite' | 'contact';

export type Check = {
  id: string;
  cat: Category;
  label: string;      // ce qui est vérifié
  status: Status;
  detail: string;     // constat mesuré
  advice: string;     // recommandation, en langage client
  weight?: number;    // importance (1 par défaut)
};

export type AuditResult = {
  url: string;          // adresse analysée (finale, après redirections)
  host: string;
  fetchedAt: string;
  title: string;
  checks: Check[];
  /* Contenu lisible de la page, transmis à l'analyse des textes (jamais stocké). */
  content?: { description: string; h1: string; h2: string[]; ctas: string[]; text: string; outline?: string; siteMap?: string; channels?: string[] };
  pages?: { url: string; label: string }[];   // pages lues (accueil en premier)
  pagesDetail?: { label: string; path: string; title: string; description: boolean; h1: string; words: number }[];
};

export type Speed = {
  strategy: 'mobile' | 'desktop';
  performance: number | null;   // 0-100
  accessibility: number | null;
  seo: number | null;
  bestPractices: number | null;
  lcp: string; cls: string; fcp: string; tbt: string;
  screenshot?: string;   // capture du téléphone (data URI JPEG), fournie par Google
};

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'google', label: 'Présence sur Google' },
  { id: 'contenu', label: 'Contenu et clarté' },
  { id: 'mobile', label: 'Mobile et vitesse' },
  { id: 'securite', label: 'Sécurité et conformité' },
  { id: 'contact', label: 'Prise de contact' },
];

export const POINTS: Record<Status, number> = { ok: 1, warn: 0.5, bad: 0 };

/* Note d'une catégorie sur 100, à partir de ses vérifications pondérées. */
export function categoryScore(checks: Check[], cat: Category): number | null {
  const list = checks.filter((c) => c.cat === cat);
  if (!list.length) return null;
  const total = list.reduce((s, c) => s + (c.weight ?? 1), 0);
  const got = list.reduce((s, c) => s + (c.weight ?? 1) * POINTS[c.status], 0);
  return Math.round((got / total) * 100);
}

export function globalScore(checks: Check[]): number {
  const scores = CATEGORIES.map((c) => categoryScore(checks, c.id)).filter((n): n is number => n !== null);
  return scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
}

export function verdict(score: number): [string, string] {
  if (score >= 85) return ['Une base solide', 'Quelques réglages suffiront pour tirer le meilleur de votre site.'];
  if (score >= 70) return ['Un bon potentiel', 'Des freins sont à lever pour gagner en visibilité et en contacts.'];
  if (score >= 50) return ['Des points importants à corriger', 'Votre site perd probablement des visiteurs et des demandes.'];
  return ['Des freins majeurs', 'Votre site travaille contre vous : il est temps d’agir.'];
}

/* Transforme la mesure Google PageSpeed (téléphone) en vérifications du rapport. */
/* Statut d'une mesure de vitesse, selon les seuils de Google. Une seule fonction, utilisée par les vérifications ET par l'affichage. */
export type Rating = { status: Status; word: string };
const num = (v: string) => parseFloat(String(v).replace(',', '.').replace(/[^\d.]/g, ''));
export function rateMetric(metric: 'fcp' | 'lcp' | 'cls', value: string, strategy: 'mobile' | 'desktop'): Rating | null {
  const v = num(value);
  if (Number.isNaN(v)) return null;
  const d = strategy === 'desktop';
  const [good, poor] = metric === 'cls' ? [0.1, 0.25] : metric === 'fcp' ? [1.8, 3] : d ? [1.5, 3] : [2.5, 4];
  const status: Status = v <= good ? 'ok' : v <= poor ? 'warn' : 'bad';
  return { status, word: status === 'ok' ? 'Bon' : status === 'warn' ? 'À améliorer' : 'Mauvais' };
}
export const METRIC_GOAL = { fcp: 'bon : 1,8 s ou moins', cls: 'bon : 0,1 ou moins (0 = rien ne bouge)', lcp: (d: boolean) => `bon : ${d ? '1,5' : '2,5'} s ou moins` };

export function speedChecks(m: Speed | null): Check[] {
  if (!m || m.performance === null) return [];
  const p = m.performance;
  const d = m.strategy === 'desktop';
  const on = d ? 'sur ordinateur' : 'sur téléphone';
  const out: Check[] = [{ id: d ? 'psi-perf-d' : 'psi-perf', cat: 'mobile', label: `Vitesse ${on} (mesure Google)`, weight: d ? 2 : 3,
    status: p >= 80 ? 'ok' : p >= 50 ? 'warn' : 'bad', detail: `Note de vitesse Google ${on} : ${p}/100. Contenu principal affiché en ${m.lcp}.`,
    advice: p >= 80 ? 'Bonne vitesse.' : p >= 50 ? 'Vitesse moyenne : chaque seconde d’attente fait partir des visiteurs. Il faut alléger les images et les scripts.' : `Site lent ${on} : beaucoup de visiteurs partent avant même de voir la page.` }];
  const lcp = rateMetric('lcp', m.lcp, m.strategy);
  if (lcp) out.push({ id: d ? 'psi-lcp-d' : 'psi-lcp', cat: 'mobile', label: `Temps d’affichage ${on}`, weight: 2,
    status: lcp.status, detail: `${m.lcp} avant que le contenu principal apparaisse (objectif : ${d ? '1,5' : '2,5'} s ou moins).`,
    advice: lcp.status === 'ok' ? 'Rien à faire.' : 'Alléger la grande image ou le bloc du haut de page pour qu’il s’affiche plus vite.' });
  const cls = rateMetric('cls', m.cls, m.strategy);
  if (cls) out.push({ id: d ? 'psi-cls-d' : 'psi-cls', cat: 'mobile', label: `Stabilité de la page ${on}`, weight: 2,
    status: cls.status, detail: `Décalage de mise en page : ${m.cls} (${cls.word.toLowerCase()} ; seuils Google : 0,1 ou moins = bon, plus de 0,25 = mauvais).`,
    advice: cls.status === 'ok' ? 'Rien à faire.' : `Des éléments bougent pendant le chargement ${on} : le visiteur clique à côté ou perd sa lecture. Réserver la place des images, bandeaux et polices avant leur affichage.` });
  if (!d && m.accessibility !== null) out.push({ id: 'psi-a11y', cat: 'contenu', label: 'Lisibilité et accessibilité (mesure Google)',
    status: m.accessibility >= 90 ? 'ok' : m.accessibility >= 70 ? 'warn' : 'bad', detail: `Note Google : ${m.accessibility}/100.`,
    advice: m.accessibility >= 90 ? 'Rien à faire.' : 'Améliorer les contrastes, la taille des textes et la description des boutons : le site sera plus agréable pour tous.' });
  if (!d && m.bestPractices !== null && m.bestPractices < 80) out.push({ id: 'psi-bp', cat: 'securite', label: 'Bonnes pratiques techniques (mesure Google)',
    status: m.bestPractices >= 60 ? 'warn' : 'bad', detail: `Note Google : ${m.bestPractices}/100.`,
    advice: 'Google relève des erreurs techniques (bibliothèques anciennes, erreurs dans le code, éléments non sécurisés) à corriger.' });
  return out;
}

/* Ce qui compte pour un prospect : l'impact sur ses clients et sa visibilité (0 = jamais mis en avant dans le rapport). */
const IMPACT: Record<string, number> = {
  viewport: 10, 'psi-perf': 9, https: 9, indexable: 9, outdated: 9, cert: 9, robots: 8, phone: 8, cta: 8, 'title-local': 8, 'old-cms': 8, 'vuln-lib': 8,
  form: 7, title: 7, words: 7, reviews: 7, 'psi-perf-d': 7, images: 7, 'form-http': 7, 'server-version': 6,
  legal: 6, privacy: 6, 'pages-seo': 6, 'psi-lcp': 6, description: 6, address: 6, broken: 6, mixed: 6, 'psi-lcp-d': 5, proof: 5,
  h1: 5, 'psi-cls': 7, 'psi-cls-d': 6, maillage: 5, hierarchy: 4, schema: 5, cookies: 5, 'site-size': 5, fresh: 5, ttfb: 5, headers: 5, 'psi-bp': 4, redirect: 4, 'email-pro': 4, photos: 4,
  alt: 3, 'psi-a11y': 3, sitemap: 3, structure: 3, 'cookie-flags': 3, weight: 2, og: 2, favicon: 0, lang: 0,
};
const rankOf = (c: Check) => (c.status === 'bad' ? 2 : c.status === 'warn' ? 1 : 0) * 100 + (IMPACT[c.id] ?? 1) * 10 + (c.weight ?? 1);
/* Les points marquants à présenter, du plus grave au moins grave. */
export function keyIssues(checks: Check[], max: number) {
  return checks.filter((c) => c.status !== 'ok' && (IMPACT[c.id] ?? 1) >= 3).sort((a, b) => rankOf(b) - rankOf(a)).slice(0, max);
}
export function priorities(checks: Check[]) { return keyIssues(checks, 3); }


/* Texte du mail de résumé, prêt à copier-coller (aussi envoyé à Marc pour les demandes publiques). */
export function buildMail(o: { host: string; score: number; firstName?: string; company?: string; checks: Check[] }) {
  const prio = priorities(o.checks);
  const [vTitle] = verdict(o.score);
  return [
    `Objet : Votre audit de site internet — ${o.company || o.host}`,
    '',
    `Bonjour${o.firstName ? ' ' + o.firstName : ''},`,
    '',
    `Merci pour votre demande. J’ai analysé ${o.host} : vous trouverez le rapport complet en pièce jointe (PDF).`,
    '',
    `Note globale : ${o.score}/100 — ${vTitle.toLowerCase()}.`,
    '',
    prio.length ? 'Les 3 points à traiter en priorité :' : 'Votre site est en bonne santé : bravo.',
    ...prio.map((p, i) => `${i + 1}. ${p.label} : ${p.advice}`),
    '',
    'Si vous le souhaitez, je peux vous expliquer ces résultats lors d’un appel de 20 minutes, gratuit et sans engagement : https://www.seokraft.fr/rendez-vous',
    '',
    'Belle journée,',
    '',
    'Marc Bretzner',
    'SEOKRAFT, studio web à Strasbourg',
    '06 72 20 91 53',
    'https://www.seokraft.fr',
  ].join('\n');
}


/* ===================== Bulletin sur 20 ===================== */
export type Level = 'critique' | 'important' | 'planifier';
export type Priority = { level: Level; title: string; text: string };
export type TextReview = {
  score: number;                 // note du message et des textes sur 20
  essentiel: string;             // synthèse en 3 ou 4 phrases
  impression: string;            // première impression visuelle (d'après les captures)
  constats: { question: string; reponse: string }[];
  priorities: Priority[];
  positives: string[];
};
export type NoteId = 'vitesse' | 'securite' | 'google' | 'textes' | 'contact';
export type BulletinCheck = { group: NoteId; label: string; status: Status; detail: string; advice: string };
export type PageDetail = { label: string; path: string; title: string; description: boolean; h1: string; words: number };
export type Bulletin = {
  id: string;
  version: 1 | 2;
  url: string;
  host: string;
  createdAt: string;
  global: number;                // sur 20, au demi-point
  notes: { vitesse?: number; securite?: number; technique?: number; google: number; textes: number | null; contact: number };
  cap?: string;                  // raison pour laquelle la note est plafonnée
  verdict: string;
  essentiel: string;
  impression?: string;
  priorities: Priority[];
  positives: string[];
  constats: { question: string; reponse: string }[];
  speed: Speed | null;
  speedDesktop?: Speed | null;
  ai: boolean;                   // analyse des textes réalisée par l'IA
  desktopScreenshot?: string;    // capture du site sur ordinateur (data URI), fournie par Google
  pages?: { url: string; label: string }[];
  pagesDetail?: PageDetail[];
  checks?: BulletinCheck[];      // tous les points vérifiés (annexe)
  channels?: string[];           // moyens de contact détectés (liste unique, partagée par toutes les sections)
};

export const NOTE_LABELS: { id: NoteId; label: string; hint: string }[] = [
  { id: 'vitesse', label: 'Vitesse et téléphone', hint: 'Le site s’affiche-t-il vite, sur téléphone comme sur ordinateur ?' },
  { id: 'securite', label: 'Sécurité et conformité', hint: 'Vos visiteurs et vos données sont-ils protégés ?' },
  { id: 'google', label: 'Visibilité sur Google', hint: 'Ce que Google comprend et affiche de vous' },
  { id: 'textes', label: 'Référencement et contenu', hint: 'Vos titres et vos pages correspondent-ils à ce que tapent vos clients ?' },
  { id: 'contact', label: 'Contact et confiance', hint: 'Est-il simple et rassurant de vous contacter ?' },
];
const GROUP_OF: Record<Category, NoteId> = { mobile: 'vitesse', securite: 'securite', google: 'google', contenu: 'textes', contact: 'contact' };

export const LEVEL_LABEL: Record<Level, string> = { critique: 'Prioritaire', important: 'Important', planifier: 'À planifier' };

export const half = (n: number) => Math.round(n * 2) / 2;
export const fmt20 = (n: number | null) => (n === null ? '–' : String(half(n)).replace('.', ','));

export function verdict20(n: number) {
  if (n >= 18) return 'Excellent, votre site fait très bien son travail';
  if (n >= 16) return 'Très bien, quelques détails à soigner';
  if (n >= 13) return 'Bien, avec de vraies marges de progrès';
  if (n >= 10) return 'Moyen, des clients vous échappent';
  if (n >= 7) return 'Insuffisant, le site vous coûte des clients';
  return 'À reprendre, le site travaille contre vous';
}

/* Titres compréhensibles par un client, formulés comme ce qu'il perd. */
const PROBLEM: Record<string, string | [string, string]> = {
  viewport: 'Le site est illisible sur téléphone', https: 'Le navigateur affiche « Non sécurisé »', cert: 'Le certificat de sécurité est expiré',
  indexable: 'Google n’a pas le droit d’afficher le site', robots: 'Google n’a pas le droit de lire le site', outdated: ['Le site a l’air d’une autre époque', 'Le site utilise des techniques vieillissantes'],
  builder: 'Un site « clé en main » qui limite vos résultats', 'psi-perf': ['Le site est lent sur téléphone', 'Le site pourrait être plus rapide sur téléphone'],
  'psi-cls': ['La page bouge pendant le chargement sur téléphone', 'La page bouge un peu pendant le chargement sur téléphone'], 'psi-cls-d': ['La page bouge pendant le chargement sur ordinateur', 'La page bouge un peu pendant le chargement sur ordinateur'],
  'psi-perf-d': ['Le site est lent sur ordinateur', 'Le site pourrait être plus rapide sur ordinateur'], 'psi-lcp': 'Le contenu met trop de temps à s’afficher', images: 'Des images trop lourdes ralentissent le site',
  phone: ['Aucun numéro de téléphone visible', 'Le numéro n’est pas cliquable sur téléphone'], cta: ['Rien n’invite le visiteur à vous contacter', 'Le bouton de contact est trop loin dans la page'],
  form: ['Pas de moyen simple de vous écrire', 'Pas de formulaire pour vous écrire en un clic'], reviews: 'Aucun avis client pour rassurer', proof: 'Rien ne prouve votre sérieux',
  'title-local': ['Votre ville n’apparaît pas pour Google', 'Aucune ville clairement indiquée'], title: ['Le titre Google ne dit ni votre métier ni votre ville', 'Le titre Google est à retravailler'],
  words: ['Trop peu de texte pour que Google vous trouve', 'Le texte est un peu léger pour Google'], legal: 'Mentions légales absentes (obligation légale)', privacy: 'Politique de confidentialité absente (RGPD)',
  'vuln-lib': 'Des composants anciens avec des failles connues', 'old-cms': 'Un logiciel de site pas à jour, avec des failles connues', headers: 'Le site est peu protégé contre le piratage',
  'form-http': 'Les messages de vos clients circulent sans protection', fresh: 'Une date ancienne donne l’impression d’un site abandonné', broken: 'Des liens mènent à des pages d’erreur',
  'site-size': 'Trop peu de pages pour être trouvé sur Google', maillage: ['Les pages ne sont pas reliées entre elles', 'Les pages sont peu reliées entre elles'], hierarchy: 'Les titres de la page sont mal organisés', description: 'Google n’a pas de résumé de votre site', h1: 'La page n’a pas de titre principal', mixed: 'Le cadenas de sécurité peut disparaître',
  redirect: 'La version non sécurisée du site reste ouverte', 'pages-seo': 'Vos autres pages sont mal présentées dans Google', address: 'On ne sait pas où vous êtes', schema: 'Google ne dispose pas de votre fiche d’identité',
};
const problemTitle = (c: Check) => { const t = PROBLEM[c.id]; return !t ? c.label : typeof t === 'string' ? t : c.status === 'bad' ? t[0] : t[1]; };

const LEVEL_OF = (c: Check): Level => (c.status === 'bad' && (IMPACT[c.id] ?? 1) >= 7 ? 'critique' : c.status === 'bad' || (IMPACT[c.id] ?? 1) >= 7 ? 'important' : 'planifier');

/* Barème exigeant : la note baisse vite dès que des points manquent (courbe), et certains défauts plafonnent la note. */
const curve = (p: number) => Math.pow(Math.max(0, Math.min(1, p)), 1.5);

/* Assemble le bulletin à partir de l'analyse technique, de la vitesse Google et de l'analyse des textes par l'IA. */
export function buildBulletin(id: string, result: AuditResult, speed: Speed | null, review: TextReview | null, desktop: Speed | null = null): Bulletin {
  const checks = [...result.checks, ...speedChecks(speed), ...speedChecks(desktop)];
  const st = (cid: string) => checks.find((c) => c.id === cid)?.status;
  const pct = (cats: Category[]) => {
    const list = checks.filter((c) => cats.includes(c.cat));
    const total = list.reduce((s, c) => s + (c.weight ?? 1), 0);
    return total ? list.reduce((s, c) => s + (c.weight ?? 1) * POINTS[c.status], 0) / total : 0.5;
  };
  /* Un site fait avec un outil clé en main ne peut pas avoir une bonne note technique. */
  const vitesse = half(Math.min(st('builder') === 'bad' ? 10 : 20, 20 * curve(pct(['mobile']))));
  const securite = half(20 * curve(pct(['securite'])));
  const google = half(20 * curve(speed?.seo != null ? 0.85 * pct(['google']) + 0.15 * (speed.seo / 100) : pct(['google'])));
  const contact = half(20 * curve(pct(['contact'])));
  const textes = review ? half(0.75 * Math.max(0, Math.min(20, review.score)) + 0.25 * 20 * curve(pct(['contenu']))) : null;
  /* Le contact compte double : c'est lui qui transforme un visiteur en client. */
  const parts: [number, number][] = [[vitesse, 1], [securite, 1], [google, 1], [contact, 2], ...(textes !== null ? [[textes, 1.5] as [number, number]] : [])];
  let global = half(parts.reduce((s, [v, w]) => s + v * w, 0) / parts.reduce((s, [, w]) => s + w, 0));

  /* Plafonds : un défaut grave empêche une bonne note, quoi que fasse le reste du site. */
  const caps: [boolean, number, string][] = [
    [st('indexable') === 'bad' || st('robots') === 'bad', 6, 'le site est invisible sur Google'],
    [st('cert') === 'bad', 6, 'le certificat de sécurité est expiré'],
    [st('form-http') === 'bad', 9, 'les formulaires envoient les données des clients sans protection'],
    [st('old-cms') === 'bad' || st('vuln-lib') === 'bad', 10, 'le site utilise des logiciels anciens avec des failles connues'],
    [st('builder') === 'bad', 12, 'le site est construit avec un outil « clé en main » limité'],
    [st('viewport') === 'bad', 8, 'le site n’est pas adapté aux téléphones'],
    [st('phone') === 'bad' && st('form') === 'bad', 8, 'aucun moyen simple de contacter l’entreprise'],
    [st('outdated') === 'bad', 9, 'le site repose sur une technologie dépassée'],
    [st('https') === 'bad', 9, 'le site n’est pas sécurisé'],
    [speed?.performance != null && speed.performance < 30, 10, 'le site est très lent sur téléphone'],
    [st('cta') === 'bad', 11, 'aucun bouton n’invite à prendre contact'],
    [review !== null && review.score <= 8, 11, 'le message ne donne pas envie de choisir l’entreprise'],
    [st('words') === 'bad', 11, 'le site contient trop peu de texte pour Google'],
    [st('phone') === 'bad', 12, 'aucun numéro de téléphone visible'],
    [st('legal') === 'bad', 12, 'les mentions légales, obligatoires, sont absentes'],
    [st('title-local') === 'bad', 13, 'le site ne cible pas sa ville sur Google'],
    [st('reviews') === 'bad' || st('reviews') === 'warn', 15, 'aucun avis client visible'],
  ];
  const hit = caps.filter(([on, max]) => on && global > max).sort((a, b) => a[1] - b[1])[0];
  const cap = hit ? `Note limitée à ${fmt20(hit[1])}/20 : ${hit[2]}.` : undefined;
  if (hit) global = hit[1];

  const tech = keyIssues(checks, 10).map((c) => ({ level: LEVEL_OF(c), title: problemTitle(c), text: `${c.detail} ${c.advice}` }));
  const order: Record<Level, number> = { critique: 0, important: 1, planifier: 2 };
  /* Le regard de l'IA (concret, tiré du site) passe d'abord, puis les constats techniques, du plus grave au moins grave. */
  let priorities = [...(review?.priorities ?? []), ...tech].sort((a, b) => order[a.level] - order[b.level]).slice(0, 8);
  /* Un défaut « Mauvais » de stabilité doit toujours figurer dans les priorités. */
  for (const c of checks.filter((x) => /^psi-cls/.test(x.id) && x.status === 'bad')) {
    const t = problemTitle(c);
    if (!priorities.some((p) => p.title === t)) priorities = [...priorities.slice(0, 7), { level: LEVEL_OF(c), title: t, text: `${c.detail} ${c.advice}` }].sort((a, b) => order[a.level] - order[b.level]);
  }

  /* Points forts : seulement ceux qui comptent pour un client, jamais des évidences techniques. */
  const GOOD: Record<string, string> = { reviews: 'Des avis clients sont visibles.', proof: 'Le site montre des preuves de sérieux.', 'title-local': 'La ville est bien ciblée pour Google.', cta: 'Un bouton invite à prendre contact dès l’arrivée.', phone: 'Le téléphone est visible et cliquable.', 'psi-perf': 'Le site est rapide sur téléphone.', headers: 'Le serveur est bien protégé.' };
  const okTech = global >= 10 ? checks.filter((c) => c.status === 'ok' && GOOD[c.id]).map((c) => GOOD[c.id]) : [];
  const positives = [...(review?.positives ?? []), ...okTech].slice(0, global >= 13 ? 5 : 3);

  const essentiel = review?.essentiel || (global >= 13
    ? `Le site de ${result.host} repose sur de bonnes bases. Quelques réglages permettraient de gagner en visibilité et en demandes de contact.`
    : `Le site de ${result.host} présente plusieurs freins qui font probablement partir des visiteurs avant qu’ils ne vous contactent. Les priorités ci-dessous indiquent par où commencer.`);

  const rankSt: Record<Status, number> = { bad: 0, warn: 1, ok: 2 };
  const all: BulletinCheck[] = checks
    .map((c) => ({ group: GROUP_OF[c.cat], label: c.label, status: c.status, detail: c.detail, advice: c.status === 'ok' ? '' : c.advice }))
    .sort((a, b) => rankSt[a.status] - rankSt[b.status]);

  return { id, version: 2, url: result.url, host: result.host, createdAt: new Date().toISOString(), global, notes: { vitesse, securite, google, textes, contact }, cap,
    verdict: verdict20(global), essentiel, impression: review?.impression || undefined, priorities, positives, constats: review?.constats ?? [], speed, speedDesktop: desktop, ai: !!review,
    pages: result.pages, pagesDetail: result.pagesDetail, checks: all, channels: result.content?.channels ?? [] };
}

/* Mail à envoyer au prospect (Marc le relit puis l'envoie lui-même). */
export function buildBulletinMail(b: Bulletin, firstName = '') {
  const top = b.priorities.slice(0, 3);
  return [
    `Objet : La note de votre site : ${fmt20(b.global)}/20`,
    '',
    `Bonjour${firstName ? ' ' + firstName : ''},`,
    '',
    `Merci pour votre demande. J’ai analysé ${b.host} : votre site obtient ${fmt20(b.global)}/20 (${b.verdict.toLowerCase()}).`,
    '',
    top.length ? 'Par où commencer :' : '',
    ...top.map((p, i) => `${i + 1}. ${p.title}`),
    '',
    'Votre bulletin complet, à consulter sur téléphone ou à télécharger en PDF :',
    `https://www.seokraft.fr/bulletin/${b.id}`,
    '',
    'Si vous voulez qu’on regarde ensemble par quoi commencer, je vous propose un appel de 20 minutes, gratuit et sans engagement : https://www.seokraft.fr/rendez-vous',
    '',
    'Belle journée,',
    '',
    'Marc Bretzner',
    'SEOKRAFT, studio web à Strasbourg',
    '06 72 20 91 53',
    'https://www.seokraft.fr',
  ].filter((l, i, a) => !(l === '' && a[i - 1] === '')).join('\n');
}
