/* Audit en deux temps, sans IA payante :
   1. l'outil MESURE le site (technique + vitesse Google) et donne un texte à coller dans le projet Claude « Audits SEOKRAFT » ;
   2. Marc colle le résultat du projet (bloc JSON) : l'outil le CONTRÔLE, y ajoute ses mesures et PUBLIE la page d'audit. */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { runAudit, pageSpeedServer, saveBulletin, siteKey, AuditError } from './auditEngine';
import { half, verdict20, speedChecks, problemTitle, type AuditResult, type Bulletin, type BulletinCheck, type Check, type Speed, type Status, type Level, type NoteId, type PageDetail, type Priority } from '../components/auditTypes';
import { scrubContradictions, validateBulletin } from '../components/bulletinCheck';
import { scoreSite, explainScore, GROUP_OF_PART, type Addition, type Gravity, type ScoreResult } from './auditScore';

export type Measures = {
  url: string; host: string; at: string;
  speed: Speed | null; speedDesktop: Speed | null; desktopScreenshot?: string;
  pages?: { url: string; label: string }[]; pagesDetail?: PageDetail[];
  checks?: Check[];   // vérifications de l'outil : c'est d'elles que le code tire les notes (barème fixe)
  channels?: string[]; // moyens de contact détectés (une seule liste, partagée par toutes les sections du bulletin)
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
const fmt = (n: number) => String(n).replace('.', ',');
/* Adresses de plateformes ou adresses provisoires (outils de création, hébergeurs, générateurs de sites par IA). */
const PLATFORM = /\.(odoo|wixsite|jimdofree|webnode|e-monsite|site123|webflow|godaddysites|wordpress|blogspot|carrd|mystrikingly|zyrosite|ueniweb|over-blog)\.|\.business\.site$|\.(manus\.space|lovable\.app|vercel\.app|netlify\.app|bolt\.host|replit\.app|framer\.(website|ai)|github\.io|pages\.dev|onrender\.com|web\.app|firebaseapp\.com|hostingersite\.com)$/i;

/* Toutes les vérifications chiffrées d'un site : celles de l'outil + celles tirées de la vitesse Google. */
const allChecks = (m: Measures): Check[] => [...(m.checks ?? []), ...speedChecks(m.speed), ...speedChecks(m.speedDesktop)];
function scoreOf(m: Measures, ai: { message?: number; vitesse?: number } | null, additions: Addition[]): ScoreResult {
  return scoreSite({ checks: allChecks(m), speed: m.speed, speedDesktop: m.speedDesktop, pagesDetail: m.pagesDetail, aiMessage: ai?.message ?? null, aiVitesse: ai?.vitesse ?? null, additions });
}
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
    pages: result.pages, pagesDetail: result.pagesDetail, checks: result.checks, channels: result.content?.channels ?? [],
  };
  await saveMeasures(measures);
  const score = scoreOf(measures, null, []);
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
    `ADRESSE DU SITE : ${result.host}${PLATFORM.test(result.host) ? ' (adresse d’une plateforme ou adresse provisoire : information seulement, ne retire aucun point)' : ''}`,
    '',
    'NOTES CALCULÉES PAR L’OUTIL (barème fixe, définitives : ne les recalcule pas, l’outil les impose à l’import) :',
    ...explainScore(score).map((l) => `- ${l}`),
    '',
    `TA PART : la note « message » (Textes et message), qui ne pourra pas dépasser ${fmt(score.messageMax)}/20, et les textes de l’audit.`,
    'Si tu constates sur le site un problème que l’outil ne peut pas mesurer (titres Google génériques, une seule page pour plusieurs services, formulaire qui n’envoie rien, message vague…), ajoute-le au JSON dans "ajouts" : [{ "note": "referencement" | "message", "niveau": "grave" | "important" | "prevoir", "titre": "Constat court" }]. 4 au maximum, uniquement des problèmes vérifiés et non déjà listés ci-dessus : chacun retire 6, 3 ou 1 point.',
    '',
    'VÉRIFICATIONS AUTOMATIQUES (indices : à confirmer en ouvrant le site, l’outil peut se tromper) :',
    ...auto.map((c) => `- [${ICON[c.status]}] ${c.label} : ${c.detail}`),
  ].join('\n');
  return { measures, text, result };
}

