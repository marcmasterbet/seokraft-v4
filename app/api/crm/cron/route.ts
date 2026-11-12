import { NextResponse } from 'next/server';
import { listProspects, sendMail } from '../../../../lib/crmStore';
import { nextAction, isDue, relanceMail, frDate, STAGE_LABEL, hostOf, clientActions } from '../../../../components/crmTypes';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* Mail du matin (tâche Vercel, chaque jour à 7 h UTC) : les relances et réponses du jour, avec les mails prêts à copier. */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const to = process.env.CONTACT_TO_EMAIL;
  if (!to) return NextResponse.json({ error: 'CONTACT_TO_EMAIL manquant' }, { status: 503 });
  const all = await listProspects();
  const due = all.map((p) => ({ p, a: nextAction(p) })).filter(({ a }) => isDue(a)).sort((x, y) => (x.a!.due || '').localeCompare(y.a!.due || ''));
  const now = Date.now();
  const clientDue = all.flatMap((p) => clientActions(p).filter((a) => new Date(a.due).getTime() <= now).map((a) => ({ p, a })));
  if (!due.length && !clientDue.length) return NextResponse.json({ ok: true, due: 0 });
  const blocks = due.map(({ p, a }, i) => {
    const head = `${i + 1}. ${p.company || hostOf(p.website) || p.email} — ${a!.label}${a!.due ? ` (prévu le ${frDate(a!.due)})` : ''}\n   ${[p.contactName, p.email, p.phone].filter(Boolean).join(' · ')} · étape : ${STAGE_LABEL[p.stage]}`;
    if (a!.kind !== 'relance' || !a!.relanceStep) return head;
    const m = relanceMail(p, a!.relanceStep);
    return `${head}\n\n   À : ${p.email || '(e-mail inconnu)'}\n   Objet : ${m.subject}\n   ────────────\n${m.body.split('\n').map((l) => `   ${l}`).join('\n')}\n   ────────────`;
  });
  const clientBlocks = clientDue.map(({ p, a }) => `• ${p.company || hostOf(p.website)} — ${a.label}`);
  const total = due.length + clientDue.length;
  const text = `Bonjour Marc,\n\n${total} action${total > 1 ? 's' : ''} à faire aujourd’hui dans ton CRM.\n\n${clientBlocks.length ? `CLIENTS\n${clientBlocks.join('\n')}\n\n` : ''}${blocks.length ? `PROSPECTS\n\n${blocks.join('\n\n')}` : ''}\n\nUne fois la relance envoyée depuis Outlook, clique sur « Marquer comme relancé » dans la fiche :\nhttps://www.seokraft.fr/crm\n`;
  const ok = await sendMail({ to, subject: `CRM SEOKRAFT — ${total} action${total > 1 ? 's' : ''} aujourd’hui`, text });
  return NextResponse.json({ ok, due: total });
}
