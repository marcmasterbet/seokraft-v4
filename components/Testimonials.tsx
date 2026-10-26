'use client';
import { useEffect, useState } from 'react';
import { X, ArrowUpRight } from 'lucide-react';
import { LINKEDIN_URL, LinkedInGlyph } from './SocialLinks';

type Testimonial = {
 initials: string;
 name: string;
 role: string;
 source: 'linkedin' | 'message';
 text: string[];
};

/* Pour ajouter une recommandation : copier un bloc et le compléter. */
const testimonials: Testimonial[] = [
 {
  initials: 'HE',
  name: 'Hugo Elvira',
  role: 'Producteur audiovisuel · Fondateur de VATEA',
  source: 'linkedin',
  text: [
   'J’ai travaillé avec Marc sur le développement du site internet de VATEA. Il a su comprendre mes besoins et les traduire en un site fonctionnel, agréable à utiliser et fidèle à l’image de mon entreprise.',
   'J’ai particulièrement apprécié son écoute, sa disponibilité et son implication dans le projet. Ses conseils et ses explications claires m’ont permis de faire les bons choix et d’avancer sereinement à chaque étape.',
   'Une très bonne collaboration. Je recommande Marc avec plaisir à toute personne qui recherche un développeur web sérieux, attentif et investi dans la réussite de son projet.'
  ]
 },
 {
  initials: 'JF',
  name: 'Jean-François Framarin',
  role: 'Responsable communication · Association UZTA, Ustaritz',
  source: 'linkedin',
  text: [
   'Pour la création complète du site internet de notre association UZTA, j’ai choisi de faire appel à Marc Bretzner, fondateur de SEOKRAFT.',
   'UZTA est une association qui regroupe les commerçants, artisans, indépendants et professions libérales d’Ustaritz, au Pays basque.',
   'Notre objectif était clair : disposer d’un véritable site internet professionnel pour présenter notre association, valoriser nos adhérents, faire découvrir leurs activités et renforcer la visibilité des professionnels de notre commune.',
   'Ce projet nécessitait bien plus que la création d’un simple site vitrine. Il fallait concevoir une plateforme claire, moderne, agréable à consulter et capable d’évoluer avec notre association.',
   'J’ai donc sollicité Marc pour prendre en charge la création et le développement du site internet UZTA.fr, de A à Z.',
   'Ce que j’apprécie particulièrement dans son approche, c’est sa capacité à comprendre les besoins d’un projet avant de se lancer dans son développement.',
   'Structure du site, expérience utilisateur, design responsive, navigation sur ordinateur et smartphone, fonctionnalités adaptées et développement web sur mesure : Marc possède les compétences techniques nécessaires pour construire une solution cohérente.',
   'Son expertise permet également d’anticiper les évolutions futures du site, notamment l’intégration de nouveaux adhérents, la présentation de leurs entreprises et la publication d’actualités.',
   'Autre point important : Marc est un interlocuteur accessible, à l’écoute et véritablement impliqué dans les projets qu’il accompagne.',
   'Pour une association comme la nôtre, pouvoir échanger directement avec le développeur web est un véritable avantage.',
   'On ne cherche pas simplement quelqu’un capable de créer des pages internet. On recherche un professionnel qui comprend les objectifs du projet et sait les traduire en une solution technique adaptée.',
   'Je recommande Marc Bretzner et SEOKRAFT aux associations, entrepreneurs, commerçants, artisans, professions libérales et dirigeants de TPE/PME qui souhaitent créer ou refondre leur site internet.',
   'Que votre besoin concerne la création d’un site vitrine professionnel, la refonte d’un site existant, le développement de fonctionnalités personnalisées ou un projet web sur mesure, Marc est un partenaire sérieux à consulter.',
   'Un bon site internet ne doit pas seulement être esthétique. Il doit être utile, fonctionnel et adapté aux personnes qui vont l’utiliser.',
   'C’est précisément cette vision que je recherchais pour UZTA.'
  ]
 },
 {
  initials: 'UC',
  name: 'UrkeyConciergerie',
  role: 'Conciergerie',
  source: 'message',
  text: ['Je te remercie pour tes services au top et vais te recommander à mes contacts. Merci beaucoup Marc !']
 },
 {
  initials: 'IP',
  name: 'Itclean Propreté',
  role: 'Entreprise de propreté',
  source: 'message',
  text: ['Je recommande vivement Marc Bretzner ! Il a pris le temps de m’alerter spontanément d’un problème sur mon site internet, ce qui nous a permis de le corriger rapidement. En plus d’être très professionnel et expert dans son domaine, c’est quelqu’un de bienveillant et d’une grande valeur humaine. N’hésitez pas à faire appel à lui pour vos projets de développement web !']
 }
];