/* ---------- Étape 2 : importer le résultat du projet ---------- */
/* Notes « référencement d'abord » : la visibilité sur Google pèse le plus. */
const NOTE_IDS = ['referencement', 'message', 'vitesse', 'securite'] as const;
const WEIGHTS: Record<(typeof NOTE_IDS)[number], number> = { referencement: 6, message: 2, vitesse: 1, securite: 1 };
const LEVELS: Level[] = ['critique', 'important', 'planifier'];
const STATUT: Record<string, Status> = { oui: 'ok', partiel: 'warn', non: 'bad', ok: 'ok', warn: 'warn', bad: 'bad' };
const str = (v: unknown, max = 1200) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const isHalf = (n: unknown): n is number => typeof n === 'number' && n >= 0 && n <= 20 && Math.abs(n * 2 - Math.round(n * 2)) < 1e-9;

/* Extrait le bloc JSON même si Marc colle toute la réponse du projet. */
export function extractJson(raw: string): unknown {
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

  const notesIn = { ...((d.notes ?? {}) as Record<string, unknown>) };
  /* Ancienne grille à 5 notes (projet pas encore mis à jour) : « Prêt pour Google » et « Référencement des pages » fusionnent. */
  if (notesIn.referencement === undefined && isHalf(notesIn.visibilite) && isHalf(notesIn.structure)) {
    notesIn.referencement = half(((notesIn.visibilite as number) + (notesIn.structure as number)) / 2);
    warnings.push('Audit rendu avec l’ancienne grille à 5 notes : « Prêt pour Google » et « Référencement des pages » ont été fusionnés. Mets à jour les instructions du projet Claude.');
  }
  /* Seule la note « message » est indispensable : les trois autres sont calculées par l'outil à partir de ses mesures. */
  const notes = {} as Record<(typeof NOTE_IDS)[number], number>;
  for (const k of NOTE_IDS) { if (isHalf(notesIn[k])) notes[k] = notesIn[k] as number; else if (k === 'message') errors.push('Note « message » manquante ou invalide (nombre de 0 à 20, au demi-point).'); }
  const GRAV: Record<string, Gravity> = { grave: 'grave', critique: 'grave', important: 'important', prevoir: 'prevoir', 'à prévoir': 'prevoir', 'a prevoir': 'prevoir', planifier: 'prevoir' };
  const additions: Addition[] = (Array.isArray(d.ajouts) ? d.ajouts : []).map((a) => a as Record<string, unknown>)
    .filter((a) => ['referencement', 'message'].includes(String(a.note)) && GRAV[String(a.niveau ?? a.level).toLowerCase()] && str(a.titre ?? a.title))
    .map((a) => ({ note: a.note as Addition['note'], level: GRAV[String(a.niveau ?? a.level).toLowerCase()], title: str(a.titre ?? a.title, 160) })).slice(0, 4);

  const priorities = (Array.isArray(d.priorities) ? d.priorities : []).map((p) => p as Record<string, unknown>)
    .filter((p) => LEVELS.includes(p.level as Level) && str(p.title))
    .map((p) => ({ level: p.level as Level, title: str(p.title, 140), text: str(p.text, 700) }))
    .sort((a, b) => LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level)).slice(0, 6);
  if (!priorities.length) errors.push('Aucune priorité valide (champ "priorities").');

  /* Contrôle du calcul (anciennes mesures sans vérifications seulement) : moyenne pondérée, puis plafond lié aux notes de référencement. */
  let global = typeof d.global === 'number' ? d.global : NaN;
  const legacy = () => {
    for (const k of NOTE_IDS) if (!isHalf(notes[k])) throw new AuditError(`Audit non publié : note « ${k} » manquante (ces mesures sont anciennes : relancez « Mesurer » pour que l’outil calcule les notes lui-même).`);
    let expected = half(NOTE_IDS.reduce((s, k) => s + notes[k] * WEIGHTS[k], 0) / NOTE_IDS.reduce((s, k) => s + WEIGHTS[k], 0));
    /* Jamais plus de 4 points au-dessus de la plus basse des deux notes de référencement :
       un site mal construit pour Google ne peut pas avoir une bonne note. (Les autres plafonds sont appliqués par le projet.) */
    expected = Math.min(expected, notes.referencement + 4);
    /* Une note plus basse que le calcul est acceptée (plafond « introuvable sur Google ») ; plus haute, elle est corrigée. */
    if (!isHalf(global)) { global = expected; warnings.push(`Note globale absente : calculée à ${String(expected).replace('.', ',')}/20.`); }
    else if (global > expected + 0.5) { warnings.push(`Note globale corrigée : ${String(global).replace('.', ',')} → ${String(expected).replace('.', ',')}/20 (calcul et plafonds du barème).`); global = expected; }
    else if (global < expected - 0.5) warnings.push(`Note globale ${String(global).replace('.', ',')}/20, sous le calcul (${String(expected).replace('.', ',')}) : plafond du barème appliqué (site qui ne s’ouvre pas : 3 ; bloqué pour Google : 6 ; problèmes graves : 12 ou 9), vérifier que c’est bien le cas.`);
  };

  const constats = (Array.isArray(d.constats) ? d.constats : []).map((c) => c as Record<string, unknown>)
    .filter((c) => str(c.question) && str(c.reponse))
    .map((c) => ({ question: str(c.question, 160), reponse: str(c.reponse, 220), ...(STATUT[String(c.statut).toLowerCase()] ? { statut: STATUT[String(c.statut).toLowerCase()] } : {}) })).slice(0, 8);
  const aiChecks = (Array.isArray(d.checks) ? d.checks : []).map((c) => c as Record<string, unknown>)
    .map((c) => ({ ...c, group: ['visibilite', 'structure'].includes(String(c.group)) ? 'referencement' : c.group }) as Record<string, unknown>)
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

  let finalNotes: Record<(typeof NOTE_IDS)[number], number>;
  let finalPriorities: Priority[] = priorities;
  let checks: BulletinCheck[];
  let cap: string | undefined;
  if (m?.checks?.length) {
    /* Barème fixe appliqué par le code : l'IA ne peut ni gonfler ni noircir les notes mesurées. */
    const sc = scoreOf(m, { message: notes.message, vitesse: notes.vitesse }, additions);
    finalNotes = sc.notes; global = sc.global; cap = sc.cap;
    const diff = NOTE_IDS.filter((k) => isHalf(notes[k]) && Math.abs(notes[k] - sc.notes[k]) >= 1).map((k) => `${k} ${fmt(notes[k])} → ${fmt(sc.notes[k])}`);
    if (diff.length) warnings.push(`Notes du projet Claude remplacées par le barème de l’outil : ${diff.join(', ')}.`);
    if (typeof d.global === 'number' && Math.abs(d.global - sc.global) >= 1) warnings.push(`Note globale du projet Claude (${fmt(d.global)}) remplacée par le calcul de l’outil : ${fmt(sc.global)}/20.`);
    warnings.push(`Calcul de l’outil : ${explainScore(sc).join(' · ')}`);
    if (additions.length) warnings.push(`Problèmes ajoutés par l’IA (à vérifier avant envoi) : ${additions.map((a) => `« ${a.title} » (${a.level})`).join(' ; ')}.`);
    checks = bulletinChecks(m, sc, aiChecks);
    finalPriorities = alignPriorities(priorities, sc, allChecks(m));
  } else {
    legacy();
    finalNotes = notes;
    checks = aiChecks;
    warnings.push('Mesures sans vérifications détaillées : notes du projet Claude reprises telles quelles. Relancez « Mesurer » pour que l’outil applique son barème.');
    /* Cohérence avec la vitesse mesurée par Google. */
    const perf = m?.speed?.performance;
    if (typeof perf === 'number') {
      if (perf >= 90 && notes.vitesse < 12) warnings.push(`Vitesse notée ${notes.vitesse}/20 alors que Google mesure ${perf}/100 sur téléphone : vérifier.`);
      if (perf < 50 && notes.vitesse > 12) warnings.push(`Vitesse notée ${notes.vitesse}/20 alors que Google mesure seulement ${perf}/100 sur téléphone : vérifier.`);
    }
  }
  if (m && !given && !m.speed?.performance && m.speed?.performance !== 0) warnings.push('Vitesse Google non mesurée : la note Vitesse reprend celle du projet Claude (ou 14 par défaut). Relancez « Mesurer » avant d’envoyer.');
  const b: Bulletin = {
    id: randomBytes(12).toString('hex'), version: 2,
    url: m?.url ?? url, host, createdAt: new Date().toISOString(),
    global, notes: finalNotes, verdict: verdict20(global), ...(cap ? { cap } : {}),
    essentiel, impression: str(d.impression, 600),
    priorities: finalPriorities, positives, constats,
    speed: m?.speed ?? null, speedDesktop: m?.speedDesktop ?? null,
    ai: true, pages: m?.pages, pagesDetail: m?.pagesDetail, checks,
    ...(m?.channels ? { channels: m.channels } : {}),
    ...(m?.desktopScreenshot ? { desktopScreenshot: m.desktopScreenshot } : {}),
  };
  /* Contrôle de cohérence : une phrase de l'IA qui contredit une mesure est retirée ; le reste est signalé à Marc. */
  const scrubbed = scrubContradictions(b);
  if (scrubbed.length) warnings.push(`Phrase(s) de l’IA retirée(s) car contraire(s) aux mesures : ${scrubbed.map((x) => `« ${x} »`).join(' ; ')}.`);
  for (const p of validateBulletin(b)) warnings.push(`À vérifier : ${p}`);
  await saveBulletin(b);
  return { bulletin: b, warnings };
}

