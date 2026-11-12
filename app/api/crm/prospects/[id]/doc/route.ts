import { NextResponse } from 'next/server';
import { authorised, getProspect, saveProspect, saveDoc, event } from '../../../../../../lib/crmStore';

export const runtime = 'nodejs';
type Ctx = { params: Promise<{ id: string }> };
const TYPES: Record<string, string> = { 'application/pdf': 'pdf', 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' };

/* Ajout d'un PDF (ou d'une image) à la fiche : 4 Mo maximum. */
export async function POST(request: Request, { params }: Ctx) {
  if (!authorised(request)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const p = await getProspect((await params).id);
  if (!p) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
  const form = await request.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File)) return NextResponse.json({ error: 'Aucun fichier' }, { status: 400 });
  if (!TYPES[file.type]) return NextResponse.json({ error: 'Formats acceptés : PDF, PNG, JPG, WebP.' }, { status: 415 });
  if (file.size > 4 * 1024 * 1024) return NextResponse.json({ error: 'Fichier trop lourd (4 Mo maximum).' }, { status: 413 });
  const buf = Buffer.from(await file.arrayBuffer());
  if (file.type === 'application/pdf' && buf.subarray(0, 5).toString() !== '%PDF-') return NextResponse.json({ error: 'Ce fichier n’est pas un PDF valide.' }, { status: 415 });
  const url = await saveDoc(p.id, file.name, buf, file.type);
  p.docs.push({ name: file.name.slice(0, 120), url, at: new Date().toISOString(), size: file.size });
  p.history.push(event(`Document ajouté : ${file.name.slice(0, 120)}`));
  return NextResponse.json({ prospect: await saveProspect(p) });
}
