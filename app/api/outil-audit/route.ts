import { NextResponse } from 'next/server';
import { createBulletin, AuditError } from '../../../lib/auditEngine';

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

export async function POST(request: Request) {
  const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'inconnu';
  if (blocked(ip)) return NextResponse.json({ error: 'Trop d’essais, réessayez plus tard.' }, { status: 429 });
  if (!authorised(request)) { fails.get(ip)!.push(Date.now()); if (fails.size > 5000) fails.clear(); return NextResponse.json({ error: 'Accès refusé' }, { status: 401 }); }
  try {
    const data = (await request.json()) as { url?: unknown };
    return NextResponse.json(await createBulletin(typeof data.url === 'string' ? data.url : ''));
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur';
    console.error('Outil audit', msg);
    return NextResponse.json({ error: err instanceof AuditError || /autoris|pris en charge|Port/.test(msg) ? msg : 'Impossible d’analyser ce site (adresse introuvable ou site injoignable).' }, { status: 422 });
  }
}
