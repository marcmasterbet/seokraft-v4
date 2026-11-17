/* Barème SEOKRAFT, appliqué par le code (et non plus par l'IA).
   Les mesures de l'outil donnent les notes Référencement, Vitesse et Sécurité ; l'IA ne donne que la note
   « Textes et message », qui ne peut pas dépasser ce que les vérifications de contact autorisent.
   Une même gravité retire toujours le même nombre de points, et l'étiquette affichée est celle qui a servi au calcul.
   Fichier sans dépendance d'exécution : testable directement (node tests/regression/score.test.ts). */
import type { Check, Speed, Status, PageDetail, NoteId } from '../components/auditTypes';

export type Gravity = 'grave' | 'important' | 'prevoir';
export type Level = Gravity | 'info' | 'ok';
export type Part = 'acces' | 'preparation' | 'message' | 'vitesse' | 'securite';

export const POINTS: Record<Gravity, number> = { grave: 6, important: 3, prevoir: 1 };
export const LEVEL_TEXT: Record<Level, string> = { grave: 'Grave', important: 'Important', prevoir: 'À prévoir', info: 'À noter', ok: 'Correct' };
export const PART_LABEL: Record<Part, string> = { acces: 'Accès pour Google', preparation: 'Préparation des pages', message: 'Textes et message', vitesse: 'Vitesse et mobile', securite: 'Sécurité et conformité' };

const half = (n: number) => Math.round(n * 2) / 2;
const clamp20 = (n: number) => Math.max(0, Math.min(20, n));

/* Gravité de chaque vérification, selon son statut. `null` = aucun point retiré (information seulement).
   La gravité peut dépendre des autres vérifications (ex. confidentialité absente : grave seulement s'il y a un formulaire). */
type Ctx = { st: (id: string) => Status | undefined; has: (id: string) => boolean; detail: (id: string) => string };
type Rule = { part: Part; bad?: Gravity | null | ((x: Ctx) => Gravity | null); warn?: Gravity | null | ((x: Ctx) => Gravity | null); skip?: (x: Ctx) => boolean };

