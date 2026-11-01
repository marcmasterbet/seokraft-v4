import Image from 'next/image';
import { ArrowUpRight, UserPlus, CalendarDays, Mail, Phone } from 'lucide-react';

/* Page ouverte par le QR code de la carte de visite : enregistrer le contact, réserver un appel ou envoyer un e-mail. */
const MAIL = 'mailto:contact@seokraft.fr?subject=' + encodeURIComponent('Mon projet de site internet');

export default function CardPage(){
 return <main className="vc-page">
  <header className="vc-head">
   <div className="vc-photo"><Image src="/images/marc-accueil.webp" alt="Marc Bretzner, fondateur de SEOKRAFT" fill priority sizes="112px" style={{objectFit:'cover',objectPosition:'center 30%'}}/></div>
   <h1>Marc Bretzner<span>.</span></h1>
   <p className="vc-role">Création de sites internet &amp; SEO</p>
   <p className="vc-brand">SEOKRAFT<span>.</span> · Studio web indépendant · Strasbourg</p>
   <a className="vc-phone" href="tel:+33672209153"><Phone size={15} aria-hidden="true"/> 06 72 20 91 53</a>
  </header>

  <nav className="vc-actions" aria-label="Actions">
   <a className="vc-action vc-primary" href="/marc-bretzner.vcf" download="Marc-Bretzner-SEOKRAFT.vcf"><UserPlus size={20} aria-hidden="true"/><span><strong>Enregistrer mon contact</strong><small>Ajoute ma fiche à votre répertoire</small></span></a>
   <a className="vc-action" href="/rendez-vous"><CalendarDays size={20} aria-hidden="true"/><span><strong>Réserver un appel</strong><small>20 minutes, gratuit et sans engagement</small></span><ArrowUpRight size={18} aria-hidden="true"/></a>
   <a className="vc-action" href={MAIL}><Mail size={20} aria-hidden="true"/><span><strong>M’envoyer un e-mail</strong><small>contact@seokraft.fr</small></span><ArrowUpRight size={18} aria-hidden="true"/></a>
  </nav>

  <footer className="vc-foot"><a href="/">Découvrir le site seokraft.fr <ArrowUpRight size={15}/></a></footer>
 </main>;
}
