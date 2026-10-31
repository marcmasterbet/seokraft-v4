import type { Metadata } from 'next';
import SiteHeader from '../../components/SiteHeader';
import SiteFooter from '../../components/SiteFooter';
import Testimonials from '../../components/Testimonials';
import { WorkSection, Contact } from '../../components/Home';

const description = 'Les sites réalisés par SEOKRAFT, studio web à Strasbourg : REMUS SYSTEMS et LOCA DIRECT. Le besoin, la réalisation et les points clés de chaque projet.';
export const metadata: Metadata = {
 title: 'Réalisations : sites internet sur mesure | SEOKRAFT',
 description,
 alternates: { canonical: '/realisations' },
 openGraph: { images: [{ url: '/opengraph-image.jpg', width: 1200, height: 630, alt: 'SEOKRAFT, studio web à Strasbourg' }], title: 'Réalisations | SEOKRAFT', description, url: 'https://www.seokraft.fr/realisations' }
};

export default function RealisationsPage(){return <><SiteHeader/><main><WorkSection page/><Testimonials/><Contact/></main><SiteFooter/></>}
