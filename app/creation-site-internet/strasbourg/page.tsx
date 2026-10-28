import type { Metadata } from 'next';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import SiteHeader from '../../../components/SiteHeader';
import SiteFooter from '../../../components/SiteFooter';
import Testimonials from '../../../components/Testimonials';
import { WorkSection, StudioSection, PricingSection, FaqSection, Contact } from '../../../components/Home';

export const metadata: Metadata = {
 title: 'Création de site internet à Strasbourg | SEOKRAFT',
 description: 'Création de site internet sur mesure à Strasbourg et en Alsace : site vitrine, refonte, design, mobile et SEO. Dès 1 990 € TTC. Échange gratuit avec Marc Bretzner.',
 alternates: { canonical: '/creation-site-internet/strasbourg' },
 openGraph: {
  type: 'website', locale: 'fr_FR', siteName: 'SEOKRAFT',
  url: 'https://www.seokraft.fr/creation-site-internet/strasbourg',
  title: 'Création de site internet à Strasbourg | SEOKRAFT',
  description: 'Un site internet professionnel et sur mesure pour les entreprises, indépendants et associations de Strasbourg et d’Alsace.'
 }
};

const studioText = 'Chez SEOKRAFT, vous échangez directement avec la personne qui conçoit votre site. Les échanges se font en visio, par téléphone ou par e-mail, et je peux me déplacer pour vous rencontrer à Strasbourg et dans ses environs. De notre premier échange à la mise en ligne, je prends le temps de comprendre votre activité, vos attentes et vos priorités.';

const faqs = [
 ['Faut-il être à Strasbourg pour travailler avec vous ?', 'Non. La majorité des échanges se fait en visio, par téléphone et par e-mail, ce qui permet d’accompagner des clients partout en France et en Belgique. Pour les entreprises de Strasbourg et des environs, un déplacement est possible pour se rencontrer.'],
 ['Combien coûte la création d’un site internet ?', 'Un site sur mesure démarre à 1 990 € TTC pour une page, et le tarif évolue selon le nombre de pages : vous pouvez l’estimer avec le simulateur ci-dessus. Les fonctionnalités spécifiques (réservation, espace client, blog…) sont chiffrées sur devis. L’hébergement et la maintenance représentent 49 € TTC par mois.'],
 ['Combien de temps faut-il pour créer un site ?', 'Le délai dépend du nombre de pages, des fonctionnalités et de la disponibilité de vos contenus. Il est précisé dans le devis, avant le démarrage du projet.'],
 ['Pouvez-vous refaire mon site existant ?', 'Oui. Une refonte permet de moderniser votre image, de clarifier la navigation et d’améliorer les bases de votre référencement, en conservant ce qui fonctionne déjà.'],
 ['Mon site sera-t-il visible sur Google à Strasbourg ?', 'Chaque site est construit avec des fondations SEO solides : structure, balises, contenus et performances. Le référencement demande toutefois du temps, et aucun positionnement ne peut être garanti. Un accompagnement SEO dédié est possible si vous souhaitez aller plus loin.'],
 ['Qui sera mon interlocuteur ?', 'Moi, Marc Bretzner. Vous échangez directement avec la personne qui conçoit et développe votre site, du premier appel jusqu’au suivi après la mise en ligne.']
];

const guides = [
 ['/blog/prix-site-internet', 'Combien coûte un site internet ?', 'Les fourchettes de prix, les coûts annuels et les pièges à éviter.'],
 ['/blog/preparer-creation-site-internet', 'Préparer son projet', 'La check-list à remplir avant de demander un devis.'],
 ['/blog/site-vitrine-ou-e-commerce', 'Site vitrine ou e-commerce ?', 'Choisir le bon type de site selon votre activité.'],
 ['/blog/choisir-createur-site-internet-strasbourg', 'Choisir son créateur de site', 'Les critères et les questions à poser avant de vous engager.']
];

