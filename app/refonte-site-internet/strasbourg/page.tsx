import type { Metadata } from 'next';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import SiteHeader from '../../../components/SiteHeader';
import SiteFooter from '../../../components/SiteFooter';
import Testimonials from '../../../components/Testimonials';
import { PricingTeaser, FaqSection, Contact } from '../../../components/Home';

export const metadata: Metadata = {
 title: 'Refonte de site internet à Strasbourg | SEOKRAFT',
 description: 'Refonte de site internet à Strasbourg et en Alsace : un site plus clair, plus rapide et mieux référencé, sans perdre vos positions Google. Audit gratuit de votre site actuel.',
 alternates: { canonical: '/refonte-site-internet/strasbourg' },
 openGraph: { images: [{ url: '/opengraph-image.jpg', width: 1200, height: 630, alt: 'SEOKRAFT, refonte de sites internet à Strasbourg' }],
  type: 'website', locale: 'fr_FR', siteName: 'SEOKRAFT',
  url: 'https://www.seokraft.fr/refonte-site-internet/strasbourg',
  title: 'Refonte de site internet à Strasbourg | SEOKRAFT',
  description: 'Votre site existe, mais il ne vous ramène pas de clients ? Je le refais pour qu’il convainque, sans perdre ce que Google connaît déjà.'
 }
};

const signes = [
 ['Il ne vous ramène plus de demandes', 'Des visiteurs passent, mais personne ne vous appelle ni ne remplit le formulaire.'],
 ['Il est lent ou mal affiché sur téléphone', 'La majorité de vos visiteurs arrivent sur mobile. S’ils attendent ou doivent zoomer, ils repartent.'],
 ['Il ne ressemble plus à votre entreprise', 'Vos services, vos prix ou votre image ont évolué, votre site est resté figé.'],
 ['Vous êtes invisible sur Google', 'On vous trouve en tapant votre nom, mais pas en cherchant votre métier dans votre ville.'],
 ['Vous ne pouvez pas le modifier', 'Un prestataire injoignable, un outil que vous ne maîtrisez pas : chaque changement devient un problème.']
];

const methode = [
 ['1. L’audit de l’existant', 'Je passe votre site actuel au crible : ce qui fonctionne, ce qui vous fait perdre des clients, et les pages que Google apprécie déjà.'],
 ['2. On garde ce qui marche', 'Vos contenus utiles, vos pages bien placées et votre nom de domaine sont conservés. On ne repart pas de zéro sans raison.'],
 ['3. De nouveaux textes et un nouveau design', 'Des textes écrits pour convaincre vos clients et une mise en page sur mesure, pensée d’abord pour le téléphone.'],
 ['4. Une mise en ligne sans rien perdre', 'Chaque ancienne adresse est redirigée vers la bonne nouvelle page, pour garder vos positions sur Google et ne laisser aucun lien cassé.']
];

const faqs: [string, string][] = [
 ['Vais-je perdre mon référencement avec une refonte ?', 'Pas si la refonte est bien faite. Avant la mise en ligne, je liste les adresses de votre site actuel et je redirige chacune vers la bonne nouvelle page. Google comprend ainsi que vos pages ont déménagé, et vous gardez ce que vous aviez acquis.'],
 ['Faut-il tout refaire ou peut-on garder une partie du site ?', 'Ça dépend de ce que dit l’audit. Parfois, quelques corrections suffisent. Je vous dis franchement ce qui mérite d’être refait et ce qui peut rester.'],
 ['Combien coûte une refonte ?', 'Le même tarif qu’une création : 1 690 € TTC pour la première page, puis 500 € TTC par page supplémentaire, textes et référencement inclus. Le prix est annoncé avant de commencer.'],
 ['Mon site reste-t-il en ligne pendant les travaux ?', 'Oui. Le nouveau site est préparé à part, puis il remplace l’ancien en une fois, quand tout est validé.'],
 ['Je ne connais plus les accès de mon ancien site, est-ce un problème ?', 'C’est fréquent. Il faut surtout garder la main sur votre nom de domaine. Je vous aide à retrouver ou récupérer les accès nécessaires.']
];

export default function RefonteSiteStrasbourg() {
 return <><SiteHeader/><main>
  <section className="hero" id="accueil"><div className="hero-top"><span className="eyebrow"><span className="eyebrow-dot"/> REFONTE DE SITE INTERNET · STRASBOURG · ALSACE</span><span className="hero-aside">CRÉATION DE SITES INTERNET<br/>SOLUTIONS WEB SUR MESURE</span></div><div className="hero-layout"><div className="hero-copy"><h1>Refonte de site internet <em>à Strasbourg</em><span className="olive-dot">.</span></h1><p className="hero-question">Votre site existe, mais il ne vous ramène pas de clients ?</p><p>Je le refais pour qu’il soit clair, rapide sur téléphone et bien placé sur Google, sans perdre ce que votre site actuel a déjà construit.</p><div className="hero-actions"><a className="button button-olive" href="/audit-gratuit">Faire auditer mon site gratuitement <ArrowUpRight size={17}/></a><a className="hero-call-button" href="/rendez-vous">Réserver un appel <ArrowUpRight size={17}/></a></div></div><div className="hero-visual"><div className="hero-photo"><Image src="/images/marc-accueil.webp" alt="Marc Bretzner, refonte de sites internet à Strasbourg, fondateur de SEOKRAFT" fill priority sizes="(max-width: 800px) 90vw, 45vw" style={{objectFit:'cover',objectPosition:'center 30%'}}/></div><a className="hero-project-link" href="/realisations">Voir mes réalisations <ArrowUpRight size={18}/></a></div></div><a href="#signes" className="scroll-cue">EST-CE LE MOMENT ? <span>↓</span></a></section>

  <section className="expertise-section" id="signes"><div className="expertise-heading"><span className="eyebrow">LES SIGNES QUI NE TROMPENT PAS</span><h2>Quand faut-il<br/><em>refaire son site ?</em></h2><p>Si vous vous reconnaissez dans un seul de ces points, votre site vous coûte probablement des clients.</p><a className="expertise-heading-link" href="/audit-gratuit">Vérifier mon site gratuitement <ArrowUpRight size={17}/></a></div><div className="expertise-lines">{signes.map(([t, d]) => <div className="expertise-item" key={t}><span>{t}</span><p>{d}</p><span aria-hidden="true"/></div>)}</div></section>

  <section className="seo-scene" id="methode"><div className="seo-scene-inner"><span className="eyebrow light">MA MÉTHODE</span><h2>Refaire votre site,<br/><em>sans repartir de zéro.</em></h2>{methode.map(([t, d]) => <p key={t}><strong>{t}</strong><br/>{d}</p>)}<a href="/rendez-vous" className="seo-link">Réserver un appel gratuit de 20 minutes <ArrowUpRight size={18}/></a></div></section>

  <Testimonials/>
  <PricingTeaser/>
  <FaqSection items={faqs} title={['Une refonte, ', 'ça se prépare.']}/>
  <Contact/>
 </main><SiteFooter/></>;
}
