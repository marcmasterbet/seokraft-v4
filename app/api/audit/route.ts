import { NextResponse, after } from 'next/server';
import { createBulletin } from '../../../lib/auditEngine';
import { NOTE_LABELS, buildBulletinMail, fmt20 } from '../../../components/auditTypes';

export const runtime = 'nodejs';
export const maxDuration = 60;

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


/* Adresse du site à auditer : http(s) uniquement, nom de domaine obligatoire. */
function normaliseUrl(value: string) {
  const v = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const u = new URL(v);
    if (!/^https?:$/.test(u.protocol) || !u.hostname.includes('.')) return '';
    return u.toString().slice(0, 300);
  } catch {
    return '';
  }
}

export async function POST(request: Request) {
  try {
    if (!sameOrigin(request)) return NextResponse.json({ error: 'Origine refusée' }, { status: 403 });
    if (!(request.headers.get('content-type') || '').includes('application/json')) {
      return NextResponse.json({ error: 'Requête invalide' }, { status: 415 });
    }
    const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'inconnu';
    if (tooMany(ip)) return NextResponse.json({ error: 'Trop de demandes' }, { status: 429 });
    const raw = await request.text();
    if (raw.length > 5000) return NextResponse.json({ error: 'Requête trop longue' }, { status: 413 });
    const data = JSON.parse(raw) as Record<string, unknown>;
    if (clean(data.website, 200)) return NextResponse.json({ ok: true });

    const name = oneLine(clean(data.name, 120));
    const email = clean(data.email, 254);
    const url = normaliseUrl(oneLine(clean(data.url, 300)));

    if (!emailPattern.test(email) || !name || !url) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
    }

    const key = process.env.RESEND_API_KEY;
    const to = process.env.CONTACT_TO_EMAIL;
    const from = process.env.CONTACT_FROM_EMAIL;
    if (!key || !to || !from) {
      console.error('Variables Resend manquantes');
      return NextResponse.json({ error: 'Service non configuré' }, { status: 503 });
    }

    /* Réponse immédiate au visiteur ; l'analyse se fait ensuite et le résultat part par e-mail à Marc. */
    const firstName = name.split(/\s+/)[0] || '';
    after(async () => {
      let report = '';
      let subject = `SEOKRAFT — Audit gratuit : ${new URL(url).hostname}`;
      try {
        const b = await createBulletin(url);
        subject = `SEOKRAFT — Audit gratuit : ${b.host} — ${fmt20(b.global)}/20`;
        report = [
          `NOTE DU SITE : ${fmt20(b.global)}/20 — ${b.verdict}`,
          ...NOTE_LABELS.map((n) => `• ${n.label} : ${fmt20(b.notes[n.id])}/20`),
          `• Pages analysées : ${(b.pages ?? []).map((p) => p.label).join(', ') || 'accueil'}`,
          b.ai ? '• Textes analysés par l’IA : à relire avant envoi.' : '• Analyse des textes par l’IA indisponible (clé absente ou erreur) : note des textes estimée.',
          '',
          '1) RELIRE LE BULLETIN (en ligne, téléchargeable en PDF) :',
          `https://www.seokraft.fr/bulletin/${b.id}`,
          '',
          '2) MAIL À ENVOYER AU PROSPECT (copier-coller) :',
          `À : ${email}`,
          '────────────────────────',
          buildBulletinMail(b, firstName),
          '────────────────────────',
        ].join('\n');
      } catch (e) {
        const tool = `https://www.seokraft.fr/outil-audit?${new URLSearchParams({ url, prenom: firstName })}`;
        report = `L’analyse automatique n’a pas abouti (${e instanceof Error ? e.message : 'erreur'}).\nLancez-la à la main depuis l’outil : ${tool}`;
        subject += ' — analyse à relancer';
      }
      const content = `NOUVELLE DEMANDE D'AUDIT GRATUIT (à livrer sous 24 h)\n\nPrénom : ${name}\nEmail : ${email}\nSite à auditer : ${url}\n\n${report}`;
      if (process.env.AUDIT_DEBUG === '1') console.log('AUDIT-MAIL', subject, '\n' + content);
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to: [to], reply_to: email, subject, text: content }),
        signal: AbortSignal.timeout(10000),
      }).catch((e) => { console.error('Erreur Resend (audit)', e); return null; });
      if (res && !res.ok) console.error('Erreur Resend (audit)', res.status, (await res.text().catch(() => '')).slice(0, 500));
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Erreur formulaire audit', err);
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 });
  }
}
