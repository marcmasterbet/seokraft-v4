import { NextResponse } from 'next/server';
import { getDraft, saveDraft, upsertProspect, event, advance, sendMail } from '../../../lib/crmStore';
import { spamReason } from '../../../lib/spamFilter';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* Questionnaire de projet (public/questionnaire.html) : brouillons pour reprendre plus tard, et envoi final rangé dans le CRM. */
const emailOk = (e: string) => /^[^\s@<>,;"]+@[^\s@<>,;"]+\.[^\s@<>,;"]{2,}$/.test(e);
const s = (v: unknown, n = 200) => (typeof v === 'string' ? v.trim().slice(0, n) : '');
const hits = new Map<string, number[]>();
function tooMany(ip: string, max: number) {
  const now = Date.now();
  const r = (hits.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  r.push(now); hits.set(ip, r);
  if (hits.size > 5000) hits.clear();
  return r.length > max;
}
function sameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  try { const o = new URL(origin).host; return o === (request.headers.get('x-forwarded-host') || request.headers.get('host')) || /(^|\.)seokraft\.fr$/.test(o); } catch { return false; }
}

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get('id') || '';
  const d = (await getDraft(id)) as { state?: unknown } | null;
  return d ? NextResponse.json({ state: d.state }) : NextResponse.json({ error: 'Introuvable' }, { status: 404 });
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Origine refusée' }, { status: 403 });
  const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'inconnu';
  if (tooMany(ip, 30)) return NextResponse.json({ error: 'Trop de demandes' }, { status: 429 });
  const raw = await request.text();
  if (raw.length > 200000) return NextResponse.json({ error: 'Trop long' }, { status: 413 });
  let d: Record<string, unknown>;
  try { d = JSON.parse(raw); } catch { return NextResponse.json({ error: 'Requête invalide' }, { status: 400 }); }
  const id = s(d.id, 40);
  const email = s(d.email, 254);
  const entreprise = s(d.entreprise, 200);

  if (d.type === 'draft') {
    if (!/^[a-z0-9]{8,40}$/i.test(id)) return NextResponse.json({ error: 'Brouillon invalide' }, { status: 400 });
    await saveDraft(id, { state: d.state, at: new Date().toISOString() });
    /* Lien pour reprendre, envoyé au prospect (une seule fois par brouillon et par quart d'heure). */
    const resume = s(d.resumeUrl, 600);
    if (emailOk(email) && /^https:\/\/(www\.)?seokraft\.fr\/questionnaire/.test(resume) && !tooMany(`mail:${id}`, 1) && !spamReason({ email, name: s(d.nom) })) {
      await sendMail({ to: email, replyTo: process.env.CONTACT_TO_EMAIL, subject: 'Votre questionnaire de projet — reprendre plus tard',
        text: `Bonjour,\n\nVos réponses au questionnaire de projet${entreprise ? ` (${entreprise})` : ''} sont enregistrées. Pour le reprendre là où vous l’avez laissé, sur n’importe quel appareil :\n\n${resume}\n\nMarc Bretzner · SEOKRAFT · contact@seokraft.fr` });
    }
    return NextResponse.json({ ok: true });
  }

  if (d.type !== 'final') return NextResponse.json({ error: 'Requête invalide' }, { status: 400 });
  const text = s(d.text, 60000);
  const row = (d.row || {}) as Record<string, unknown>;
  if (!text || !emailOk(email)) return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
  const spam = spamReason({ email, message: text.slice(0, 3000), name: s(row['Nom']) });
  if (spam) { console.warn('Spam bloqué (questionnaire)', spam); return NextResponse.json({ ok: true }); }

  const name = s(row['Nom']);
  const phone = s(row['Téléphone'], 40);
  const client = s(row['Lien client'], 40);
  let crmUrl = '';
  try {
    const p = await upsertProspect({ id: client, email }, { source: 'questionnaire', company: entreprise, contactName: name, email, phone }, (x) => {
      x.questionnaire = { text, at: new Date().toISOString() };
      advance(x, 'a_contacter');
      x.history.push(event('Questionnaire de projet reçu'));
    });
    crmUrl = `https://www.seokraft.fr/crm?p=${p.id}`;
  } catch (e) { console.error('CRM (questionnaire)', e instanceof Error ? e.message : e); }
  const to = process.env.CONTACT_TO_EMAIL;
  if (to) await sendMail({ to, replyTo: email, subject: `SEOKRAFT — Questionnaire de projet : ${entreprise || name}`, text: `${crmUrl ? `Fiche dans le CRM : ${crmUrl}\n\n` : ''}${text}` });
  return NextResponse.json({ ok: true });
}
