/* Types partagés entre l'analyse serveur (/api/outil-audit) et l'outil (/outil-audit). */
export type Status = 'ok' | 'warn' | 'bad';
export type Category = 'google' | 'contenu' | 'mobile' | 'securite' | 'legal' | 'contact';

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
  content?: { description: string; h1: string; h2: string[]; ctas: string[]; text: string; outline?: string; siteMap?: string; channels?: string[]; dossier?: string };
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

/* ===================== Bulletin sur 20 ===================== */
export type Level = 'critique' | 'important' | 'planifier';
export type Priority = { level: Level; title: string; text: string };
export type NoteId = 'vitesse' | 'securite' | 'legal' | 'google' | 'textes' | 'contact' | 'visibilite' | 'structure' | 'message' | 'referencement';
/* Niveau affiché : celui qui a servi au calcul (Grave −6, Important −3, À prévoir −1), « À noter » quand aucun point n'est retiré,
   « ai » pour un constat de l'IA sur les textes (déjà compris dans sa note « Textes et message »). */
export type CheckLevel = 'grave' | 'important' | 'prevoir' | 'info' | 'ok' | 'ai';
export type BulletinCheck = { group: NoteId; label: string; status: Status; detail: string; advice: string; level?: CheckLevel };
export type PageDetail = { label: string; path: string; title: string; description: boolean; h1: string; words: number };
export type Bulletin = {
  id: string;
  version: 1 | 2;
  url: string;
  host: string;
  createdAt: string;
  global: number;                // sur 20, au demi-point
  notes: { vitesse?: number; securite?: number; legal?: number; technique?: number; google?: number; textes?: number | null; contact?: number; visibilite?: number; structure?: number; referencement?: number; message?: number };
  cap?: string;                  // raison pour laquelle la note est plafonnée
  verdict: string;
  essentiel: string;
  impression?: string;
  priorities: Priority[];
  positives: string[];
  constats: Constat[];
  speed: Speed | null;
  speedDesktop?: Speed | null;
  ai: boolean;                   // analyse des textes réalisée par l'IA
  desktopScreenshot?: string;    // capture du site sur ordinateur (data URI), fournie par Google
  pages?: { url: string; label: string }[];
  pagesDetail?: PageDetail[];
  checks?: BulletinCheck[];      // tous les points vérifiés (annexe)
  channels?: string[];           // moyens de contact détectés (liste unique, partagée par toutes les sections)
};

export type Constat = { question: string; reponse: string; statut?: Status };
/* Couleur d'une réponse : celle donnée par l'IA, sinon déduite du texte (anciens bulletins).
   Non → rouge ; oui mais / en partie / incertain → orange ; oui → vert. */
export function constatStatus(c: Constat): Status {
  const r = c.reponse.trim();
  /* Le texte prime en cas de désaccord : une réponse « Non… » est toujours rouge, un « Oui, mais… » jamais vert. */
  if (/^(non|aucun|aucune|pas|rien|jamais)\b/i.test(r)) return 'bad';
  const partial = /\bmais\b|\bsauf\b|en partie|partiellement|;|\bpeu\b|manque|\bsans\b|\bpas\b|aucun/i.test(r);
  if (c.statut) return c.statut === 'ok' && partial ? 'warn' : c.statut;
  if (/^oui\b/i.test(r)) return partial ? 'warn' : 'ok';
  return 'warn';
}

export const NOTE_LABELS: { id: NoteId; label: string; hint: string }[] = [
  { id: 'vitesse', label: 'Vitesse et téléphone', hint: 'Le site s’affiche-t-il vite, sur téléphone comme sur ordinateur ?' },
  { id: 'securite', label: 'Sécurité', hint: 'Le site et les données de vos visiteurs sont-ils protégés ?' },
  { id: 'legal', label: 'Obligations légales', hint: 'Mentions légales, RGPD, cookies : ce que nous avons pu vérifier' },
  { id: 'google', label: 'Visibilité sur Google', hint: 'Ce que Google comprend et affiche de vous' },
  { id: 'textes', label: 'Aspect général', hint: 'Contenu, image du site et facilité à vous contacter' },
];
export const LEVEL_LABEL: Record<Level, string> = { critique: 'Prioritaire', important: 'Important', planifier: 'À planifier' };

export const half = (n: number) => Math.round(n * 2) / 2;
export const fmt20 = (n: number | null) => (n === null ? '–' : String(half(n)).replace('.', ','));