/* ---------- Bulletin : vérifications et priorités alignées sur le barème ---------- */
/* Points qui ne figurent pas dans le bulletin quand ils ne sont pas bons : hors audit (outil utilisé) ou détection peu fiable (avis). */
const HIDDEN_UNLESS_OK = new Set(['builder', 'reviews']);
const ORDER: Record<string, number> = { grave: 0, important: 1, prevoir: 2, ai: 3, info: 4, ok: 5 };

/* Les vérifications affichées viennent de l'outil, avec le niveau qui a servi au calcul.
   L'IA n'ajoute que ses constats sur les textes (groupe « message »), qui ne portent pas de points à part. */
function bulletinChecks(m: Measures, sc: ScoreResult, aiChecks: BulletinCheck[]): BulletinCheck[] {
  const levelOf = new Map(sc.levels.map((l) => [l.id, l]));
  const fromTool: BulletinCheck[] = allChecks(m)
    .filter((c) => !(HIDDEN_UNLESS_OK.has(c.id) && c.status !== 'ok'))
    .map((c) => {
      const l = levelOf.get(c.id);
      const level = l?.level ?? (c.status === 'ok' ? 'ok' : 'info');
      return { group: GROUP_OF_PART[l?.part ?? 'message'], label: c.label, status: c.status, detail: c.detail, advice: level === 'ok' ? '' : c.advice, level };
    });
  /* « Aucun moyen de contact » et « titres identiques » sont calculés à partir de plusieurs mesures : on les affiche aussi. */
  for (const p of sc.penalties.filter((x) => x.source === 'mesure' && !allChecks(m).some((c) => c.id === x.id))) {
    fromTool.push({ group: GROUP_OF_PART[p.part], label: p.label, status: 'bad', detail: p.detail, advice: p.id === 'no-contact' ? 'Afficher un numéro cliquable et un bouton de contact dès le haut de chaque page.' : 'Donner à chaque page son propre titre dans Google, avec ce qu’elle propose et la ville.', level: p.gravity });
  }
  const known = new Set(fromTool.map((c) => c.label.toLowerCase()));
  const fromAi = aiChecks.filter((c) => c.group === 'message' && !known.has(c.label.toLowerCase()))
    .map((c) => ({ ...c, level: (c.status === 'ok' ? 'ok' : 'ai') as BulletinCheck['level'], advice: c.status === 'ok' ? '' : c.advice }));
  return [...fromTool, ...fromAi].sort((a, b) => ORDER[a.level ?? 'info'] - ORDER[b.level ?? 'info']);
}

