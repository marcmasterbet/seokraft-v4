import type { Metadata } from 'next';
import SiteHeader from '../../components/SiteHeader';
import SiteFooter from '../../components/SiteFooter';
import { PricingSection, Contact } from '../../components/Home';

const description = 'Création de site internet à partir de 1 990 € TTC, hébergement et maintenance à 49 € TTC/mois. Estimez le prix de votre site selon le nombre de pages.';
export const metadata: Metadata = {
 title: 'Tarifs création de site internet à Strasbourg | SEOKRAFT',
 description,
 alternates: { canonical: '/tarifs' },
 openGraph: { images: [{ url: '/opengraph-image.jpg', width: 1200, height: 630, alt: 'SEOKRAFT, studio web à Strasbourg' }], title: 'Tarifs création de site internet | SEOKRAFT', description, url: 'https://www.seokraft.fr/tarifs' }
};

export default function TarifsPage(){return <><SiteHeader/><main><PricingSection page/><Contact/></main><SiteFooter/></>}
