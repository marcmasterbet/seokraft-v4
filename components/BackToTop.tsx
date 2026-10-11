'use client';
import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const update = () => setVisible(window.scrollY > 420);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  return <button type="button" className={`back-to-top${visible ? ' is-visible' : ''}`}
    aria-label="Retour en haut de page" title="Retour en haut"
    tabIndex={visible ? 0 : -1} aria-hidden={!visible}
    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
    <ArrowUp size={22} strokeWidth={2} aria-hidden="true" />
  </button>;
}
