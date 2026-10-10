import type { Metadata, Viewport } from 'next';
import './globals.css';
export const metadata: Metadata = {
  metadataBase: new URL('https://seokraft.fr'),
  title: 'SEOKRAFT — Des sites qui ne ressemblent à aucun autre',
  description: 'Studio digital : sites WordPress autonomes, création web sur mesure, plateformes et solutions digitales. SEO et GEO pour accompagner votre visibilité.',
  alternates: { canonical: '/' },
  openGraph: { title: 'SEOKRAFT — Studio digital', description: 'Sites web, solutions sur mesure et expériences digitales.', url: 'https://seokraft.fr', siteName: 'SEOKRAFT', locale: 'fr_FR', type: 'website' },
  robots: { index: true, follow: true }
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#f4f0e8' };
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="fr"><body>{children}</body></html>}
