import type { Metadata } from 'next';
import CardPage from '../../components/CardPage';

export const metadata: Metadata = {
 title: 'Marc Bretzner | SEOKRAFT',
 description: 'Enregistrez le contact de Marc Bretzner, réservez un appel de 20 minutes ou présentez votre projet de site internet à SEOKRAFT, développeur web à Strasbourg.',
 alternates: { canonical: '/carte' },
 robots: { index: false, follow: true },
};

export default function Page(){return <CardPage/>}
