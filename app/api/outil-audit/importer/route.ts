import { NextResponse } from 'next/server';
import { AuditError } from '../../../../lib/auditEngine';
import { upsertProspect, event } from '../../../../lib/crmStore';
import { importAudit } from '../../../../lib/auditImport';

export const runtime = 'nodejs';
export const maxDuration = 60;

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

/* Étape 2 : import du résultat du projet Claude, contrôle, publication, rangement dans le CRM. */
export async function POST(request: Request) {
  const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'inconnu';
  if (blocked(ip)) return NextResponse.json({ error: 'Trop d’essais, réessayez plus tard.' }, { status: 429 });
  if (!authorised(request)) { fails.get(ip)!.push(Date.now()); return NextResponse.json({ error: 'Accès refusé' }, { status: 401 }); }
  try {
    const data = (await request.json()) as { audit?: unknown; prenom?: unknown };
    const { bulletin: b, warnings } = await importAudit(typeof data.audit === 'string' ? data.audit.slice(0, 200000) : '');
    let crmId = '';
    try {
      const p = await upsertProspect({ website: b.url }, { source: 'outil', website: b.url, company: b.host, contactName: typeof data.prenom === 'string' ? data.prenom.slice(0, 80) : '' }, (x) => {
        x.bulletinId = b.id; x.score = b.global;
        x.history.push(event(`Audit publié (projet Claude) · note ${String(b.global).replace('.', ',')}/20`));
      });
      crmId = p.id;
    } catch (e) { console.error('CRM (import)', e instanceof Error ? e.message : e); }
    return NextResponse.json({ ...b, warnings, crmId });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur';
    console.error('Import audit', msg);
    return NextResponse.json({ error: err instanceof AuditError ? msg : 'Import impossible.' }, { status: 422 });
  }
}
