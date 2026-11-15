/* Audit en deux temps, sans IA payante :
   1. l'outil MESURE le site (technique + vitesse Google) et donne un texte à coller dans le projet Claude « Audits SEOKRAFT » ;
   2. Marc colle le résultat du projet (bloc JSON) : l'outil le CONTRÔLE, y ajoute ses mesures et PUBLIE la page d'audit. */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { runAudit, pageSpeedServer, saveBulletin, siteKey, AuditError } from './auditEngine';
import { half, verdict20, type AuditResult, type Bulletin, type Speed, type Status, type Level, type NoteId, type PageDetail } from '../components/auditTypes';

export type Measures = {
  url: string; host: string; at: string;
  speed: Speed | null; speedDesktop: Speed | null; desktopScreenshot?: string;
  pages?: { url: string; label: string }[]; pagesDetail?: PageDetail[];
};

const DIR = path.join(process.cwd(), '.data', 'measures');
const blobName = (host: string) => `measures/${siteKey(host)}.json`;

async function saveMeasures(m: Measures) {
  const body = JSON.stringify(m);
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import('@vercel/blob');
    await put(blobName(m.host), body, { access: 'public', addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json' });
    return;
  }
  await fs.mkdir(DIR, { recursive: true });
  await fs.writeFile(path.join(DIR, `${siteKey(m.host)}.json`), body);
}

async function loadMeasures(host: string): Promise<Measures | null> {
  try {
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { head } = await import('@vercel/blob');
      const meta = await head(blobName(host));
      const r = await fetch(meta.url, { cache: 'no-store' });
      return r.ok ? ((await r.json()) as Measures) : null;
    }
    return JSON.parse(await fs.readFile(path.join(DIR, `${siteKey(host)}.json`), 'utf8')) as Measures;
  } catch { return null; }
}

const ICON: Record<Status, string> = { ok: 'OK', warn: 'À REVOIR', bad: 'PROBLÈME' };
const speedLine = (label: string, s: Speed | null) => s && s.performance !== null
  ? `- ${label} : ${s.performance}/100 (premier affichage ${s.fcp}, contenu principal ${s.lcp}, page qui bouge ${s.cls})`
  : `- ${label} : mesure Google indisponible (relancer « Mesurer » dans quelques minutes)`;

/* Étape 1 : mesurer, ranger les mesures, rendre le texte à coller dans le projet. */
export async function measureSite(input: string): Promise<{ measures: Measures; text: string; result: AuditResult }> {
  const result = await runAudit(input);
  const [speed, desktop] = await Promise.all([pageSpeedServer(result.url, 'mobile'), pageSpeedServer(result.url, 'desktop')]);
  const measures: Measures = {
    url: result.url, host: result.host, at: new Date().toISOString(),
    speed: speed ? { ...speed, screenshot: undefined } : null,
    speedDesktop: desktop ? { ...desktop, screenshot: undefined } : null,
    desktopScreenshot: desktop?.screenshot,
    pages: result.pages, pagesDetail: result.pagesDetail,
  };
  await saveMeasures(measures);
  const auto = result.checks.filter((c) => !c.id.startsWith('psi-'));
  const text = [
    `MESURES SEOKRAFT — ${result.url} — ${new Date().toLocaleDateString('fr-FR')}`,
    '',
    'VITESSE (mesurée par Google, chiffres définitifs) :',
    speedLine('Sur téléphone', speed),
    speedLine('Sur ordinateur', desktop),
    '',
    'PAGES LUES :',
    ...(result.pagesDetail ?? []).map((p) => `- ${p.label} (${p.path}) : titre Google « ${p.title || '—'} » · description ${p.description ? 'présente' : 'absente'} · grand titre « ${p.h1 || '—'} » · ${p.words} mots`),
    '',
    `ADRESSE DU SITE : ${result.host}${/\.(odoo|wixsite|jimdofree|webnode|e-monsite|site123|webflow|godaddysites|wordpress|blogspot|carrd|mystrikingly|zyrosite|ueniweb|over-blog)\.|\.business\.site$/i.test(result.host) ? ' (adresse d’une plateforme gratuite : information seulement, ne retire aucun point)' : ''}`,
    '',
    'VÉRIFICATIONS AUTOMATIQUES (indices : à confirmer en ouvrant le site, l’outil peut se tromper) :',
    ...auto.map((c) => `- [${ICON[c.status]}] ${c.label} : ${c.detail}`),
  ].join('\n');
  return { measures, text, result };
}