function LinkedInIcon({ className }: { className?: string }) {
 return <svg className={className} viewBox="0 0 24 24" role="img" aria-label="Recommandation LinkedIn"><path fill="currentColor" d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45z"/></svg>;
}
function MessageIcon({ className }: { className?: string }) {
 return <svg className={className} viewBox="0 0 24 24" role="img" aria-label="Message client"><path d="M4 5h16v11H9l-5 4z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>;
}

function Author({ t }: { t: Testimonial }) {
 return <div className="tm-author">
  <span className="tm-avatar" aria-hidden="true">{t.initials}</span>
  <span className="tm-who"><strong>{t.name}</strong><span>{t.role}</span></span>
  {t.source === 'linkedin' ? <LinkedInIcon className="tm-source tm-source-li"/> : <MessageIcon className="tm-source"/>}
 </div>;
}

export default function Testimonials() {
 const [open, setOpen] = useState<number | null>(null);

 useEffect(() => {
  if (open === null) return;
  const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(null); };
  document.addEventListener('keydown', onKey);
  const prev = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
 }, [open]);

 // La liste est répétée pour remplir l'écran, puis doublée pour une boucle sans à-coup.
 const base = [...testimonials, ...testimonials];
 const loop = [...base, ...base];

 return <section className="testimonials-section" id="avis" aria-labelledby="avis-titre">
  <div className="tm-head">
   <span className="eyebrow light">RECOMMANDATIONS CLIENTS</span>
   <h2 id="avis-titre">Ils m’ont confié<br/><em>leur projet.</em></h2>
   <a className="tm-linkedin-link" href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer"><LinkedInGlyph size={16}/> Voir toutes mes recommandations sur LinkedIn <ArrowUpRight size={16}/></a>
  </div>
  <div className="tm-viewport">
   <div className="tm-track" style={{ '--tm-duration': `${base.length * 9}s` } as React.CSSProperties}>
    {loop.map((t, k) => {
     const i = k % testimonials.length;
     const clone = k >= testimonials.length;
     return <button type="button" className="tm-card" key={k} onClick={() => setOpen(i)} tabIndex={clone ? -1 : 0} aria-hidden={clone || undefined} aria-label={clone ? undefined : `Lire la recommandation complète de ${t.name}`}>
      <span className="tm-quote-mark" aria-hidden="true">“</span>
      <span className="tm-text">{t.text.join(' ')}</span>
      <Author t={t}/>
     </button>;
    })}
   </div>
  </div>
  <p className="tm-hint">Cliquez sur une recommandation pour la lire en entier.</p>

  {open !== null && <div className="tm-modal" role="dialog" aria-modal="true" aria-label={`Recommandation de ${testimonials[open].name}`} onClick={e => { if (e.target === e.currentTarget) setOpen(null); }}>
   <div className="tm-modal-box">
    <button type="button" className="tm-close" onClick={() => setOpen(null)} aria-label="Fermer" autoFocus><X size={22}/></button>
    <span className="tm-quote-mark" aria-hidden="true">“</span>
    {testimonials[open].text.map(p => <p key={p}>{p}</p>)}
    <Author t={testimonials[open]}/>
   </div>
  </div>}
 </section>;
}
