import type { Metadata } from 'next';
import AuditTool from '../../components/AuditTool';

export const metadata: Metadata = { title: 'Outil d’audit | SEOKRAFT', robots: { index: false, follow: false } };

export default function Page(){return <AuditTool/>}
