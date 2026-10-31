import type { Metadata } from 'next';
import SiteHeader from '../../components/SiteHeader';
import SiteFooter from '../../components/SiteFooter';
import { Contact } from '../../components/Home';

const description = 'Parlez de votre projet de site internet à SEOKRAFT, studio web à Strasbourg : formulaire de contact ou appel gratuit de 20 minutes. Réponse sous 24 h.';
export const metadata: Metadata = {
 title: 'Contact : parlons de votre projet web | SEOKRAFT',
 description,
 alternates: { canonical: '/contact' },
 openGraph: { images: [{ url: '/opengraph-image.jpg', width: 1200, height: 630, alt: 'SEOKRAFT, studio web à Strasbourg' }], title: 'Contact | SEOKRAFT', description, url: 'https://www.seokraft.fr/contact' }
};

export default function ContactPage(){return <><SiteHeader/><main><Contact page/></main><SiteFooter/></>}
