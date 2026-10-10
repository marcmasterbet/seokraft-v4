import type { Metadata, Viewport } from 'next';
import './globals.css';
export const metadata: Metadata = {
 metadataBase: new URL('https://www.seokraft.fr'),
 title: 'Création de sites internet en Alsace | SEOKRAFT',
 description: 'SEOKRAFT crée des sites internet WordPress et sur mesure en Alsace. Des sites professionnels pensés pour votre activité, vos clients et vos ambitions.',
 alternates: { canonical: '/' },
 openGraph: { type:'website', locale:'fr_FR', url:'https://www.seokraft.fr', siteName:'SEOKRAFT', title:'SEOKRAFT — Création de sites internet en Alsace', description:'Création de sites WordPress, sites sur mesure et solutions web pour les professionnels.' },
 robots: { index: true, follow: true },
};
export const viewport: Viewport = { width:'device-width', initialScale:1, themeColor:'#f4f0e8' };
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="fr"><body>{children}</body></html>}
