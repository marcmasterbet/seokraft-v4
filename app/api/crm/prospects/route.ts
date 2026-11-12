import { NextResponse } from 'next/server';
import { authorised, listProspects, saveProspect, newId, event, upsertProspect } from '../../../../lib/crmStore';
import { emptyProspect, type Prospect } from '../../../../components/crmTypes';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const deny = () => NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
const s = (v: unknown, n = 200) => (typeof v === 'string' ? v.trim().slice(0, n) : '');

export async function GET(request: Request) {
  if (!authorised(request)) return deny();
  return NextResponse.json({ prospects: await listProspects() });
}

/* Nouveau prospect saisi à la main. */
export async function POST(request: Request) {
  if (!authorised(request)) return deny();
  const d = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const p: Prospect = { ...emptyProspect(newId()), company: s(d.company), contactName: s(d.contactName), email: s(d.email, 254), phone: s(d.phone, 40), website: s(d.website, 300), city: s(d.city, 80), trade: s(d.trade, 80) };
  if (!p.company && !p.email && !p.website) return NextResponse.json({ error: 'Indiquez au moins une entreprise, un e-mail ou un site.' }, { status: 400 });
  p.history.push(event('Fiche créée à la main'));
  return NextResponse.json({ prospect: await saveProspect(p) });
}

/* Import d'une liste (lignes déjà lues côté navigateur depuis un fichier CSV). Les doublons (même site ou même e-mail) sont complétés, pas recréés. */
export async function PUT(request: Request) {
  if (!authorised(request)) return deny();
  const d = (await request.json().catch(() => ({}))) as { rows?: Record<string, unknown>[] };
  const rows = Array.isArray(d.rows) ? d.rows.slice(0, 500) : [];
  let created = 0, updated = 0;
  for (const r of rows) {
    const company = s(r.company);
    if (!company) continue;
    const website = s(r.website, 300);
    await upsertProspect({ email: s(r.email, 254), website }, {
      source: 'import', company, website, email: s(r.email, 254), phone: s(r.phone, 40), city: s(r.city, 80), trade: s(r.trade, 80), priority: s(r.priority, 20),
    }, (x, isNew) => {
      if (isNew) { created++; x.history.push(event(`Importé${s(r.notes, 1500) ? ` · ${s(r.notes, 1500)}` : ''}`)); }
      else updated++;
    });
  }
  return NextResponse.json({ created, updated });
}
