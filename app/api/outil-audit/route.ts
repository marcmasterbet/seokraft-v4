import { NextResponse } from 'next/server';
import { AuditError } from '../../../lib/auditEngine';
import { runAutoAudit, AutoAuditError, fmtCost } from '../../../lib/auditAuto';
import { upsertProspect, event } from '../../../lib/crmStore';

export const runtime = 'nodejs';
export const maxDuration = 300;

/* Accès : outil privé de Marc (mot de passe AUDIT_TOOL_PASSWORD). */
function authorised(request: Request) {
  const expected = process.env.AUDIT_TOOL_PASSWORD;
  const given = request.headers.get('x-audit-key') || '';
  if (!expected || given.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ given.charCodeAt(i);
  return diff === 0;
}

/* Anti-devinette du mot de passe : 8 essais ratés par adresse IP toutes les 15 minutes. */
const fails = new Map<string, number[]>();
function blocked(ip: string) { const now = Date.now(); const r = (fails.get(ip) || []).filter((t) => now - t < 15 * 60 * 1000); fails.set(ip, r); return r.length >= 8; }

export async function POST(request: Request) {
  const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'inconnu';
  if (blocked(ip)) return NextResponse.json({ error: 'Trop d’essais, réessayez plus tard.' }, { status: 429 });
  if (!authorised(request)) { fails.get(ip)!.push(Date.now()); if (fails.size > 5000) fails.clear(); return NextResponse.json({ error: 'Accès refusé' }, { status: 401 }); }
  try {
    const data = (await request.json()) as { url?: unknown; prenom?: unknown };
    const run = await runAutoAudit(typeof data.url === 'string' ? data.url : '');
    /* Le bulletin est rangé dans la fiche du prospect (créée si besoin, étape « À contacter »). */
    let crmId = '';
    try {
      const b = run.bulletin;
      const p = await upsertProspect({ website: b.url }, { source: 'outil', website: b.url, company: b.host, contactName: typeof (data as { prenom?: unknown }).prenom === 'string' ? String((data as { prenom?: string }).prenom).slice(0, 80) : '' }, (x) => {
        x.bulletinId = b.id; x.score = b.global;
        x.history.push(event(`Audit automatique · note ${String(b.global).replace('.', ',')}/20 · coût ${fmtCost(run.usage)}`));
      });
      crmId = p.id;
    } catch (e) { console.error('CRM (outil)', e instanceof Error ? e.message : e); }
    return NextResponse.json({ ...run.bulletin, warnings: run.warnings, forMarc: run.forMarc, cost: fmtCost(run.usage), speedError: run.speedError, speedNoKey: !process.env.PSI_API_KEY && !process.env.NEXT_PUBLIC_PSI_KEY, crmId });
  } catch (err) {
    /* L'IA a échoué : on rend les mesures pour finir l'audit avec le projet Claude. */
    if (err instanceof AutoAuditError) return NextResponse.json({ error: `${err.message}. Les mesures sont prêtes : copie-les dans le projet Claude « Audits SEOKRAFT », puis publie sa réponse (onglet « Avec le projet Claude », étape 2).`, measures: err.measuresText, url: err.url, cost: err.usage ? fmtCost(err.usage) : '' }, { status: 422 });
    const msg = err instanceof Error ? err.message : 'Erreur';
    console.error('Outil audit', msg);
    return NextResponse.json({ error: err instanceof AuditError || /autoris|pris en charge|Port/.test(msg) ? msg : 'Impossible d’analyser ce site (adresse introuvable ou site injoignable).' }, { status: 422 });
  }
}
