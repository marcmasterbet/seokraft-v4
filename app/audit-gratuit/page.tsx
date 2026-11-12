import type { Metadata } from 'next';
import AuditLanding from '../../components/AuditLanding';

const description = 'Votre site noté sur 20, gratuitement : vitesse, Google, textes et contact analysés, et les priorités à corriger. Par SEOKRAFT, à Strasbourg.';
export const metadata: Metadata = {
 title: 'Audit gratuit : votre site noté sur 20 | SEOKRAFT',
 description,
 alternates: { canonical: '/audit-gratuit' },
 openGraph: { images: [{ url: '/images/og-audit.jpg', width: 1200, height: 630, alt: 'Audit gratuit SEOKRAFT : votre site noté sur 20' }], title: 'Votre site noté sur 20, gratuitement | SEOKRAFT', description, url: 'https://www.seokraft.fr/audit-gratuit' }
};

export default function Page(){return <AuditLanding/>}