export const RULES: Record<string, Rule> = {
  /* --- Référencement : accès pour Google --- */
  indexable: { part: 'acces', bad: 'grave' },
  robots: { part: 'acces', bad: 'grave', warn: 'important' },
  sitemap: { part: 'acces', warn: 'important' },
  canonical: { part: 'acces', bad: 'grave', warn: 'important' },
  'js-content': { part: 'acces', bad: 'grave' },
  broken: { part: 'acces', bad: 'important' },
  lang: { part: 'acces', warn: 'prevoir' },
  /* --- Référencement : préparation des pages --- */
  title: { part: 'preparation', bad: 'important', warn: 'prevoir' },
  'titles-dup': { part: 'preparation', bad: 'grave' },
  'pages-seo': { part: 'preparation', bad: 'important', warn: 'prevoir', skip: (x) => x.st('titles-dup') === 'bad' },
  description: { part: 'preparation', bad: 'important', warn: 'prevoir' },
  h1: { part: 'preparation', bad: 'important', warn: 'prevoir' },
  hierarchy: { part: 'preparation', bad: 'prevoir', warn: 'prevoir', skip: (x) => x.st('h1') === 'bad' || x.st('h1') === 'warn' },
  structure: { part: 'preparation', bad: 'prevoir' },
  'title-local': { part: 'preparation', bad: 'important' },
  'site-size': { part: 'preparation', bad: 'grave', warn: 'prevoir' },
  words: { part: 'preparation', bad: 'important', skip: (x) => x.st('js-content') === 'bad' },
  maillage: { part: 'preparation', bad: 'important', warn: 'prevoir', skip: (x) => x.st('site-size') === 'bad' },
  schema: { part: 'preparation', bad: 'prevoir', warn: 'prevoir' },
  alt: { part: 'preparation', bad: 'prevoir', warn: (x) => (/aucune image/i.test(x.detail('alt')) ? null : 'prevoir') },
  /* --- Textes et message (vérifications de contact ; le reste est jugé par l'IA) --- */
  leftovers: { part: 'message', bad: 'grave' },
  'empty-links': { part: 'message', bad: 'important', warn: 'prevoir' },
  phone: { part: 'message', bad: 'prevoir', warn: 'important', skip: (x) => noContact(x) },
  form: { part: 'message', bad: 'prevoir', warn: null, skip: (x) => noContact(x) },
  cta: { part: 'message', bad: 'important', warn: 'prevoir', skip: (x) => noContact(x) },
  /* Aucune preuve du tout (ni avis, ni réalisations, ni expérience) : important. Des avis mais rien d'autre : à prévoir. */
  proof: { part: 'message', warn: (x) => (/^aucune preuve/i.test(x.detail('proof')) ? 'important' : 'prevoir') },
  address: { part: 'message', warn: 'prevoir' },
  fresh: { part: 'message', bad: 'prevoir', warn: null },
  reviews: { part: 'message', bad: null, warn: null },
  'email-pro': { part: 'message', warn: null },
  photos: { part: 'message', bad: null, warn: null },
  og: { part: 'message', warn: null },
  favicon: { part: 'message', warn: null },
  /* --- Vitesse et mobile (la note de départ vient de la mesure Google sur téléphone) --- */
  viewport: { part: 'vitesse', bad: 'grave' },
  'psi-cls': { part: 'vitesse', bad: 'important', warn: null },
  'psi-perf-d': { part: 'vitesse', bad: 'important', warn: null },
  images: { part: 'vitesse', bad: 'prevoir', warn: 'prevoir' },
  'psi-perf': { part: 'vitesse', bad: null, warn: null },
  'psi-lcp': { part: 'vitesse', bad: null, warn: null },
  'psi-lcp-d': { part: 'vitesse', bad: null, warn: null },
  'psi-cls-d': { part: 'vitesse', bad: 'important', warn: null },
  'psi-a11y': { part: 'message', bad: null, warn: null },
  weight: { part: 'vitesse', bad: null, warn: null },
  ttfb: { part: 'vitesse', bad: null, warn: null },
  builder: { part: 'vitesse', bad: null, warn: null },
  /* --- Sécurité et conformité --- */
  https: { part: 'securite', bad: 'grave' },
  redirect: { part: 'securite', bad: 'grave' },
  cert: { part: 'securite', bad: 'grave', warn: 'prevoir' },
  'form-http': { part: 'securite', bad: 'grave' },
  mixed: { part: 'securite', bad: 'important', warn: 'prevoir' },
  outdated: { part: 'securite', bad: 'important', warn: 'prevoir' },
  'old-cms': { part: 'securite', bad: 'important', warn: 'prevoir' },
  'vuln-lib': { part: 'securite', warn: 'prevoir' },
  headers: { part: 'securite', warn: 'prevoir' },
  'server-version': { part: 'securite', warn: 'prevoir', skip: (x) => x.st('headers') === 'warn' },
  'cookie-flags': { part: 'securite', warn: 'prevoir', skip: (x) => x.st('headers') === 'warn' },
  'psi-bp': { part: 'securite', bad: null, warn: null },
  legal: { part: 'securite', bad: 'grave', warn: 'important' },
  'legal-content': { part: 'securite', warn: 'important' },
  privacy: { part: 'securite', bad: (x) => (x.has('form-info') ? 'grave' : 'important') },
  cookies: { part: 'securite', warn: 'prevoir' },
  'form-info': { part: 'securite', warn: 'prevoir' },
  cgv: { part: 'securite', bad: 'grave' },
};

/* Aucun moyen de contact : ni téléphone, ni formulaire, ni bouton. Un seul problème grave, au lieu de trois. */
function noContact(x: Ctx) { return x.st('phone') === 'bad' && x.st('form') === 'bad' && x.st('cta') === 'bad'; }

/* Problème ajouté par l'IA (ce que le code ne peut pas juger : titres génériques, une seule page pour plusieurs services…). */
export type Addition = { note: 'referencement' | 'message'; level: Gravity; title: string };

export type Penalty = { id: string; part: Part; gravity: Gravity; points: number; label: string; detail: string; source: 'mesure' | 'ia' };
export type CheckLevel = { id: string; part: Part; level: Level };

export type ScoreInput = {
  checks: Check[];
  speed: Speed | null;
  speedDesktop?: Speed | null;
  pagesDetail?: PageDetail[];
  aiMessage?: number | null;     // note « Textes et message » proposée par l'IA
  aiVitesse?: number | null;     // utilisée seulement si la mesure Google manque
  additions?: Addition[];
};

export type ScoreResult = {
  notes: { referencement: number; message: number; vitesse: number; securite: number };
  parts: Record<Part, number>;
  global: number;
  cap?: string;
  penalties: Penalty[];
  levels: CheckLevel[];
  messageMax: number;            // plafond de la note « message » fixé par les vérifications
  speedBase: number | null;      // note de départ de la vitesse, d'après Google
};

