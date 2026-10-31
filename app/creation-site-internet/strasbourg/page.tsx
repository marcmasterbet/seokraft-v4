import type { Metadata } from 'next';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import SiteHeader from '../../../components/SiteHeader';
import SiteFooter from '../../../components/SiteFooter';
import Testimonials from '../../../components/Testimonials';
import { WorkTeaser, PricingTeaser, ProblemSection, FaqSection, Contact } from '../../../components/Home';

export const metadata: Metadata = {
 title: 'Création de site internet à Strasbourg | SEOKRAFT',
 description: 'Création de site internet sur mesure à Strasbourg et en Alsace : site vitrine, refonte, mobile et SEO. Dès 1 990 € TTC, livré en 2 semaines.',
 alternates: { canonical: '/creation-site-internet/strasbourg' },
 openGraph: { images: [{ url: '/opengraph-image.jpg', width: 1200, height: 630, alt: 'SEOKRAFT, studio web à Strasbourg' }], 
  type: 'website', locale: 'fr_FR', siteName: 'SEOKRAFT',
  url: 'https://www.seokraft.fr/creation-site-internet/strasbourg',
  title: 'Création de site internet à Strasbourg | SEOKRAFT',
  description: 'Un site internet professionnel et sur mesure pour les entreprises, indépendants et associations de Strasbourg et d’Alsace.'
 }
};


const faqs: [string, string][] = [
 ['Faut-il être à Strasbourg pour travailler avec vous ?', 'Non. La majorité des échanges se fait en visio, par téléphone et par e-mail, ce qui permet d’accompagner des clients partout en France et en Belgique. Pour les entreprises de Strasbourg et des environs, un déplacement est possible pour se rencontrer.'],
 ['Combien coûte la création d’un site internet ?', 'Un site sur mesure démarre à 1 990 € TTC pour une page, et le tarif évolue selon le nombre de pages : vous pouvez l’estimer avec le simulateur ci-dessus. Les fonctionnalités spécifiques (réservation, espace client, blog…) sont chiffrées sur devis. L’hébergement et la maintenance représentent 49 € TTC par mois.'],
 ['Combien de temps faut-il pour créer un site ?', 'Votre site est livré en 2 semaines à compter de la réception de vos contenus (textes, photos, logo). Ce délai rapide est possible parce que vous échangez directement avec la personne qui conçoit et développe votre site.'],
 ['Quand pouvez-vous démarrer mon projet ?', 'Immédiatement. Le projet démarre dès la signature du devis et le versement de l’acompte, sans liste d’attente.'],
 ['Faut-il verser un acompte ?', 'Oui. Un acompte de 50 % est demandé à la signature du devis, ce qui permet de démarrer votre projet immédiatement. Le solde est réglé une fois votre site terminé et validé par vous, avant sa mise en ligne.'],
 ['Combien de retouches sont incluses ?', 'Les retouches sont illimitées jusqu’à votre entière satisfaction, dans le cadre du périmètre défini au devis (pages et fonctionnalités prévues). Les ajouts hors devis, comme une nouvelle page ou une nouvelle fonctionnalité, font l’objet d’un complément.'],
 ['Serai-je propriétaire de mon site ?', 'Oui. Votre nom de domaine est enregistré à votre nom dès le départ. Pendant le contrat d’hébergement et de maintenance, SEOKRAFT héberge et gère votre site. À la fin du contrat, vous récupérez gratuitement l’intégralité de votre site, de vos fichiers et de vos accès : tout vous appartient.'],
 ['Pouvez-vous refaire mon site existant ? Combien coûte une refonte ?', 'Oui. Une refonte suit la même grille tarifaire que la création, à partir de 1 990 € TTC selon le nombre de pages. Elle modernise votre image, clarifie la navigation et préserve votre référencement grâce aux redirections des anciennes pages.'],
 ['Créez-vous des sites e-commerce ?', 'Oui. Les boutiques en ligne sont réalisées sur devis, car leur coût dépend du nombre de produits, des moyens de paiement et des fonctionnalités nécessaires.'],
 ['Y a-t-il des frais cachés ?', 'Non. Le devis indique le prix de création, et l’hébergement et la maintenance représentent 49 € TTC par mois, avec un engagement initial de 12 mois. Seul le nom de domaine est acheté directement par vous, à votre nom : comptez en général une dizaine d’euros par an.'],
 ['En combien de temps répondez-vous ?', 'Sous 24 heures. Vous pouvez aussi réserver directement un appel gratuit de 20 minutes.'],
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

  <ProblemSection/>

  <WorkTeaser/>
  <Testimonials/>
  <PricingTeaser/>

  <section className="seo-scene" id="zone"><div className="seo-scene-inner"><span className="eyebrow light">ZONE D’INTERVENTION</span><h2>Strasbourg, l’Eurométropole<br/><em>et toute l’Alsace.</em></h2><p>J’accompagne les entreprises et associations de Strasbourg, Schiltigheim, Illkirch-Graffenstaden, Lingolsheim, Bischheim, Hœnheim, Ostwald, Eckbolsheim et Vendenheim, mais aussi de Haguenau, Molsheim, Obernai, Sélestat et Saverne. Grâce au travail à distance, je réalise aussi des sites pour des clients partout en France et en Belgique.</p><a href="/rendez-vous" className="seo-link">Réserver un appel gratuit de 20 minutes <ArrowUpRight size={18}/></a></div></section>

  <section className="expertise-section" id="guides"><div className="expertise-heading"><span className="eyebrow">GUIDES UTILES</span><h2>Préparer votre projet.<br/><em>En toute clarté.</em></h2><p>Prix, préparation, type de site, choix du prestataire : des réponses concrètes aux questions que vous vous posez avant de créer votre site.</p><a className="expertise-heading-link" href="/blog">Voir tous les articles <ArrowUpRight size={17}/></a></div><div className="expertise-lines">{guides.map(([href, t, d]) => <a href={href} className="expertise-item" key={href}><span>{t}</span><p>{d}</p><ArrowUpRight aria-hidden="true"/></a>)}</div></section>

  <FaqSection items={faqs}/>
  <Contact/>
 </main><SiteFooter/></>;
}