/* ---------- Étape 2 : importer le résultat du projet ---------- */
/* Notes « référencement d'abord » : la visibilité sur Google pèse le plus. */
const NOTE_IDS = ['visibilite', 'structure', 'message', 'vitesse', 'securite'] as const;
const WEIGHTS: Record<(typeof NOTE_IDS)[number], number> = { visibilite: 3, structure: 3, message: 2, vitesse: 1, securite: 1 };
const LEVELS: Level[] = ['critique', 'important', 'planifier'];
const STATUT: Record<string, Status> = { oui: 'ok', partiel: 'warn', non: 'bad', ok: 'ok', warn: 'warn', bad: 'bad' };
const str = (v: unknown, max = 1200) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const isHalf = (n: unknown): n is number => typeof n === 'number' && n >= 0 && n <= 20 && Math.abs(n * 2 - Math.round(n * 2)) < 1e-9;

/* Extrait le bloc JSON même si Marc colle toute la réponse du projet. */
function extractJson(raw: string): unknown {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fenced ? fenced[1] : raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1);
  try { return JSON.parse(body.replace(/[“”]/g, '"')); } catch { throw new AuditError('Le texte collé n’est pas un audit valide : copiez le bloc qui commence par { "format": "seokraft-audit-1".'); }
}

export type ImportResult = { bulletin: Bulletin; warnings: string[] };
export async function importAudit(raw: string, given?: Measures): Promise<ImportResult> {
  const d = extractJson(raw) as Record<string, unknown>;
  const errors: string[] = []; const warnings: string[] = [];
  if (d.format !== 'seokraft-audit-1') errors.push('Format inconnu (attendu : "seokraft-audit-1").');
  let url = '';
  try { url = new URL(str(d.url, 300)).toString(); } catch { errors.push('Adresse du site manquante ou invalide (champ "url").'); }

  const notesIn = (d.notes ?? {}) as Record<string, unknown>;
  const notes = {} as Record<(typeof NOTE_IDS)[number], number>;
  for (const k of NOTE_IDS) { if (isHalf(notesIn[k])) notes[k] = notesIn[k] as number; else errors.push(`Note « ${k} » manquante ou invalide (nombre de 0 à 20, au demi-point).`); }

  const priorities = (Array.isArray(d.priorities) ? d.priorities : []).map((p) => p as Record<string, unknown>)
    .filter((p) => LEVELS.includes(p.level as Level) && str(p.title))
    .map((p) => ({ level: p.level as Level, title: str(p.title, 140), text: str(p.text, 700) }))
    .sort((a, b) => LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level)).slice(0, 6);
  if (!priorities.length) errors.push('Aucune priorité valide (champ "priorities").');

  /* Contrôle du calcul : moyenne pondérée, puis plafond lié aux notes de référencement. */
  let global = typeof d.global === 'number' ? d.global : NaN;
  if (!errors.length) {
    let expected = half(NOTE_IDS.reduce((s, k) => s + notes[k] * WEIGHTS[k], 0) / NOTE_IDS.reduce((s, k) => s + WEIGHTS[k], 0));
    /* Jamais plus de 4 points au-dessus de la plus basse des deux notes de référencement :
       un site mal construit pour Google ne peut pas avoir une bonne note. (Les autres plafonds sont appliqués par le projet.) */
    expected = Math.min(expected, Math.min(notes.visibilite, notes.structure) + 4);
    /* Une note plus basse que le calcul est acceptée (plafond « introuvable sur Google ») ; plus haute, elle est corrigée. */
    if (!isHalf(global)) { global = expected; warnings.push(`Note globale absente : calculée à ${String(expected).replace('.', ',')}/20.`); }
    else if (global > expected + 0.5) { warnings.push(`Note globale corrigée : ${String(global).replace('.', ',')} → ${String(expected).replace('.', ',')}/20 (calcul et plafonds du barème).`); global = expected; }
    else if (global < expected - 0.5) warnings.push(`Note globale ${String(global).replace('.', ',')}/20, sous le calcul (${String(expected).replace('.', ',')}) : plafond du barème appliqué (site qui ne s’ouvre pas : 3 ; bloqué pour Google : 6 ; problèmes graves : 12 ou 9), vérifier que c’est bien le cas.`);
  }

  const constats = (Array.isArray(d.constats) ? d.constats : []).map((c) => c as Record<string, unknown>)
    .filter((c) => str(c.question) && str(c.reponse))
    .map((c) => ({ question: str(c.question, 160), reponse: str(c.reponse, 220), ...(STATUT[String(c.statut).toLowerCase()] ? { statut: STATUT[String(c.statut).toLowerCase()] } : {}) })).slice(0, 8);
  const checks = (Array.isArray(d.checks) ? d.checks : []).map((c) => c as Record<string, unknown>)
    .filter((c) => (NOTE_IDS as readonly string[]).includes(String(c.group)) && STATUT[String(c.status)] && str(c.label))
    .map((c) => ({ group: c.group as NoteId, label: str(c.label, 140), status: STATUT[String(c.status)], detail: str(c.detail, 500), advice: str(c.advice, 500) }));
  const positives = (Array.isArray(d.positives) ? d.positives : []).map((x) => str(x, 240)).filter(Boolean).slice(0, 6);
  const essentiel = str(d.essentiel, 1200);
  if (!essentiel) errors.push('Synthèse manquante (champ "essentiel").');

  if (errors.length) throw new AuditError(`Audit non publié : ${errors.join(' ')}`);

  const host = new URL(url).hostname.replace(/^www\./, '');
  const m = given && siteKey(given.host) === siteKey(host) ? given : await loadMeasures(host);
  if (!m) warnings.push('Aucune mesure trouvée pour ce site : l’audit est publié sans la partie vitesse. Lancez « Mesurer » avant d’importer.');
  else if (Date.now() - Date.parse(m.at) > 7 * 86400000) warnings.push('Les mesures de ce site datent de plus de 7 jours.');

  /* Cohérence avec la vitesse mesurée par Google. */
  const perf = m?.speed?.performance;
  if (typeof perf === 'number') {
    if (perf >= 90 && notes.vitesse < 12) warnings.push(`Vitesse notée ${notes.vitesse}/20 alors que Google mesure ${perf}/100 sur téléphone : vérifier.`);
    if (perf < 50 && notes.vitesse > 12) warnings.push(`Vitesse notée ${notes.vitesse}/20 alors que Google mesure seulement ${perf}/100 sur téléphone : vérifier.`);
  }
  const b: Bulletin = {
    id: randomBytes(12).toString('hex'), version: 2,
    url: m?.url ?? url, host, createdAt: new Date().toISOString(),
    global, notes, verdict: verdict20(global),
    essentiel, impression: str(d.impression, 600),
    priorities, positives, constats,
    speed: m?.speed ?? null, speedDesktop: m?.speedDesktop ?? null,
    ai: true, pages: m?.pages, pagesDetail: m?.pagesDetail, checks,
    ...(m?.desktopScreenshot ? { desktopScreenshot: m.desktopScreenshot } : {}),
  };
  await saveBulletin(b);
  return { bulletin: b, warnings };
}
