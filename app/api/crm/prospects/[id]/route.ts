import { NextResponse } from 'next/server';
import { authorised, getProspect, saveProspect, deleteProspect, event, removeDoc } from '../../../../../lib/crmStore';
import { STAGE_LABEL, nextAction, type Prospect, type Stage } from '../../../../../components/crmTypes';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const deny = () => NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
const s = (v: unknown, n = 200) => (typeof v === 'string' ? v.trim().slice(0, n) : '');
type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Ctx) {
  if (!authorised(request)) return deny();
  const p = await getProspect((await params).id);
  return p ? NextResponse.json({ prospect: p }) : NextResponse.json({ error: 'Introuvable' }, { status: 404 });
}

/* Toutes les modifications d'une fiche passent par une « action ». */
export async function PATCH(request: Request, { params }: Ctx) {
  if (!authorised(request)) return deny();
  const p = await getProspect((await params).id);
  if (!p) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
  const d = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const now = new Date().toISOString();
  switch (d.action) {
    case 'update': {
      const f = (d.fields || {}) as Record<string, unknown>;
      const keys: [keyof Prospect, number][] = [['company', 200], ['contactName', 200], ['email', 254], ['phone', 40], ['website', 300], ['city', 80], ['trade', 80], ['priority', 20], ['bulletinId', 24]];
      for (const [k, n] of keys) if (k in f) (p as Record<string, unknown>)[k] = s(f[k], n);
      if ('score' in f) p.score = f.score === null || f.score === '' ? null : Math.max(0, Math.min(20, Number(String(f.score).replace(',', '.')) || 0));
      break;
    }
    case 'stage': {
      const st = d.stage as Stage;
      if (!(st in STAGE_LABEL)) return NextResponse.json({ error: 'Étape inconnue' }, { status: 400 });
      p.history.push(event(`Étape : ${STAGE_LABEL[p.stage]} → ${STAGE_LABEL[st]}`, 'etape'));
      /* Envoi de l'audit ou du devis : démarre les relances J+3 et J+7. */
      if ((st === 'audit_envoye' && p.followCycle !== 'audit') || (st === 'devis' && p.followCycle !== 'devis')) { p.followFrom = now; p.followCycle = st === 'devis' ? 'devis' : 'audit'; p.relances = 0; }
      p.stage = st;
      p.manualAction = null;
      break;
    }
    case 'relance': {
      const a = nextAction(p);
      p.relances += 1;
      if (p.stage === 'audit_envoye') p.stage = 'relance';
      p.history.push(event(`${a?.relanceStep ? `Relance J+${a.relanceStep}` : 'Relance'} envoyée`, 'relance'));
      break;
    }
    case 'note': {
      const t = s(d.text, 2000);
      if (!t) return NextResponse.json({ error: 'Note vide' }, { status: 400 });
      p.history.push(event(t, 'note'));
      break;
    }
    case 'manual': {
      const label = s(d.label, 160);
      const due = s(d.due, 40);
      p.manualAction = label ? { label, due: due && !Number.isNaN(Date.parse(due)) ? new Date(due).toISOString() : '' } : null;
      if (label) p.history.push(event(`Action prévue : ${label}${due ? ` (${new Date(due).toLocaleDateString('fr-FR')})` : ''}`));
      break;
    }
    case 'removeDoc': {
      const url = s(d.url, 600);
      p.docs = p.docs.filter((x) => x.url !== url);
      await removeDoc(p.id, url);
      p.history.push(event('Document supprimé'));
      break;
    }
    default: return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
  }
  return NextResponse.json({ prospect: await saveProspect(p) });
}

export async function DELETE(request: Request, { params }: Ctx) {
  if (!authorised(request)) return deny();
  await deleteProspect((await params).id);
  return NextResponse.json({ ok: true });
}
