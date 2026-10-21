import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const emailPattern = /^[^\s@<>,;"]+@[^\s@<>,;"]+\.[^\s@<>,;"]+$/;

function clean(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function oneLine(value: string) {
  return value.replace(/[\r\n\t]+/g, ' ');
}

export async function POST(request: Request) {
  try {
    const raw = await request.text();
    if (raw.length > 20000) return NextResponse.json({ error: 'Message trop long' }, { status: 413 });
    const data = JSON.parse(raw) as Record<string, unknown>;
    if (clean(data.website, 200)) return NextResponse.json({ ok: true });

    const name = oneLine(clean(data.name, 120));
    const email = clean(data.email, 254);
    const phone = oneLine(clean(data.phone, 40));
    const subject = oneLine(clean(data.subject, 150));
    const message = clean(data.message, 5000);

    if (!emailPattern.test(email) || !name || !subject || message.length < 15) {
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
      console.error('Erreur Resend', res.status);
      return NextResponse.json({ error: 'Envoi indisponible' }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 });
  }
}
