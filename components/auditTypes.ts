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
  content?: { description: string; h1: string; h2: string[]; ctas: string[]; text: string };
  pages?: { url: string; label: string }[];   // pages lues (accueil en premier)
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
export function speedChecks(m: Speed | null): Check[] {
  if (!m || m.performance === null) return [];
  const p = m.performance;
  const out: Check[] = [{ id: 'psi-perf', cat: 'mobile', label: 'Vitesse sur téléphone (mesure Google)', weight: 3,
    status: p >= 80 ? 'ok' : p >= 50 ? 'warn' : 'bad', detail: `Note de vitesse Google : ${p}/100. Affichage du contenu principal : ${m.lcp}.`,
    advice: p >= 80 ? 'Bonne vitesse sur mobile.' : p >= 50 ? 'Vitesse moyenne : chaque seconde de chargement fait partir des visiteurs. Optimiser images et scripts.' : 'Site lent sur téléphone : beaucoup de visiteurs partent avant l’affichage. C’est un frein majeur.' }];
  const lcp = parseFloat(m.lcp.replace(',', '.'));
  if (!Number.isNaN(lcp)) out.push({ id: 'psi-lcp', cat: 'mobile', label: 'Temps d’affichage du contenu principal', weight: 2,
    status: lcp <= 2.5 ? 'ok' : lcp <= 4 ? 'warn' : 'bad', detail: `${m.lcp} sur téléphone (objectif Google : moins de 2,5 s).`,
    advice: lcp <= 2.5 ? 'Rien à faire.' : 'Alléger l’image ou le bloc principal du haut de page pour qu’il s’affiche plus vite.' });
  if (m.accessibility !== null) out.push({ id: 'psi-a11y', cat: 'contenu', label: 'Lisibilité et accessibilité (mesure Google)',
    status: m.accessibility >= 90 ? 'ok' : m.accessibility >= 70 ? 'warn' : 'bad', detail: `Note Google : ${m.accessibility}/100.`,
    advice: m.accessibility >= 90 ? 'Rien à faire.' : 'Améliorer les contrastes, la taille des textes et la description des boutons : le site sera plus agréable pour tous.' });
  return out;
}

/* Ce qui compte pour un prospect : l'impact sur ses clients et sa visibilité (0 = jamais mis en avant dans le rapport). */
const IMPACT: Record<string, number> = {
  viewport: 10, 'psi-perf': 9, https: 9, indexable: 9, robots: 8, phone: 8, cta: 8, form: 7, title: 7, words: 7,
  legal: 6, privacy: 6, 'pages-seo': 6, 'psi-lcp': 6, description: 6, address: 6, h1: 5, schema: 5, cookies: 5, fresh: 4, ttfb: 4,
  alt: 3, 'psi-a11y': 3, sitemap: 3, redirect: 2, weight: 2, og: 2, mixed: 1, headers: 1, favicon: 0, lang: 0,
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
  score: number;                 // note des textes sur 20
  essentiel: string;             // synthèse en 3 ou 4 phrases
  constats: { question: string; reponse: string }[];
  priorities: Priority[];
  positives: string[];
};
export type Bulletin = {
  id: string;
  version: 1;
  url: string;
  host: string;
  createdAt: string;
  global: number;                // sur 20, au demi-point
  notes: { technique: number; google: number; textes: number; contact: number };
  verdict: string;
  essentiel: string;
  priorities: Priority[];
  positives: string[];
  constats: { question: string; reponse: string }[];
  speed: Speed | null;
  ai: boolean;                   // analyse des textes réalisée par l'IA
  desktopScreenshot?: string;    // capture du site sur ordinateur (data URI), fournie par Google
  pages?: { url: string; label: string }[];
};

export const NOTE_LABELS: { id: keyof Bulletin['notes']; label: string; hint: string }[] = [
  { id: 'technique', label: 'Technique du site', hint: 'Vitesse, téléphone, sécurité, conformité' },
  { id: 'google', label: 'Visibilité sur Google', hint: 'Ce que Google comprend et affiche de vous' },
  { id: 'textes', label: 'Message et textes', hint: 'Est-ce que le site donne envie de vous choisir ?' },
  { id: 'contact', label: 'Contact et confiance', hint: 'Est-il simple et rassurant de vous contacter ?' },
];

export const LEVEL_LABEL: Record<Level, string> = { critique: 'Prioritaire', important: 'Important', planifier: 'À planifier' };

export const half = (n: number) => Math.round(n * 2) / 2;
export const fmt20 = (n: number) => String(half(n)).replace('.', ',');

export function verdict20(n: number) {
  if (n >= 16) return 'Très bien, quelques détails à soigner';
  if (n >= 13) return 'Bien, avec de vraies marges de progrès';
  if (n >= 10) return 'Peut mieux faire, des clients vous échappent';
  return 'Des freins importants, à traiter vite';
}

const LEVEL_OF = (c: Check): Level => (c.status === 'bad' && (IMPACT[c.id] ?? 1) >= 8 ? 'critique' : c.status === 'bad' || (IMPACT[c.id] ?? 1) >= 7 ? 'important' : 'planifier');

/* Assemble le bulletin à partir de l'analyse technique, de la vitesse Google et (si disponible) de l'analyse des textes. */
export function buildBulletin(id: string, result: AuditResult, speed: Speed | null, review: TextReview | null): Bulletin {
  const checks = [...result.checks, ...speedChecks(speed)];
  const pct = (cats: Category[]) => {
    const list = checks.filter((c) => cats.includes(c.cat));
    const total = list.reduce((s, c) => s + (c.weight ?? 1), 0);
    return total ? list.reduce((s, c) => s + (c.weight ?? 1) * POINTS[c.status], 0) / total : 0.5;
  };
  const technique = half(20 * pct(['mobile', 'securite']));
  const google = half(20 * (speed?.seo != null ? 0.75 * pct(['google']) + 0.25 * (speed.seo / 100) : pct(['google'])));
  const contact = half(20 * pct(['contact']));
  const textes = half(review ? Math.max(0, Math.min(20, review.score)) : 20 * pct(['contenu']));
  const global = half((technique + google + textes + contact) / 4);

  const tech = keyIssues(checks, 6).map((c) => ({ level: LEVEL_OF(c), title: c.label, text: `${c.detail} ${c.advice}` }));
  const order: Record<Level, number> = { critique: 0, important: 1, planifier: 2 };
  const priorities = [...tech.filter((p) => p.level === 'critique'), ...(review?.priorities ?? []), ...tech.filter((p) => p.level !== 'critique')]
    .sort((a, b) => order[a.level] - order[b.level]).slice(0, 7);

  const okTech = checks.filter((c) => c.status === 'ok' && (IMPACT[c.id] ?? 1) >= 6).slice(0, 4).map((c) => c.label);
  const positives = [...(review?.positives ?? []), ...okTech.map((l) => `${l} : correct.`)].slice(0, 6);

  const essentiel = review?.essentiel || (global >= 13
    ? `Le site de ${result.host} repose sur de bonnes bases. Quelques réglages permettraient de gagner en visibilité et en demandes de contact.`
    : `Le site de ${result.host} présente plusieurs freins qui font probablement partir des visiteurs avant qu’ils ne vous contactent. Les priorités ci-dessous indiquent par où commencer.`);

  return { id, version: 1, url: result.url, host: result.host, createdAt: new Date().toISOString(), global, notes: { technique, google, textes, contact },
    verdict: verdict20(global), essentiel, priorities, positives, constats: review?.constats ?? [], speed, ai: !!review, pages: result.pages };
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
