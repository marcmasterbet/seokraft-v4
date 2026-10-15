import type { Metadata } from 'next';
import Home from '@/components/Home';
const title='Création site internet Alsace & Strasbourg | SEOKRAFT';
const description='Sites internet sur mesure en Alsace : design, développement et textes pros, un seul interlocuteur. En ligne en 5 semaines. Appel gratuit de 20 min.';
export const metadata: Metadata = {
 title,
 description,
 alternates: { canonical: '/' },
 openGraph: { type:'website', locale:'fr_FR', url:'https://www.seokraft.fr', siteName:'SEOKRAFT', title, description },
 twitter: { card:'summary', title, description },
};
export default function Page(){return <Home/>}
