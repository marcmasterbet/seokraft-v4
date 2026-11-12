import { NextResponse } from 'next/server';
import { checkPassword, sessionToken } from '../../../../lib/crmStore';

export const runtime = 'nodejs';

/* Anti-devinette : 8 essais ratés par adresse IP toutes les 15 minutes. */
const fails = new Map<string, number[]>();
const recent = (ip: string) => (fails.get(ip) || []).filter((t) => Date.now() - t < 15 * 60 * 1000);

export async function POST(request: Request) {
  const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'inconnu';
  if (recent(ip).length >= 8) return NextResponse.json({ error: 'Trop d’essais, réessayez dans 15 minutes.' }, { status: 429 });
  const { password } = (await request.json().catch(() => ({}))) as { password?: unknown };
  if (typeof password !== 'string' || !checkPassword(password)) {
    fails.set(ip, [...recent(ip), Date.now()]);
    if (fails.size > 5000) fails.clear();
    return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set('sk_crm', sessionToken(), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 60 * 60 * 24 * 30 });
  return res;
}
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set('sk_crm', '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}