/* Note de départ « Vitesse » d'après la mesure Google sur téléphone. */
export function speedBase(perf: number | null | undefined): number | null {
  if (perf === null || perf === undefined || Number.isNaN(perf)) return null;
  if (perf >= 90) return 20;
  if (perf >= 50) return half(12 + ((perf - 50) * 6) / 39);
  if (perf >= 25) return 9;     // « problème important » : 12 − 3
  return 6;                     // « grave » : 12 − 6
}

/* Titres Google identiques (ou absents) sur presque tout le site : calculé à partir des pages lues. */
export function duplicateTitles(pages: PageDetail[] = []): { bad: boolean; detail: string } | null {
  if (pages.length < 3) return null;
  const count = new Map<string, number>();
  for (const p of pages) { const t = (p.title || '').trim().toLowerCase(); count.set(t, (count.get(t) || 0) + 1); }
  const same = pages.filter((p) => { const t = (p.title || '').trim().toLowerCase(); return !t || (count.get(t) || 0) > 1; });
  const bad = same.length >= Math.ceil((pages.length * 2) / 3);
  const shown = [...new Set(same.map((p) => p.title || 'aucun titre'))].slice(0, 2).map((t) => `« ${t} »`).join(', ');
  return { bad, detail: bad ? `${same.length} pages sur ${pages.length} ont le même titre dans Google (${shown}).` : `Les titres Google sont différents d’une page à l’autre.` };
}

export function scoreSite(input: ScoreInput): ScoreResult {
  const checks = [...input.checks];
  const dup = duplicateTitles(input.pagesDetail);
  if (dup && !checks.some((c) => c.id === 'titles-dup')) checks.push({ id: 'titles-dup', cat: 'google', label: 'Titres Google propres à chaque page', status: dup.bad ? 'bad' : 'ok', detail: dup.detail,
    advice: dup.bad ? 'Chaque page doit avoir son propre titre, avec ce qu’elle propose et la ville : sinon Google ne sait pas les distinguer.' : 'Rien à faire.' });
  const byId = new Map(checks.map((c) => [c.id, c]));
  const ctx: Ctx = { st: (id) => byId.get(id)?.status, has: (id) => byId.has(id), detail: (id) => byId.get(id)?.detail || '' };

  const penalties: Penalty[] = [];
  const levels: CheckLevel[] = [];
  for (const c of checks) {
    const rule = RULES[c.id];
    if (!rule) { levels.push({ id: c.id, part: 'message', level: c.status === 'ok' ? 'ok' : 'info' }); continue; }
    if (c.status === 'ok') { levels.push({ id: c.id, part: rule.part, level: 'ok' }); continue; }
    const raw = c.status === 'bad' ? rule.bad : rule.warn;
    const g = typeof raw === 'function' ? raw(ctx) : raw ?? null;
    /* Un problème déjà compté ailleurs (ex. maillage d'un site d'une seule page) reste affiché, sans retirer de points. */
    if (!g || rule.skip?.(ctx)) { levels.push({ id: c.id, part: rule.part, level: 'info' }); continue; }
    levels.push({ id: c.id, part: rule.part, level: g });
    penalties.push({ id: c.id, part: rule.part, gravity: g, points: POINTS[g], label: c.label, detail: c.detail, source: 'mesure' });
  }
  if (noContact(ctx)) penalties.push({ id: 'no-contact', part: 'message', gravity: 'grave', points: 6, label: 'Aucun moyen de contacter l’entreprise', detail: 'Ni téléphone, ni formulaire, ni bouton de contact sur les pages lues.', source: 'mesure' });

  /* Ajouts de l'IA : uniquement des problèmes en plus, jamais des points rendus. 4 au maximum. */
  for (const a of (input.additions ?? []).slice(0, 4)) {
    const part: Part = a.note === 'referencement' ? 'preparation' : 'message';
    penalties.push({ id: `ia-${penalties.length}`, part, gravity: a.level, points: POINTS[a.level], label: a.title, detail: a.title, source: 'ia' });
  }

  const graves = (p: Part) => penalties.filter((x) => x.part === p && x.gravity === 'grave').length;
  const lost = (p: Part) => penalties.filter((x) => x.part === p).reduce((s, x) => s + x.points, 0);
  const capped = (p: Part, n: number) => half(clamp20(graves(p) ? Math.min(n, 9) : n));

  /* Référencement : une seule note. Elle part de 20 et perd tous les points, accès comme préparation des pages
     (plus de moyenne de deux parties : un « 20/20 » sur l'accès ne doit jamais remonter un site que Google trouve mal). */
  const acces = capped('acces', 20 - lost('acces'));
  const preparation = capped('preparation', 20 - lost('preparation'));
  const referencement = half(clamp20((graves('acces') || graves('preparation')) ? Math.min(20 - lost('acces') - lost('preparation'), 9) : 20 - lost('acces') - lost('preparation')));

  const messageMax = capped('message', 20 - lost('message'));
  const ai = typeof input.aiMessage === 'number' && !Number.isNaN(input.aiMessage) ? half(clamp20(input.aiMessage)) : null;
  const message = ai === null ? messageMax : Math.min(ai, messageMax);

  const base = speedBase(input.speed?.performance);
  const vBase = base ?? (typeof input.aiVitesse === 'number' ? half(clamp20(input.aiVitesse)) : 14);
  const vitesse = capped('vitesse', vBase - lost('vitesse'));
  const securite = capped('securite', 20 - lost('securite'));

  let global = half((referencement * 6 + message * 2 + vitesse + securite) / 10);
  const seoGraves = graves('acces') + graves('preparation') + graves('message');
  /* Un site que Google ne peut pas bien trouver ne peut pas être « moyen » : un bon message ne compense pas l'absence de visiteurs. */
  const refGrave = graves('acces') + graves('preparation') > 0;
  const caps: [boolean, number, string][] = [
    [ctx.st('cert') === 'bad', 3, 'le certificat de sécurité est expiré (alerte rouge dans le navigateur)'],
    [ctx.st('indexable') === 'bad' || ctx.st('robots') === 'bad', 6, 'le site est bloqué pour Google'],
    [refGrave, 9, 'un problème grave empêche Google de bien trouver le site'],
    [seoGraves >= 3, 9, `${seoGraves} problèmes graves empêchent Google ou les visiteurs de bien utiliser le site`],
    [seoGraves >= 1, 12, 'un problème grave freine la prise de contact'],
    [true, referencement + 4, 'la note globale ne peut pas dépasser la note Référencement de plus de 4 points'],
  ];
  const hit = caps.filter(([on, max]) => on && global > max).sort((a, b) => a[1] - b[1])[0];
  let cap: string | undefined;
  if (hit) { global = half(hit[1]); cap = `Note limitée à ${String(global).replace('.', ',')}/20 : ${hit[2]}.`; }

  return {
    notes: { referencement, message, vitesse, securite },
    parts: { acces, preparation, message, vitesse, securite },
    global, cap, penalties, levels, messageMax, speedBase: base,
  };
}

