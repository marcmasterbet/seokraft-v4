import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const emailPattern = /^[^\s@<>,;"]+@[^\s@<>,;"]+\.[^\s@<>,;"]+$/;

function clean(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function oneLine(value: string) {
  return value.replace(/[\r\n\t]+/g, ' ');
}

/* Protection anti-abus : limite d'envois par adresse IP (mémoire de l'instance, au mieux). */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();
function tooMany(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

/* Seuls les envois depuis le site lui-même sont acceptés. */
function sameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  try {
    const o = new URL(origin).host;
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
    return o === host || o === 'www.seokraft.fr' || o === 'seokraft.fr';
  } catch {
    return false;
  }
}

const SUBJECTS = new Set(['Création de site internet', 'Refonte de site internet', 'Projet web avancé', 'SEO & GEO', 'Autre demande']);

export async function POST(request: Request) {
  try {
    if (!sameOrigin(request)) return NextResponse.json({ error: 'Origine refusée' }, { status: 403 });
    if (!(request.headers.get('content-type') || '').includes('application/json')) {
      return NextResponse.json({ error: 'Requête invalide' }, { status: 415 });
    }
    const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'inconnu';
    if (tooMany(ip)) return NextResponse.json({ error: 'Trop de demandes' }, { status: 429 });
    const raw = await request.text();
    if (raw.length > 20000) return NextResponse.json({ error: 'Message trop long' }, { status: 413 });
    const data = JSON.parse(raw) as Record<string, unknown>;
    if (clean(data.website, 200)) return NextResponse.json({ ok: true });

    const name = oneLine(clean(data.name, 120));
    const email = clean(data.email, 254);
    const phone = oneLine(clean(data.phone, 40));
    const subject = oneLine(clean(data.subject, 150));
    const message = clean(data.message, 5000);

    if (!emailPattern.test(email) || !name || !SUBJECTS.has(subject) || message.length < 15) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
    }

    const key = process.env.RESEND_API_KEY;
    const to = process.env.CONTACT_TO_EMAIL;
    const from = process.env.CONTACT_FROM_EMAIL;
    if (!key || !to || !from) {
      console.error('Variables Resend manquantes');
      return NextResponse.json({ error: 'Service de contact non configuré' }, { status: 503 });
    }

    const content = `Nom : ${name}\nEmail : ${email}\nTéléphone : ${phone}\nObjet : ${subject}\n\n${message}`;
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [to], reply_to: email, subject: `SEOKRAFT — ${subject}`, text: content }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      // Raison détaillée visible dans Vercel → Logs (ex. domaine non vérifié, clé invalide, mode test)
      const detail = await res.text().catch(() => '');
      console.error('Erreur Resend', res.status, detail.slice(0, 500), '| from =', from, '| to =', to);
      return NextResponse.json({ error: 'Envoi indisponible' }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Erreur formulaire de contact', err);
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 });
  }
}
