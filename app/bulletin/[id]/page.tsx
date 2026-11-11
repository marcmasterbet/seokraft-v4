import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BulletinView from '../../../components/BulletinView';
import { loadBulletin } from '../../../lib/auditEngine';
import { fmt20 } from '../../../components/auditTypes';
import { SAMPLE_BULLETIN } from '../../../components/sampleBulletin';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = (await params).id;
  const b = id === 'exemple' ? SAMPLE_BULLETIN : await loadBulletin(id);
  return { title: b ? `Bulletin de ${b.host} : ${fmt20(b.global)}/20 | SEOKRAFT` : 'Bulletin | SEOKRAFT', description: b ? `Le bulletin d’audit de ${b.host} par SEOKRAFT : note sur 20, points à corriger en premier et mesures de Google.` : undefined, robots: { index: false, follow: false } };
}

export default async function Page({ params }: Props) {
  const id = (await params).id;
  if (id === 'exemple') return <BulletinView b={SAMPLE_BULLETIN} sample />;
  const b = await loadBulletin(id);
  if (!b) notFound();
  return <BulletinView b={b} />;
}
