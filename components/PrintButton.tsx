'use client';
import { Download } from 'lucide-react';
export default function PrintButton({ name }: { name: string }) {
  return <button type="button" className="bv-print" onClick={() => { const t = document.title; document.title = name; window.print(); setTimeout(() => { document.title = t; }, 800); }}><Download size={16} aria-hidden="true" /> Télécharger mon bulletin en PDF</button>;
}
