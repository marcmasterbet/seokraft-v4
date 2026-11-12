import type { Metadata } from 'next';
import CrmApp from '../../components/CrmApp';

export const metadata: Metadata = { title: 'CRM | SEOKRAFT', robots: { index: false, follow: false } };

export default function Page() { return <CrmApp />; }