/* Audits « référencement d'abord » (projet Claude) : 5 notes centrées sur Google. */
export const NOTE_LABELS_SEO: { id: NoteId; label: string; hint: string }[] = [
  { id: 'visibilite', label: 'Prêt pour Google', hint: 'Google peut-il voir et lire votre site sans obstacle ?' },
  { id: 'structure', label: 'Référencement des pages', hint: 'Titres, structure, textes et liens : Google comprend-il vos pages ?' },
  { id: 'message', label: 'Textes et message', hint: 'Le visiteur comprend-il vite ce que vous faites, et a-t-il envie de vous contacter ?' },
  { id: 'vitesse', label: 'Vitesse et mobile', hint: 'Le site s’affiche-t-il vite, surtout sur téléphone ?' },
  { id: 'securite', label: 'Sécurité et conformité', hint: 'Site protégé, mentions légales, RGPD et cookies' },
];
/* Grille actuelle : 4 notes, « Référencement » regroupe ce qui empêche Google de voir le site et la préparation des pages. */
export const NOTE_LABELS_SEO4: { id: NoteId; label: string; hint: string }[] = [
  { id: 'referencement', label: 'Référencement', hint: 'Google peut-il trouver, lire et comprendre vos pages ?' },
  ...NOTE_LABELS_SEO.slice(2),
];
export const noteLabelsFor = (b: Pick<Bulletin, 'notes'>) => (b.notes.referencement !== undefined ? NOTE_LABELS_SEO4 : b.notes.visibilite !== undefined ? NOTE_LABELS_SEO : NOTE_LABELS);

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
  indexable: 'Google n’a pas le droit d’afficher le site', robots: ['Google n’a pas le droit de lire le site', 'Le fichier robots.txt, qui guide Google, est absent'], outdated: ['Le site a l’air d’une autre époque', 'Le site utilise des techniques vieillissantes'],
  builder: 'Un site « clé en main » qui limite vos résultats', 'psi-perf': ['Le site est lent sur téléphone', 'Le site pourrait être plus rapide sur téléphone'],
  'psi-cls': ['La page bouge pendant le chargement sur téléphone', 'La page bouge un peu pendant le chargement sur téléphone'], 'psi-cls-d': ['La page bouge pendant le chargement sur ordinateur', 'La page bouge un peu pendant le chargement sur ordinateur'],
  'psi-perf-d': ['Le site est lent sur ordinateur', 'Le site pourrait être plus rapide sur ordinateur'], 'psi-lcp': 'Le contenu met trop de temps à s’afficher', images: 'Des images trop lourdes ralentissent le site',
  phone: ['Aucun numéro de téléphone visible', 'Le numéro n’est pas cliquable sur téléphone'], cta: ['Rien n’invite le visiteur à vous contacter', 'Le bouton de contact est trop loin dans la page'],
  form: ['Pas de moyen simple de vous écrire', 'Pas de formulaire pour vous écrire en un clic'], reviews: 'Aucun avis client pour rassurer', proof: 'Rien ne prouve votre sérieux',
  'title-local': ['Votre ville n’apparaît pas pour Google', 'Aucune ville clairement indiquée'], title: ['Le titre Google ne dit ni votre métier ni votre ville', 'Le titre Google est à retravailler'],
  words: ['Trop peu de texte pour que Google vous trouve', 'Le texte est un peu léger pour Google'], legal: 'Mentions légales absentes (obligation légale)', privacy: 'Politique de confidentialité absente (RGPD)',
  'vuln-lib': 'Des composants anciens avec des failles connues', 'old-cms': 'Un logiciel de site pas à jour, avec des failles connues', headers: 'Les réglages de sécurité recommandés ne sont pas activés',
  'form-http': 'Les messages de vos clients circulent sans protection', fresh: 'Une date ancienne donne l’impression d’un site abandonné', broken: 'Des liens mènent à des pages d’erreur',
  'site-size': 'Trop peu de pages pour être trouvé sur Google', maillage: ['Les pages ne sont pas reliées entre elles', 'Les pages sont peu reliées entre elles'], hierarchy: 'Les titres de la page sont mal organisés', description: 'Google n’a pas de résumé de votre site', h1: 'La page n’a pas de titre principal', mixed: 'Le cadenas de sécurité peut disparaître',
  redirect: 'La version non sécurisée du site reste ouverte', canonical: 'Vos pages envoient Google vers une autre adresse', 'js-content': 'Google ne voit pas le texte de vos pages',
  leftovers: 'Des textes d’exemple sont restés sur le site', 'titles-dup': 'Vos pages ont le même titre dans Google', 'empty-links': 'Des liens et boutons ne mènent nulle part',
  'no-contact': 'Aucun moyen de vous contacter depuis le site', 'legal-content': 'Les mentions légales sont incomplètes', sitemap: 'Google n’a pas de plan de votre site', 'pages-seo': 'Vos autres pages sont mal présentées dans Google', address: 'On ne sait pas où vous êtes', schema: 'Google ne dispose pas de votre fiche d’identité',
};
export const problemTitle = (c: Pick<Check, 'id' | 'label' | 'status'>) => { const t = PROBLEM[c.id]; return !t ? c.label : typeof t === 'string' ? t : c.status === 'bad' ? t[0] : t[1]; };

