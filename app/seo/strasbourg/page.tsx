import type { Metadata } from 'next';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import SiteHeader from '../../../components/SiteHeader';
import SiteFooter from '../../../components/SiteFooter';
import { StudioSection, Contact } from '../../../components/Home';

export const metadata: Metadata = {
 title: 'Référencement SEO à Strasbourg | SEOKRAFT',
 description: 'Accompagnement SEO à Strasbourg : optimisation technique des pages, référencement local et suivi de la visibilité Google. Échangeons sur votre site.',
 alternates: { canonical: '/seo/strasbourg' },
 robots: { index: true, follow: true },
 openGraph: { title: 'Référencement naturel à Strasbourg | SEOKRAFT', description: 'Un référencement naturel pensé pour les entreprises de Strasbourg et d’Alsace.', url: 'https://www.seokraft.fr/seo/strasbourg' }
};

const services = [
 ['Fondations SEO', 'Structurer les pages, les balises et les contenus pour faciliter leur compréhension par les moteurs de recherche.'],
 ['Optimisation des pages', 'Travailler les titres, les contenus, le maillage interne et les intentions de recherche utiles à vos clients.'],
 ['Référencement local', 'Renforcer la cohérence de votre présence en ligne pour les recherches liées à Strasbourg et à votre zone d’intervention.'],
 ['Suivi et améliorations', 'Mesurer les évolutions et prioriser les actions en fonction des données plutôt que des promesses de positionnement.']
];

const studioText = 'Chez SEOKRAFT, vous échangez directement avec la personne qui travaille sur votre site. Je prends le temps de comprendre votre offre, votre zone géographique et vos clients, puis je vous explique clairement les actions menées et les résultats observés, sans jargon ni promesse de positionnement.';

export default function SeoStrasbourgPage() {
 return <><SiteHeader/><main>
  <section className="hero" id="accueil"><div className="hero-top"><span className="eyebrow"><span className="eyebrow-dot"/> SEO · STRASBOURG · ALSACE</span><span className="hero-aside">RÉFÉRENCEMENT NATUREL<br/>SEO &amp; GEO</span></div><div className="hero-layout"><div className="hero-copy"><h1>Référencement SEO <em>à Strasbourg</em><span className="olive-dot">.</span></h1><p className="hero-question">Votre site existe, mais vos futurs clients ne le trouvent pas sur Google ?</p><p>Votre site doit être compréhensible pour Google, utile pour vos visiteurs et capable de présenter clairement votre activité. SEOKRAFT accompagne les entreprises de Strasbourg et d’Alsace dans l’amélioration de leur référencement naturel.</p><div className="hero-actions"><a className="button button-olive" href="#contact">Parlons de votre site <ArrowUpRight size={17}/></a><a className="hero-call-button" href="/rendez-vous">Réserver un appel <ArrowUpRight size={17}/></a></div></div><div className="hero-visual"><div className="hero-photo"><Image src="/images/marc-accueil.webp" alt="Marc Bretzner, créateur de sites internet à Strasbourg, fondateur de SEOKRAFT" fill priority sizes="(max-width: 800px) 90vw, 45vw" style={{objectFit:'cover',objectPosition:'center 30%'}}/></div><a className="hero-project-link" href="/creation-site-internet/strasbourg">Création de site à Strasbourg <ArrowUpRight size={18}/></a></div></div><a href="#besoins" className="scroll-cue">DÉCOUVRIR NOTRE APPROCHE <span>↓</span></a></section>

  <section className="intro-scene" id="besoins" aria-label="Une stratégie SEO adaptée à votre activité"><span className="eyebrow light">UNE STRATÉGIE ADAPTÉE À VOTRE ACTIVITÉ</span><h2>Être trouvé par<br/><em>les bons clients.</em></h2><p>Artisan, prestataire de services, commerce ou entreprise B2B : les recherches de vos futurs clients ne sont pas toutes les mêmes. Le travail commence par comprendre votre offre, votre zone géographique et les pages dont vous avez réellement besoin.</p></section>

  <section className="expertise-section" id="expertises"><div className="expertise-heading"><span className="eyebrow">L’ACCOMPAGNEMENT SEO</span><h2>Des actions concrètes.<br/><em>Des résultats suivis.</em></h2><p>Un référencement construit étape par étape, sur des bases solides, et mesuré avec des données réelles.</p><a className="expertise-heading-link" href="#contact">Discutons de votre site <ArrowUpRight size={17}/></a></div><div className="expertise-lines">{services.map(([t, d]) => <a href="#contact" className="expertise-item" key={t}><span>{t}</span><p>{d}</p><ArrowUpRight aria-hidden="true"/></a>)}</div></section>

  <StudioSection text={studioText}/>

  <section className="seo-scene" id="local"><div className="seo-scene-inner"><span className="eyebrow light">VISIBILITÉ LOCALE · SEO &amp; GEO</span><h2>Être visible à Strasbourg.<br/><em>Sur Google et ailleurs.</em></h2><p>Une entreprise implantée à Strasbourg peut être recherchée par son métier, son service ou sa localisation, sur Google comme dans les réponses des assistants IA. Des pages bien structurées, des informations cohérentes et un contenu pertinent facilitent la compréhension de votre activité. Le SEO demande du temps : aucun classement ni volume de contacts ne peut être garanti.</p><a href="/blog/seo-vs-geo" className="seo-link">Comprendre la différence entre SEO et GEO <ArrowUpRight size={18}/></a></div></section>

  <Contact/>
 </main><SiteFooter/></>;
}
