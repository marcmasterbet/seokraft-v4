import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import Brand from '../../components/Brand';
import SiteHeader from '../../components/SiteHeader';

export const metadata: Metadata = {
  title: 'À propos | Marc Bretzner & Jeff Bond — SEOKRAFT',
  description: 'Découvrez Marc Bretzner, créateur de SEOKRAFT, et Jeff Bond, partenaire indépendant spécialiste du copywriting et du SEO éditorial.',
  alternates: { canonical: '/a-propos' },
};

export default function APropos() {
 return <div className="about-page">
  <SiteHeader/>
  <main>
   <section className="about-intro"><span className="about-kicker">À PROPOS · SEOKRAFT</span><h1>Des sites qui ont du sens.<br/><em>Des mots qui font la différence.</em></h1><p>Un site internet ne se résume pas à son apparence. Il doit raconter votre activité avec justesse, donner confiance et faciliter le passage à l’action. C’est cette conviction qui réunit nos expertises.</p></section>
   <section className="about-people" aria-label="Nos expertises">
    <article className="about-person"><div className="about-person-image"><Image src="/images/marc-portrait-a-propos.webp" alt="Portrait professionnel de Marc Bretzner" fill sizes="(max-width: 800px) 90vw, 38vw" priority/></div><div className="about-person-copy"><span className="about-kicker">CRÉATION & DÉVELOPPEMENT WEB</span><h2>Marc Bretzner<span className="about-period">.</span></h2><p className="about-role">Créateur de SEOKRAFT</p><p>Je conçois et développe des sites internet sur mesure pour les professionnels qui veulent une présence en ligne à la hauteur de leur activité.</p><p>Mon rôle : comprendre votre métier, imaginer une expérience claire et soignée, puis construire un site fiable, rapide et agréable à utiliser sur tous les écrans.</p><p>De notre premier échange à la mise en ligne, je reste votre interlocuteur pour la conception et le développement de votre projet.</p></div></article>
    <article className="about-person about-person-reverse"><div className="about-person-image"><Image src="/images/jeff-bond-a-propos.webp" alt="Portrait professionnel de Jeff Bond" fill sizes="(max-width: 800px) 90vw, 38vw" /></div><div className="about-person-copy"><span className="about-kicker">COPYWRITING & STRATÉGIE ÉDITORIALE · PARTENAIRE INDÉPENDANT</span><h2>Jeff Bond<span className="about-period">.</span></h2><p className="about-role">Copywriter des missions impossibles &amp; Président de la SAS JEGO</p><p>20 ans d’expérience dans le copywriting, avec une spécialité : rendre les messages impossibles à ignorer.</p><p>Je conçois la stratégie éditoriale des sites internet pour attirer, convaincre et convertir.</p><p>Copywriting, SEO éditorial, structure des pages et parcours client : je pilote toute la partie contenu et conversion.</p><p>Avec mes mots, rien n’est impossible.</p></div></article>
   </section>
   <section className="about-method"><span className="about-kicker">NOTRE APPROCHE</span><h2>Deux expertises.<br/><em>Un même objectif : votre projet.</em></h2><p>Marc pilote la conception et le développement web. Jeff intervient en tant que partenaire indépendant sur la stratégie éditoriale et le copywriting, selon le périmètre convenu pour chaque projet. Vous bénéficiez ainsi d’un site pensé autant pour l’expérience de vos visiteurs que pour la qualité de votre message.</p><Link href="/rendez-vous" className="about-button">Discutons de votre projet <ArrowUpRight size={18}/></Link></section>
  </main><footer className="about-footer"><Brand/><span>© SEOKRAFT — Marc Bretzner</span><Link href="/">Retour à l’accueil</Link></footer>
 </div>;
}