/* Mail à envoyer au prospect (Marc le relit puis l'envoie lui-même). */
/* Prénom utilisable dans « Bonjour X » : jamais une adresse e-mail ni un nom de domaine. */
export function cleanFirstName(v = '') {
  const t = v.trim();
  if (!t || /[@\d]|\.(fr|com|net|org)\b|https?:/i.test(t) || t.length > 40) return '';
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/* Argument commercial : réglages de sécurité absents → « je m'en occupe ». */
const securityLine = (b: Bulletin) => (b.checks ?? []).some((c) => /^(Réglages de sécurité de l’hébergement|Protections du serveur contre le piratage)$/.test(c.label) && c.status !== 'ok')
  ? 'Autre point : votre site n’a pas les réglages de sécurité recommandés sur son hébergement. Vous ne pouvez pas les activer vous-même, mais moi je peux m’en charger en quelques minutes.' : '';

/* Les 3 ou 4 points du mail : ceux qui rapportent des clients, dits comme un bénéfice.
   Classés par impact commercial ; les points techniques ou juridiques restent dans le bulletin. */
const MAIL_POINTS: [string, RegExp, string][] = [
  ['telephone', /numéro|téléphone (visible|cliquable|absent|n[’']est)/i, 'Afficher votre numéro bien en vue et cliquable, pour que les clients vous appellent directement'],
  ['ville', /\bville\b|métier|localit/i, 'Faire apparaître votre métier et votre ville dans Google, pour être trouvé par les clients près de chez vous'],
  ['contact', /bouton|devis|prendre contact|formulaire/i, 'Ajouter un bouton « Demander un devis » visible dès l’arrivée sur le site'],
  ['avis', /\bavis\b|témoignage/i, 'Mettre en avant vos avis clients, ce qui rassure avant d’appeler'],
  ['services', /page par service|chaque service|pages? de service|vos services/i, 'Créer une page pour chacun de vos services, pour être trouvé sur chaque recherche'],
  ['cadenas', /non sécurisé|cadenas|https/i, 'Sécuriser le site avec le cadenas, sans quoi les navigateurs affichent « Non sécurisé »'],
  ['vitesse', /(lent|vitesse|affich|charg).*(téléphone|mobile)|images?.*lourd/i, 'Accélérer le site sur téléphone, là où la plupart de vos clients vous cherchent'],
  ['photos', /photo|réalisation/i, 'Montrer vos réalisations en photos, pour donner confiance'],
  ['texte', /peu de texte|trop peu|textes? (trop|court)|étoffer/i, 'Étoffer les textes pour que Google comprenne bien ce que vous proposez'],
  ['google', /description|titres?/i, 'Soigner ce qui s’affiche dans Google pour chaque page, pour donner envie de cliquer'],
];
const MAIL_SKIP = /mentions légales|confidentialit|rgpd|cookie|réglages de sécurité|protections? du serveur|informations techniques|composants|logiciel|bouge|cls|serveur/i;
export function mailPoints(b: Bulletin, max = 4): string[] {
  const picked = new Map<string, number>();
  for (const p of b.priorities) {
    if (MAIL_SKIP.test(p.title)) continue;
    const i = MAIL_POINTS.findIndex(([, re]) => re.test(p.title));
    if (i >= 0 && !picked.has(MAIL_POINTS[i][0])) picked.set(MAIL_POINTS[i][0], i);
  }
  return [...picked.values()].sort((a, b) => a - b).slice(0, max).map((i) => MAIL_POINTS[i][2]);
}

const SIGN = ['Marc Bretzner', 'SEOKRAFT, création de sites internet à Strasbourg', '06 72 20 91 53', 'https://www.seokraft.fr'];
const tidy = (lines: string[]) => lines.filter((l, i, a) => !(l === '' && a[i - 1] === '')).join('\n');

/* Mail quand le prospect a demandé l'audit (formulaire du site). */
export function buildBulletinMail(b: Bulletin, firstName = '') {
  const name = cleanFirstName(firstName);
  const top = mailPoints(b);
  return tidy([
    `Objet : La note de votre site : ${fmt20(b.global)}/20`,
    '',
    `Bonjour${name ? ' ' + name : ''},`,
    '',
    `Merci pour votre demande. J’ai analysé ${b.host} : votre site obtient ${fmt20(b.global)}/20 (${b.verdict.toLowerCase()}).`,
    '',
    top.length ? 'Les points qui vous apporteront le plus de clients :' : '',
    ...top.map((p, i) => `${i + 1}. ${p}`),
    '',
    securityLine(b),
    '',
    'Votre audit complet, à consulter sur téléphone ou à télécharger en PDF :',
    `https://www.seokraft.fr/bulletin/${b.id}`,
    '',
    b.global >= 12 ? 'Votre site a déjà de bonnes bases. Avec quelques améliorations bien ciblées, je peux vous aider à en faire un vrai outil pour recevoir plus de demandes de clients, et ce serait un plaisir de vous accompagner.'
      : 'Rien d’insurmontable : avec les bonnes améliorations, je peux vous aider à en faire un vrai outil pour recevoir plus de demandes de clients, et ce serait un plaisir de vous accompagner.',
    '',
    'Si vous voulez qu’on regarde ensemble par quoi commencer, je vous propose un appel de 20 minutes, gratuit et sans engagement : https://www.seokraft.fr/rendez-vous',
    '',
    'Vous pouvez aussi simplement répondre à cet e-mail si vous avez une question : je vous réponds rapidement.',
    '',
    'Belle journée,',
    '',
    ...SIGN,
  ]);
}

/* Le problème principal, dit en une phrase pour « Un point m’a frappé : … ». */
const STRIKING: [string, RegExp, string][] = [
  ['ville', /\bville\b|métier|localit/i, 'le titre qui s’affiche dans Google ne dit ni votre métier ni votre ville'],
  ['telephone', /numéro|téléphone (visible|cliquable|absent|n[’']est)/i, 'votre numéro de téléphone n’apparaît pas clairement sur le site'],
  ['contact', /bouton|devis|prendre contact|formulaire/i, 'aucun bouton n’invite à vous contacter ou à demander un devis dès l’arrivée sur le site'],
  ['avis', /\bavis\b|témoignage/i, 'aucun avis client n’est visible sur le site'],
  ['services', /page par service|chaque service|pages? de service|vos services/i, 'vos services n’ont pas chacun leur page, ce qui vous rend moins visible sur Google'],
  ['cadenas', /non sécurisé|cadenas|https/i, 'votre site s’affiche comme « Non sécurisé » dans les navigateurs'],
  ['vitesse', /(lent|vitesse|affich|charg).*(téléphone|mobile)|images?.*lourd/i, 'votre site met du temps à s’afficher sur téléphone'],
  ['texte', /peu de texte|trop peu|textes? (trop|court)|étoffer/i, 'le site contient trop peu de texte pour que Google comprenne bien ce que vous proposez'],
  ['photos', /photo|réalisation/i, 'le site montre peu de vos réalisations en photos'],
  ['google', /description|titres?/i, 'vos pages sont mal présentées dans les résultats Google'],
];
export function strikingPoint(b: Bulletin): string {
  let best = -1;
  for (const p of b.priorities) {
    if (MAIL_SKIP.test(p.title)) continue;
    const i = STRIKING.findIndex(([, re]) => re.test(p.title));
    if (i >= 0 && (best < 0 || i < best)) best = i;
  }
  if (best >= 0) return STRIKING[best][2];
  const first = b.priorities.find((p) => !MAIL_SKIP.test(p.title)) ?? b.priorities[0];
  return first ? first.title.charAt(0).toLowerCase() + first.title.slice(1) : 'plusieurs points freinent votre visibilité sur Google';
}

/* Mail de prospection (le prospect n'a rien demandé) : modèle de Marc, mot pour mot. Pas de note, pas de prix. */
export function buildProspectMail(b: Bulletin, firstName = '') {
  const name = cleanFirstName(firstName);
  return [
    `Objet : Votre site ${b.host}`,
    '',
    `Bonjour${name ? ' ' + name : ''},`,
    'Je suis Marc Bretzner, développeur web indépendant basé à Fegersheim.',
    `En regardant les entreprises autour de moi, je suis tombé sur votre site ${b.host} et j’ai pris le temps d’en faire l’audit, offert et sans engagement.`,
    `Un point m’a frappé : ${strikingPoint(b)}.`,
    'Dans l’audit complet, vous trouverez aussi d’autres pistes pour améliorer votre site, à consulter ou à télécharger en PDF :',
    `https://www.seokraft.fr/bulletin/${b.id}`,
    'Je peux vous aider à corriger ces points, pour que votre site vous apporte davantage de clients.',
    'Voulez-vous qu’on en parle ?',
    'Il suffit de répondre à ce mail ou de réserver un appel téléphonique gratuit et sans engagement.',
    'https://www.seokraft.fr/rendez-vous',
    'Cordialement,',
    'Marc Bretzner EI Bretzner Marc - SEOKRAFT',
    '✉️ contact@seokraft.fr',
    '🌐 Site internet : https://seokraft.fr',
    '♦️ LinkedIn : www.linkedin.com/in/marc-bretzner-développeur-web',
    'Si vous ne souhaitez plus recevoir de message de ma part, répondez simplement STOP à cet e-mail.',
  ].join('\n');
}
