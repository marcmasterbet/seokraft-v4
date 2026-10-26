import type { Metadata, Viewport } from 'next';
import './globals.css';
import BackToTop from '../components/BackToTop';
import AnalyticsConsent from '../components/AnalyticsConsent';
export const metadata: Metadata = {
 metadataBase: new URL('https://www.seokraft.fr'),
 title: 'Création de site internet à Strasbourg et en Alsace | SEOKRAFT',
 description: 'SEOKRAFT crée des sites internet professionnels et sur mesure à Strasbourg et en Alsace : création, refonte, solutions web et visibilité sur Google.',
 alternates: { canonical: '/' },
 openGraph: { type:'website', locale:'fr_FR', url:'https://www.seokraft.fr', siteName:'SEOKRAFT', title:'SEOKRAFT — Création de site internet à Strasbourg et en Alsace', description:'Création et refonte de sites internet, solutions web sur mesure et référencement pour les professionnels.' },
 robots: { index: true, follow: true },
};
const schema = {
 '@context': 'https://schema.org',
 '@graph': [
  {
   '@type': 'ProfessionalService',
   '@id': 'https://www.seokraft.fr/#business',
   name: 'SEOKRAFT',
   url: 'https://www.seokraft.fr',
   image: 'https://www.seokraft.fr/images/marc-portrait-rond.webp',
   description: 'Création et refonte de sites internet sur mesure, solutions web et référencement SEO à Strasbourg et en Alsace.',
   priceRange: '€€',
   founder: { '@id': 'https://www.seokraft.fr/#marc' },
   areaServed: [
    { '@type': 'City', name: 'Strasbourg' },
    { '@type': 'AdministrativeArea', name: 'Eurométropole de Strasbourg' },
    { '@type': 'AdministrativeArea', name: 'Bas-Rhin' },
    { '@type': 'AdministrativeArea', name: 'Alsace' },
    { '@type': 'Country', name: 'France' }
   ],
   knowsAbout: ['Création de site internet', 'Refonte de site internet', 'Développement web', 'Référencement SEO', 'GEO'],
   sameAs: ['https://www.linkedin.com/in/marc-bretzner-d%C3%A9veloppeur-web']
  },
  {
   '@type': 'Person',
   '@id': 'https://www.seokraft.fr/#marc',
   name: 'Marc Bretzner',
   jobTitle: 'Créateur de sites internet',
   worksFor: { '@id': 'https://www.seokraft.fr/#business' },
   sameAs: ['https://www.linkedin.com/in/marc-bretzner-d%C3%A9veloppeur-web']
  }
 ]
};
export const viewport: Viewport = { width:'device-width', initialScale:1, themeColor:'#f4f0e8' };
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="fr"><body><script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(schema)}}/>{children}<BackToTop/><AnalyticsConsent/></body></html>}
