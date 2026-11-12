import { NextResponse } from 'next/server';
import { authorised, listProspects, saveProspect, newId, event } from '../../../../lib/crmStore';
import { emptyProspect, hostOf, type Prospect } from '../../../../components/crmTypes';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;
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

/* Import d'une liste (lignes déjà lues côté navigateur depuis un fichier CSV).
   La liste existante est lue UNE fois ; les doublons (même site, même e-mail ou même nom d'entreprise) sont complétés, pas recréés ;
   les fiches sont enregistrées par lots, en parallèle. */
export async function PUT(request: Request) {
  if (!authorised(request)) return deny();
  const d = (await request.json().catch(() => ({}))) as { rows?: Record<string, unknown>[] };
  const rows = Array.isArray(d.rows) ? d.rows.slice(0, 500) : [];
  const all = await listProspects();
  const norm = (v: string) => v.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const byKey = new Map<string, Prospect>();
  const index = (p: Prospect) => { if (p.email) byKey.set(`e:${p.email.toLowerCase()}`, p); if (hostOf(p.website)) byKey.set(`h:${hostOf(p.website)}`, p); if (p.company) byKey.set(`c:${norm(p.company)}`, p); };
  all.forEach(index);
  const touched = new Map<string, Prospect>();
  let created = 0, updated = 0;
  for (const r of rows) {
    const company = s(r.company);
    if (!company) continue;
    const dist = /à ([\d.,]+) km/.exec(s(r.notes, 1500))?.[1]?.replace('.', ',');
    const f = { company, website: s(r.website, 300), email: s(r.email, 254), phone: s(r.phone, 40), city: s(r.city, 80), trade: s(r.trade, 80), priority: s(r.priority, 20), google: s(r.google, 60), distance: dist ? `${dist} km` : '', address: s(r.address, 200), siret: s(r.siret, 20) };
    let p = (f.email && byKey.get(`e:${f.email.toLowerCase()}`)) || (hostOf(f.website) && byKey.get(`h:${hostOf(f.website)}`)) || byKey.get(`c:${norm(company)}`);
    if (p) updated++;
    else { p = { ...emptyProspect(newId()), source: 'import' }; created++; p.history.push(event(`Importé${s(r.notes, 1500) ? ` · ${s(r.notes, 1500)}` : ''}`)); }
    for (const [k, v] of Object.entries(f)) if (v && !(p as Record<string, unknown>)[k]) (p as Record<string, unknown>)[k] = v;
    index(p);
    touched.set(p.id, p);
  }
  const queue = [...touched.values()];
  await Promise.all(Array.from({ length: 8 }, async () => { for (let p = queue.shift(); p; p = queue.shift()) await saveProspect(p); }));
  return NextResponse.json({ created, updated });
}
