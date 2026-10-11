import type { Metadata, Viewport } from 'next';
import './globals.css';
import BackToTop from '../components/BackToTop';
import AnalyticsConsent from '../components/AnalyticsConsent';
export const metadata: Metadata = {
 metadataBase: new URL('https://www.seokraft.fr'),
 title: 'Création de sites internet en Alsace | SEOKRAFT',
 description: 'SEOKRAFT crée des sites internet professionnels et sur mesure en Alsace : création, refonte, solutions web et visibilité Google.',
 alternates: { canonical: '/' },
 openGraph: { type:'website', locale:'fr_FR', url:'https://www.seokraft.fr', siteName:'SEOKRAFT', title:'SEOKRAFT — Création de sites internet en Alsace', description:'Création et refonte de sites internet, solutions web sur mesure et référencement pour les professionnels.' },
 robots: { index: true, follow: true },
};
export const viewport: Viewport = { width:'device-width', initialScale:1, themeColor:'#f4f0e8' };
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="fr"><body>{children}<BackToTop/><AnalyticsConsent/></body></html>}