/* Comment reconnaître un problème mesuré dans une priorité écrite par l'IA. */
const MATCH: Record<string, RegExp> = {
  indexable: /noindex|interdit|n[’']a pas le droit/i, robots: /robots/i, sitemap: /plan du site|sitemap/i,
  canonical: /adresse officielle|autre adresse|canonique|lovable|adresse technique/i, 'js-content': /script|javascript|ne voit pas (le|vos) texte/i,
  'titles-dup': /même titre|titres? identiques?/i, 'site-size': /seule page|une page unique|tient sur une (seule )?page/i,
  title: /titre (google|de la page|de l[’']accueil)/i, description: /description|résumé dans google/i, h1: /grand titre|titre principal|\bh1\b/i,
  words: /peu de texte|trop peu|texte (trop )?court|mots/i, maillage: /reli[ée]e?s|liens? entre/i, broken: /liens? cass|page d[’']erreur|404/i,
  leftovers: /exemple|modèle|lorem/i, 'empty-links': /ne m[èe]ne(nt)? nulle part|liens? vides?|boutons? vides?/i, 'no-contact': /contacter|aucun moyen de contact/i,
  phone: /numéro|téléphone/i, cta: /bouton|appel à l[’']action/i,
  https: /non sécurisé|cadenas/i, redirect: /http:\/\/|sans (le )?cadenas|version non sécurisée/i, cert: /certificat/i, 'form-http': /formulaire.*(clair|protection|chiffr)/i,
  legal: /mentions légales/i, 'legal-content': /mentions légales.*(incompl|siret|hébergeur)/i, privacy: /confidentialit|rgpd/i, cgv: /conditions générales|\bcgv\b/i,
  viewport: /illisible sur téléphone|pas adapté.*téléphone/i, headers: /réglages de sécurité|protections? de l[’']hébergement/i,
};
const LEVEL_FROM: Record<Gravity, Level> = { grave: 'critique', important: 'important', prevoir: 'planifier' };
const RANK: Record<Gravity, number> = { grave: 0, important: 1, prevoir: 2 };

/* Le niveau d'une priorité est celui du barème quand on reconnaît le problème mesuré ;
   tout problème grave mesuré figure dans les priorités, même si l'IA l'a oublié. */
function alignPriorities(list: Priority[], sc: ScoreResult, checks: Check[]): Priority[] {
  const pens = [...sc.penalties].filter((p) => p.source === 'mesure').sort((a, b) => RANK[a.gravity] - RANK[b.gravity]);
  const used = new Set<string>();
  const out = list.map((p) => {
    const hit = pens.find((x) => MATCH[x.id]?.test(`${p.title} ${p.text}`) && MATCH[x.id]?.test(p.title));
    if (!hit) return p;
    used.add(hit.id);
    return { ...p, level: LEVEL_FROM[hit.gravity] };
  });
  for (const g of pens.filter((x) => x.gravity === 'grave' && !used.has(x.id))) {
    if (out.some((p) => MATCH[g.id]?.test(`${p.title} ${p.text}`))) continue;
    const c = checks.find((x) => x.id === g.id);
    out.push({ level: 'critique', title: problemTitle(c ?? { id: g.id, label: g.label, status: 'bad' }), text: c ? `${c.detail} ${c.advice}` : g.detail });
  }
  /* Une page qui bouge beaucoup pendant le chargement figure toujours dans les priorités. */
  for (const g of pens.filter((x) => /^psi-cls/.test(x.id) && !used.has(x.id))) {
    const c = checks.find((x) => x.id === g.id);
    const title = problemTitle(c ?? { id: g.id, label: g.label, status: 'bad' });
    if (!out.some((p) => p.title === title)) out.push({ level: LEVEL_FROM[g.gravity], title, text: c ? `${c.detail} ${c.advice}` : g.detail });
  }
  const order: Record<Level, number> = { critique: 0, important: 1, planifier: 2 };
  return out.sort((a, b) => order[a.level] - order[b.level]).slice(0, 6);
}