/* Groupe d'affichage d'une partie dans le bulletin (grille à 4 notes). */
export const GROUP_OF_PART: Record<Part, NoteId> = { acces: 'referencement', preparation: 'referencement', message: 'message', vitesse: 'vitesse', securite: 'securite' };

/* Détail du calcul, en clair, pour Marc (jamais montré au prospect). */
export function explainScore(s: ScoreResult): string[] {
  const line = (p: Part) => {
    const list = s.penalties.filter((x) => x.part === p);
    return `${PART_LABEL[p]} : ${String(s.parts[p]).replace('.', ',')}/20${list.length ? ` (${list.map((x) => `${x.label} ${LEVEL_TEXT[x.gravity].toLowerCase()} −${x.points}${x.source === 'ia' ? ', ajouté par l’IA' : ''}`).join(' ; ')})` : ' (rien à retirer)'}`;
  };
  const ref = s.penalties.filter((x) => x.part === 'acces' || x.part === 'preparation');
  return [
    `Référencement : ${String(s.notes.referencement).replace('.', ',')}/20${ref.length ? ` (${ref.map((x) => `${x.label} ${LEVEL_TEXT[x.gravity].toLowerCase()} −${x.points}${x.source === 'ia' ? ', ajouté par l’IA' : ''}`).join(' ; ')}${ref.some((x) => x.gravity === 'grave') ? ' ; plafonnée à 9 à cause d’un problème grave' : ''})` : ' (rien à retirer)'}`,
    line('message') + (s.notes.message < s.messageMax ? ` → note de l’IA retenue : ${String(s.notes.message).replace('.', ',')}` : ''),
    `${line('vitesse')}${s.speedBase !== null ? `, départ ${String(s.speedBase).replace('.', ',')} d’après Google` : ', mesure Google absente'}`,
    line('securite'),
    `Note globale : ${String(s.global).replace('.', ',')}/20${s.cap ? ` — ${s.cap}` : ''}`,
  ];
}
