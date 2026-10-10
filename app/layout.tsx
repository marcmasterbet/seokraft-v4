import type { Metadata, Viewport } from 'next';
import './globals.css';
export const metadata: Metadata = {
 metadataBase: new URL('https://www.seokraft.fr'),
 title: 'SEOKRAFT | Création de sites internet & solutions web sur mesure',
 description: 'SEOKRAFT conçoit des sites WordPress autonomes, des sites sur mesure et des solutions web avancées. Design, développement, SEO et GEO pour les entreprises.',
 alternates: { canonical: '/' },
 openGraph: { type:'website', locale:'fr_FR', url:'https://www.seokraft.fr', siteName:'SEOKRAFT', title:'SEOKRAFT — Des sites qui ont du caractère', description:'Création de sites web, WordPress et solutions digitales sur mesure.' },
 robots: { index: true, follow: true },
};
export const viewport: Viewport = { width:'device-width', initialScale:1, themeColor:'#f4f0e8' };
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="fr"><body>{children}</body></html>}
