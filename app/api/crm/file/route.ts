import { authorised, readLocalFile } from '../../../../lib/crmStore';

export const runtime = 'nodejs';
/* Lecture des pièces jointes en local uniquement (en ligne, elles sont servies par Vercel Blob). */
export async function GET(request: Request) {
  if (!authorised(request)) return new Response('Non autorisé', { status: 401 });
  const p = new URL(request.url).searchParams.get('p') || '';
  const buf = await readLocalFile(p);
  if (!buf) return new Response('Introuvable', { status: 404 });
  return new Response(new Uint8Array(buf), { headers: { 'Content-Type': p.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream' } });
}