export default function CreationSiteStrasbourg() {
 return <><SiteHeader/><main>
  <section className="hero" id="accueil"><div className="hero-top"><span className="eyebrow"><span className="eyebrow-dot"/> CRÉATION DE SITE INTERNET · STRASBOURG · ALSACE</span><span className="hero-aside">CRÉATION DE SITES INTERNET<br/>SOLUTIONS WEB SUR MESURE</span></div><div className="hero-layout"><div className="hero-copy"><h1>Création de site internet <em>à Strasbourg</em><span className="olive-dot">.</span></h1><p className="hero-question">Vous êtes artisan, indépendant, association ou dirigeant de TPE à Strasbourg ou en Alsace, et vous avez besoin d’un site qui inspire confiance ?</p><p>SEOKRAFT conçoit des sites internet professionnels, modernes et sur mesure, qui présentent clairement votre activité et donnent envie à vos futurs clients de vous contacter.</p><div className="hero-actions"><a className="button button-olive" href="#contact">Parlons de votre projet <ArrowUpRight size={17}/></a><a className="hero-call-button" href="/rendez-vous">Réserver un appel <ArrowUpRight size={17}/></a></div></div><div className="hero-visual"><div className="hero-photo"><Image src="/images/marc-accueil.webp" alt="Marc Bretzner, créateur de sites internet à Strasbourg, fondateur de SEOKRAFT" fill priority sizes="(max-width: 800px) 90vw, 45vw" style={{objectFit:'cover',objectPosition:'center 30%'}}/></div><a className="hero-project-link" href="#realisations">Voir nos réalisations <ArrowUpRight size={18}/></a></div></div><a href="#besoins" className="scroll-cue">DÉCOUVRIR NOTRE APPROCHE <span>↓</span></a></section>

  <section className="intro-scene" id="besoins" aria-label="Un site internet pour votre entreprise à Strasbourg"><span className="eyebrow light">UN SITE PENSÉ POUR VOTRE MÉTIER</span><h2>Un site internet qui<br/><em>travaille pour vous.</em></h2><p>Artisans, commerçants, indépendants, professions libérales, associations ou TPE de l’Eurométropole : chaque activité a ses propres clients et ses propres questions. Votre site doit y répondre simplement, inspirer confiance et faciliter la prise de contact.</p><p>Design sur mesure, version mobile, textes rédigés pour convaincre et bases du référencement : <strong>tout est pensé pour que votre site apporte de vrais contacts à votre entreprise.</strong></p></section>

  <WorkSection/>
  <StudioSection text={studioText}/>
  <Testimonials/>
  <PricingSection/>

  <section className="seo-scene" id="zone"><div className="seo-scene-inner"><span className="eyebrow light">ZONE D’INTERVENTION</span><h2>Strasbourg, l’Eurométropole<br/><em>et toute l’Alsace.</em></h2><p>J’accompagne les entreprises et associations de Strasbourg, Schiltigheim, Illkirch-Graffenstaden, Lingolsheim, Bischheim, Hœnheim, Ostwald, Eckbolsheim et Vendenheim, mais aussi de Haguenau, Molsheim, Obernai, Sélestat et Saverne. Grâce au travail à distance, je réalise aussi des sites pour des clients partout en France et en Belgique.</p><a href="/rendez-vous" className="seo-link">Réserver un appel gratuit de 20 minutes <ArrowUpRight size={18}/></a></div></section>

  <section className="expertise-section" id="guides"><div className="expertise-heading"><span className="eyebrow">GUIDES UTILES</span><h2>Préparer votre projet.<br/><em>En toute clarté.</em></h2><p>Prix, préparation, type de site, choix du prestataire : des réponses concrètes aux questions que vous vous posez avant de créer votre site.</p><a className="expertise-heading-link" href="/blog">Voir tous les articles <ArrowUpRight size={17}/></a></div><div className="expertise-lines">{guides.map(([href, t, d]) => <a href={href} className="expertise-item" key={href}><span>{t}</span><p>{d}</p><ArrowUpRight aria-hidden="true"/></a>)}</div></section>

  <FaqSection items={faqs}/>
  <Contact/>
 </main><SiteFooter/></>;
}
