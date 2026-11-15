/* Audit automatique par l'API Anthropic, avec EXACTEMENT la même grille que le projet Claude « Audits SEOKRAFT ».
   1. l'outil mesure le site et prépare un dossier complet (titres, liens et leur vraie destination, bas de page, restes de modèle…) ;
   2. l'IA applique la grille et rend « Pour Marc » + le bloc JSON ;
   3. le JSON passe par le même contrôle que l'import manuel (notes, calcul, plafonds) avant publication.
   Rien n'est jamais envoyé au prospect : Marc relit et envoie lui-même. */
import { measureSite, importAudit } from './auditImport';
import { AuditError } from './auditEngine';
import { AUDIT_PROMPT } from './auditPrompt';
import type { Bulletin } from '../components/auditTypes';

const AUTO_NOTE = `

---

## Mode automatique (cet audit est fait sans Marc)

Tu ne peux pas ouvrir le site toi-même. L’outil de Marc l’a lu pour toi : le dossier ci-dessous contient, pour l’accueil et les pages importantes, les titres, chaque lien et bouton avec sa VRAIE destination (« ne mène nulle part » = lien vide, compte comme absent sauf s’il ouvre un sous-menu), le bas de page, le début des textes, les numéros écrits et les restes de modèle repérés.
- Ce dossier remplace ta visite du site : tu t’appuies uniquement sur lui et sur les mesures. Tu n’inventes rien.
- Ce que le dossier ne permet pas de trancher va dans les points « à vérifier » de « Pour Marc » et ne retire aucun point.
- ORDRE ET LONGUEUR (obligatoire, la réponse est payée au mot) :
  1. D’ABORD le bloc \`\`\`json, complet. Textes courts : « detail » et « advice » en une phrase chacun ; 15 « checks » au maximum, en gardant les plus utiles ; 3 à 5 priorités.
  2. ENSUITE « Pour Marc », 15 lignes au maximum : famille ; à vérifier ; le calcul en une ligne par note (problèmes retenus et leur niveau → note), puis moyenne et plafond ; offre conseillée avec sa justification ; 2 lignes commerciales.
  Rien d’autre, pas d’introduction ni de conclusion.`;

/* Prix en dollars par million de jetons (Sonnet 5.5 : 2 $ en entrée, 10 $ en sortie). Modifiables dans Vercel si les prix changent. */
const PRICE_IN = Number(process.env.AUDIT_PRICE_IN) || 2;
const PRICE_OUT = Number(process.env.AUDIT_PRICE_OUT) || 10;
const EUR_PER_USD = Number(process.env.AUDIT_EUR_PER_USD) || 0.92;

export type AutoUsage = { input: number; output: number; usd: number; eur: number; model: string };
export type AutoAudit = { bulletin: Bulletin; warnings: string[]; forMarc: string; usage: AutoUsage; speedError: boolean };

/* L'IA n'a pas pu faire l'audit : les mesures sont gardées pour le faire avec le projet Claude. */
export class AutoAuditError extends AuditError {
  constructor(message: string, public measuresText: string, public url: string, public usage?: AutoUsage) { super(message); }
}

export const fmtCost = (u: AutoUsage) => `${(u.eur * 100).toFixed(1).replace('.', ',')} centimes (${u.input} jetons lus, ${u.output} écrits)`;

async function ask(system: string, user: string) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('clé ANTHROPIC_API_KEY absente dans Vercel');
  const model = process.env.AUDIT_AI_MODEL || 'claude-sonnet-5-5';
  const res = await fetch(`${process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com'}/v1/messages`, {
    method: 'POST',
    headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model, max_tokens: 16000, system, messages: [{ role: 'user', content: user }] }),
    signal: AbortSignal.timeout(150000),
  });
  if (!res.ok) {
    const body = (await res.text()).slice(0, 300);
    console.error('IA audit auto', res.status, body);
    throw new Error(/credit balance|billing/i.test(body) ? 'crédit épuisé sur console.anthropic.com' : res.status === 401 ? 'clé API refusée' : res.status === 404 ? 'modèle introuvable' : res.status === 429 || res.status === 529 ? 'service surchargé' : `erreur ${res.status}`);
  }
  const d = await res.json();
  const text = ((d.content || []) as { type: string; text?: string }[]).filter((x) => x.type === 'text').map((x) => x.text || '').join('').trim();
  const input = Number(d.usage?.input_tokens) || 0;
  const output = Number(d.usage?.output_tokens) || 0;
  const usd = (input * PRICE_IN + output * PRICE_OUT) / 1e6;
  return { text, stop: String(d.stop_reason || ''), usage: { input, output, usd, eur: usd * EUR_PER_USD, model } };
}

export async function runAutoAudit(url: string): Promise<AutoAudit> {
  const { measures, text, result } = await measureSite(url);
  const user = `Audit de ${result.url}\n\n${text}\n\nDOSSIER DU SITE (lu par l’outil, à la place de ta visite) :\n${result.content?.dossier || '(dossier indisponible)'}`;
  let out: Awaited<ReturnType<typeof ask>>;
  try { out = await ask(AUDIT_PROMPT + AUTO_NOTE, user); }
  catch (e) {
    const why = e instanceof Error && /timeout|abort/i.test(e.name + e.message) ? 'délai dépassé' : e instanceof Error ? e.message : 'erreur';
    throw new AutoAuditError(`IA indisponible (${why})`, text, result.url);
  }
  /* « Pour Marc » est rendu après le bloc JSON (avant, si l'IA a gardé l'ordre du projet). */
  const fence = /```(?:json)?\s*\{[\s\S]*?```/i.exec(out.text);
  const rest = fence ? (out.text.slice(fence.index + fence[0].length).trim() || out.text.slice(0, fence.index)) : '';
  const forMarc = rest.replace(/^#+\s*/gm, '').replace(/\*\*/g, '').trim().slice(0, 5000);
  try {
    const { bulletin, warnings } = await importAudit(out.text, measures);
    return { bulletin, warnings, forMarc, usage: out.usage, speedError: !measures.speed || measures.speed.performance === null };
  } catch (e) {
    const why = out.stop === 'max_tokens' ? 'la réponse de l’IA a été coupée car trop longue' : e instanceof Error ? e.message.replace(/^Le texte collé n’est pas un audit valide.*$/, 'la réponse de l’IA ne contient pas d’audit lisible') : 'réponse illisible';
    throw new AutoAuditError(`Audit non publié : ${why}`, text, result.url, out.usage);
  }
}
