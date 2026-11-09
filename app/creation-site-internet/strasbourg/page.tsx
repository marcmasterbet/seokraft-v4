import type { Metadata } from 'next';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import SiteHeader from '../../../components/SiteHeader';
import SiteFooter from '../../../components/SiteFooter';
import Testimonials from '../../../components/Testimonials';
import { FaqSection, Contact } from '../../../components/Home';
import { realisations } from '../../../components/homeContent';

/* Page locale « création de site internet Strasbourg » — version SEO (9 novembre 2026).
   Mot-clé principal : création de site internet Strasbourg.
   Secondaires : site internet professionnel Strasbourg, site vitrine Strasbourg,
   refonte site internet Strasbourg, créateur de site internet, agence web Strasbourg. */

const PAGE_URL = 'https://www.seokraft.fr/creation-site-internet/strasbourg';
const TITLE = 'Création de site internet Strasbourg : livré en 2 semaines';
const DESCRIPTION = 'Découvrez la création de site internet à Strasbourg avec un expert indépendant : site sur mesure dès 1 990 € TTC, livré en 2 semaines, prêt pour Google.';

export const metadata: Metadata = {
 title: { absolute: TITLE },
 description: DESCRIPTION,
 alternates: { canonical: '/creation-site-internet/strasbourg' },
 robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
 openGraph: {
  images: [{ url: '/opengraph-image.jpg', width: 1200, height: 630, alt: 'Création de site internet à Strasbourg avec SEOKRAFT' }],
  type: 'website', locale: 'fr_FR', siteName: 'SEOKRAFT', url: PAGE_URL,
  title: 'Création de site internet à Strasbourg | SEOKRAFT',
  description: 'Un site internet professionnel et sur mesure pour les artisans, indépendants, associations et TPE de Strasbourg et d’Alsace. Dès 1 990 € TTC, livré en 2 semaines.'
 },
 twitter: { card: 'summary_large_image', title: 'Création de site internet à Strasbourg | SEOKRAFT', description: DESCRIPTION, images: ['/opengraph-image.jpg'] }
};

const facts = [
 'Site sur mesure dès 1 990 € TTC',
 'Mini-audit de votre site actuel avant de commencer',
 'Un questionnaire de projet pour comprendre vos attentes et vos objectifs',
 'Livré en 2 semaines après réception de vos contenus',
 'Un seul interlocuteur, du premier appel au suivi',
 'Nom de domaine à votre nom, site qui vous appartient'
];

const types: { id: string; title: string; text: React.ReactNode; href: string; link: string }[] = [
 { id: 'site-vitrine', title: 'Site vitrine', href: '/blog/site-vitrine-ou-e-commerce', link: 'Site vitrine ou e-commerce ?',
  text: <>Un <strong>site vitrine à Strasbourg</strong> présente votre entreprise, vos prestations, vos réalisations et vos coordonnées. C’est le format le plus demandé par les artisans et les TPE : quelques pages claires, un téléphone cliquable, un formulaire de contact.</> },
 { id: 'independant', title: 'Site pour indépendant ou profession libérale', href: '/tarifs', link: 'Estimer le prix',
  text: <>Une ou deux pages suffisent souvent. Elles expliquent en quelques secondes ce que vous faites, pour qui, et comment vous joindre.</> },
 { id: 'refonte', title: 'Refonte de site internet', href: '/blog/refonte-site-internet', link: 'Réussir sa refonte',
  text: <>Votre site a vieilli ou ne reflète plus votre entreprise ? La <strong>refonte de site internet à Strasbourg</strong> suit la même grille de prix que la création. Je redirige les anciennes pages vers les nouvelles pour ne pas perdre votre référencement.</> },
 { id: 'sur-mesure', title: 'Site avec fonctionnalités sur mesure', href: '/contact', link: 'Présenter mon projet',
  text: <>Prise de rendez-vous, paiement en ligne, espace client, boutique : je développe ce dont votre activité a besoin, chiffré sur devis.</> },
 { id: 'referencement-local', title: 'Site pensé pour le référencement local', href: '/seo/strasbourg', link: 'Référencement SEO à Strasbourg',
  text: <>Chaque site est construit pour être compris par Google et par les IA comme ChatGPT : structure, balises, vitesse, contenus qui citent votre ville. Pour aller plus loin, je propose un accompagnement en référencement à Strasbourg.</> }
];

const prices: [string, string, string][] = [
 ['Site sur mesure, 1 page', 'Dès 1 990 € TTC', '2 semaines après réception des contenus'],
 ['Pages supplémentaires', 'Selon le simulateur', '2 semaines après réception des contenus'],
 ['Refonte de site', 'Même grille, dès 1 990 € TTC', '2 semaines après réception des contenus'],
 ['Optimisation SEO éditoriale', '150 € TTC par page', 'Pendant la création'],
 ['Réservation, espace client, blog, boutique', 'Sur devis', 'Selon le projet'],
 ['Hébergement et maintenance', '49 € TTC par mois, 12 mois puis sans engagement', 'À la mise en ligne'],
 ['Nom de domaine, à votre nom', 'Une dizaine d’euros par an', 'À la mise en ligne']
];

const steps: [string, string][] = [
 ['Le mini-audit de votre site', 'J’analyse votre site actuel : clarté de l’offre, affichage sur mobile, visibilité sur Google, mentions légales. Vous recevez la liste des points à corriger en priorité. Pas encore de site ? J’étudie vos concurrents à Strasbourg.'],
 ['Un appel de 20 minutes', 'On parcourt le mini-audit ensemble, puis vous me présentez votre activité, vos clients et vos objectifs.'],
 ['Le questionnaire de projet et le devis', 'Vous remplissez un questionnaire en ligne sur vos prestations, vos clients, les pages souhaitées et les sites que vous aimez. Il me permet de bien comprendre votre projet, vos attentes et vos objectifs. Le projet démarre à la signature du devis, avec un acompte de 50 %.'],
 ['La conception', 'Vous m’envoyez vos photos et votre logo, et je livre le site en 2 semaines. Les retouches sont illimitées dans le périmètre du devis.'],
 ['La mise en ligne', 'Vous validez, vous réglez le solde, le site est en ligne. Je reste votre contact pour le suivi.']
];

const guides = [
 ['/blog/prix-site-internet', 'Combien coûte un site internet ?', 'Les fourchettes de prix, les coûts annuels et les pièges à éviter.'],
 ['/blog/preparer-creation-site-internet', 'Préparer son projet', 'La check-list à remplir avant de demander un devis.'],
 ['/blog/site-vitrine-ou-e-commerce', 'Site vitrine ou e-commerce ?', 'Choisir le bon type de site selon votre activité.'],
 ['/blog/choisir-createur-site-internet-strasbourg', 'Choisir son créateur de site', 'Les critères et les questions à poser avant de vous engager.']
];

/* FAQ : les questions les plus recherchées d’abord. Chaque réponse commence par la réponse directe. */
const faqs: [string, string][] = [
 ['Combien coûte la création d’un site internet à Strasbourg ?', 'Un site sur mesure démarre à 1 990 € TTC pour une page, et le tarif évolue selon le nombre de pages : vous pouvez l’estimer avec le simulateur de la page Tarifs. Les fonctionnalités spécifiques (réservation, espace client, blog…) sont chiffrées sur devis. L’hébergement et la maintenance représentent 49 € TTC par mois.'],
 ['Combien de temps faut-il pour créer un site ?', 'Votre site est livré en 2 semaines à compter de la réception de vos contenus (photos, logo). Ce délai rapide est possible parce que vous échangez directement avec la personne qui conçoit et développe votre site.'],
 ['Mon site sera-t-il visible sur Google à Strasbourg ?', 'Chaque site est construit avec des fondations SEO solides : structure, balises, contenus et performances. Le référencement demande toutefois du temps, et aucun positionnement ne peut être garanti. Un accompagnement SEO dédié est possible si vous souhaitez aller plus loin.'],
 ['Pouvez-vous refaire mon site existant ? Combien coûte une refonte ?', 'Oui. Une refonte suit la même grille tarifaire que la création, à partir de 1 990 € TTC selon le nombre de pages. Elle modernise votre image, clarifie la navigation et préserve votre référencement grâce aux redirections des anciennes pages.'],
 ['Quelle différence entre un site vitrine et un site e-commerce ?', 'Un site vitrine présente votre activité et vous apporte des demandes de contact, un site e-commerce vend directement en ligne. Le site vitrine démarre à 1 990 € TTC ; une boutique est chiffrée sur devis selon le nombre de produits et les moyens de paiement.'],
 ['Pourquoi choisir un créateur indépendant plutôt qu’une agence web ?', 'Avec un indépendant, vous parlez directement à la personne qui conçoit et développe votre site. Pas d’intermédiaire ni de chef de projet : les décisions vont plus vite, ce qui permet de livrer en 2 semaines. Pour les gros projets qui demandent une équipe, une agence peut rester le bon choix.'],
 ['Créez-vous des sites e-commerce ?', 'Oui. Les boutiques en ligne sont réalisées sur devis, car leur coût dépend du nombre de produits, des moyens de paiement et des fonctionnalités nécessaires.'],
 ['Y a-t-il des frais cachés ?', 'Non. Le devis indique le prix de création, et l’hébergement et la maintenance représentent 49 € TTC par mois, avec un engagement initial de 12 mois. Seul le nom de domaine est acheté directement par vous, à votre nom : comptez en général une dizaine d’euros par an.'],
 ['Serai-je propriétaire de mon site ?', 'Oui. Votre nom de domaine est enregistré à votre nom dès le départ. Pendant le contrat d’hébergement et de maintenance, SEOKRAFT héberge et gère votre site. À la fin du contrat, vous récupérez gratuitement l’intégralité de votre site, de vos fichiers et de vos accès : tout vous appartient.'],
 ['Faut-il verser un acompte ?', 'Oui. Un acompte de 50 % est demandé à la signature du devis, ce qui permet de démarrer votre projet immédiatement. Le solde est réglé une fois votre site terminé et validé par vous, avant sa mise en ligne.'],
 ['Combien de retouches sont incluses ?', 'Les retouches sont illimitées jusqu’à votre entière satisfaction, dans le cadre du périmètre défini au devis (pages et fonctionnalités prévues). Les ajouts hors devis, comme une nouvelle page ou une nouvelle fonctionnalité, font l’objet d’un complément.'],
 ['Quand pouvez-vous démarrer mon projet ?', 'Immédiatement. Le projet démarre dès la signature du devis et le versement de l’acompte, sans liste d’attente.'],
 ['Faut-il être à Strasbourg pour travailler avec vous ?', 'Non. La majorité des échanges se fait en visio, par téléphone et par e-mail, ce qui permet d’accompagner des clients partout en France et en Belgique. Pour les entreprises de Strasbourg et des environs, un déplacement est possible pour se rencontrer.'],
 ['Qui sera mon interlocuteur ?', 'Moi, Marc Bretzner. Vous échangez directement avec la personne qui conçoit et développe votre site, du premier appel jusqu’au suivi après la mise en ligne.'],
 ['En combien de temps répondez-vous ?', 'Sous 24 heures. Vous pouvez aussi réserver directement un appel gratuit de 20 minutes.']
];

const cities = ['Strasbourg', 'Schiltigheim', 'Illkirch-Graffenstaden', 'Lingolsheim', 'Bischheim', 'Hœnheim', 'Ostwald', 'Eckbolsheim', 'Vendenheim', 'Haguenau', 'Molsheim', 'Obernai', 'Sélestat', 'Saverne'];

/* Données structurées : fil d’Ariane, page, service avec prix de départ (rattaché à l’entreprise déclarée dans le layout). */
const schema = {
 '@context': 'https://schema.org',
 '@graph': [
  {
   '@type': 'BreadcrumbList',
   '@id': PAGE_URL + '#breadcrumb',
   itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://www.seokraft.fr/' },
    { '@type': 'ListItem', position: 2, name: 'Création de site internet à Strasbourg', item: PAGE_URL }
   ]
  },
  {
   '@type': 'WebPage',
   '@id': PAGE_URL + '#webpage',
   url: PAGE_URL,
   name: TITLE,
   description: DESCRIPTION,
   inLanguage: 'fr-FR',
   isPartOf: { '@type': 'WebSite', '@id': 'https://www.seokraft.fr/#website', url: 'https://www.seokraft.fr', name: 'SEOKRAFT' },
   about: { '@id': PAGE_URL + '#service' },
   breadcrumb: { '@id': PAGE_URL + '#breadcrumb' },
   primaryImageOfPage: { '@type': 'ImageObject', url: 'https://www.seokraft.fr/images/marc-accueil.webp' }
  },
  {
   '@type': 'Service',
   '@id': PAGE_URL + '#service',
   name: 'Création de site internet à Strasbourg',
   serviceType: 'Création de site internet',
   description: 'Création et refonte de sites internet sur mesure pour les artisans, indépendants, associations et TPE de Strasbourg et d’Alsace, livrés en 2 semaines.',
   provider: { '@id': 'https://www.seokraft.fr/#business' },
   areaServed: cities.map(name => ({ '@type': 'City', name })),
   offers: [
    { '@type': 'Offer', name: 'Site internet sur mesure', price: '1990', priceCurrency: 'EUR', description: 'À partir de 1 990 € TTC pour une page, livré en 2 semaines après réception des contenus.', url: 'https://www.seokraft.fr/tarifs' },
    { '@type': 'Offer', name: 'Hébergement et maintenance', price: '49', priceCurrency: 'EUR', description: '49 € TTC par mois, engagement initial de 12 mois.', url: 'https://www.seokraft.fr/tarifs' }
   ]
  }
 ]
};

export default function CreationSiteStrasbourg() {
 return <><SiteHeader/><main>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(schema)}}/>

  <section className="hero" id="accueil">
   <nav aria-label="Fil d’Ariane" className="cs-breadcrumb"><ol><li><a href="/">Accueil</a></li><li aria-current="page">Création de site internet à Strasbourg</li></ol></nav>
   <div className="hero-top"><span className="eyebrow"><span className="eyebrow-dot"/> CRÉATION DE SITE INTERNET · STRASBOURG · ALSACE</span><span className="hero-aside">SITE VITRINE · REFONTE<br/>SITE SUR MESURE</span></div>
   <div className="hero-layout"><div className="hero-copy">
    <h1>Création de site internet <em>à Strasbourg</em><span className="olive-dot">.</span></h1>
    <p className="hero-question">Un site pensé pour vous apporter des clients, livré en 2 semaines.</p>
    <p>La <strong>création de site internet à Strasbourg</strong>, c’est mon métier. Je conçois des sites professionnels, modernes et sur mesure pour les artisans, indépendants, associations et TPE de Strasbourg et d’Alsace. Des sites qui présentent clairement votre activité et donnent envie à vos futurs clients de vous contacter.</p>
    <ul className="cs-facts" aria-label="En bref">{facts.map(f => <li key={f}>{f}</li>)}</ul>
    <div className="hero-actions"><a className="button button-olive" href="#contact">Parlons de votre projet <ArrowUpRight size={17}/></a><a className="hero-call-button" href="/rendez-vous">Réserver un appel gratuit de 20 minutes <ArrowUpRight size={17}/></a></div>
   </div><div className="hero-visual"><div className="hero-photo"><Image src="/images/marc-accueil.webp" alt="Création de site internet à Strasbourg avec Marc Bretzner, fondateur de SEOKRAFT" fill priority sizes="(max-width: 800px) 90vw, 45vw" style={{objectFit:'cover',objectPosition:'center 30%'}}/></div><a className="hero-project-link" href="#realisations">Voir mes réalisations <ArrowUpRight size={18}/></a></div></div>
   <a href="#besoins" className="scroll-cue">DÉCOUVRIR MON APPROCHE <span>↓</span></a>
  </section>

  <section className="intro-scene problem-scene" id="besoins">
   <span className="eyebrow light">UN SITE UTILE À VOTRE ACTIVITÉ</span>
   <h2>Un site internet professionnel à Strasbourg :<br/><em>combien de visiteurs repartent sans vous contacter ?</em></h2>
   <p>Un prospect cherche un professionnel comme vous. Il découvre votre entreprise, consulte vos prestations et commence à comparer.</p>
   <p>Mais votre offre manque de clarté. Certaines informations sont difficiles à trouver. Sur smartphone, la navigation lui demande trop d’efforts. Il hésite, puis il poursuit ses recherches ailleurs.</p>
   <p className="accent-line">Vous voyez les demandes que votre site génère. Pas toutes les opportunités qu’il vous fait manquer.</p>
   <p>C’est pourquoi je ne commence pas par choisir un design. Je cherche d’abord à comprendre votre activité, les attentes de vos clients et ce que vous voulez qu’ils fassent.</p>
   <p className="accent-line">L’objectif : un parcours simple, de la découverte de votre offre jusqu’à la prise de contact.</p>
  </section>

  <section className="expertise-section" id="types-de-sites">
   <div className="expertise-heading"><span className="eyebrow">LES TYPES DE SITES</span><h2>Quel site créer pour votre entreprise à Strasbourg ?<br/><em>Celui qui sert votre activité.</em></h2><p>Site vitrine, refonte, fonctionnalités sur mesure : chaque projet appelle une réponse différente, sans complexité inutile.</p><a className="expertise-heading-link" href="#tarifs">Voir les prix <ArrowUpRight size={17}/></a></div>
   <div className="expertise-lines">{types.map(t => <div className="cs-type" id={t.id} key={t.id}><h3>{t.title}</h3><p>{t.text}</p><a href={t.href}>{t.link} <ArrowUpRight size={15} aria-hidden="true"/></a></div>)}</div>
  </section>

  <section className="work-section home-teaser" id="realisations">
   <div className="section-head"><div><span className="eyebrow">{realisations.eyebrow}</span><h2>Création de sites internet :<br/><em>regardez ce que j’ai déjà réalisé.</em></h2></div><div className="section-head-copy"><p>{realisations.paragraphs[0]}</p></div></div>
   <div className="teaser-projects">{realisations.projects.map(p => <a href={p.url} target="_blank" rel="noopener noreferrer" className="teaser-project" key={p.kind}><span className="teaser-project-image"><Image src={p.kind === 'remus' ? '/images/projet-remus-systems.webp' : '/images/projet-loca-direct.webp'} alt={`Site internet ${p.name} réalisé par SEOKRAFT`} width={1908} height={886} sizes="(max-width: 800px) 100vw, 45vw"/></span><span className="eyebrow">{p.tag}</span><strong>{p.name} <ArrowUpRight size={18}/></strong></a>)}</div>
   <a href="/realisations" className="button button-olive teaser-button">Voir les réalisations en détail <ArrowUpRight size={17}/></a>
  </section>

  <Testimonials/>

  <section className="prices-section cs-prices" id="tarifs" aria-labelledby="cs-tarifs-titre">
   <span className="eyebrow">TARIFS</span>
   <h2 id="cs-tarifs-titre">Prix d’un site internet à Strasbourg :<br/><em>une estimation claire avant tout devis.</em></h2>
   <p>Le prix dépend du nombre de pages, des fonctionnalités et de la complexité du projet. Voici les tarifs de base.</p>
   <div className="cs-table-wrap"><table className="cs-table"><caption className="sr-only">Prix et délais de création de site internet à Strasbourg</caption><thead><tr><th scope="col">Prestation</th><th scope="col">Prix</th><th scope="col">Délai</th></tr></thead><tbody>{prices.map(([a, b, c]) => <tr key={a}><th scope="row">{a}</th><td>{b}</td><td>{c}</td></tr>)}</tbody></table></div>
   <a href="/tarifs" className="button button-olive teaser-button">Estimer le prix de mon site <ArrowUpRight size={17}/></a>
  </section>

  <section className="cs-steps-section" id="deroulement">
   <span className="eyebrow">LE DÉROULEMENT</span>
   <h2>Comment se passe la création de votre site ?<br/><em>Cinq étapes, un seul interlocuteur.</em></h2>
   <ol className="cs-steps">{steps.map(([t, d]) => <li key={t}><h3>{t}</h3><p>{d}</p></li>)}</ol>
   <a href="/rendez-vous" className="hero-call-button">Commencer par un appel de 20 minutes <ArrowUpRight size={17}/></a>
  </section>

  <section className="seo-scene" id="zone"><div className="seo-scene-inner">
   <span className="eyebrow light">ZONE D’INTERVENTION</span>
   <h2>Création de site internet à Strasbourg,<br/><em>dans l’Eurométropole et toute l’Alsace.</em></h2>
   <p>J’accompagne les entreprises et associations de Strasbourg, Schiltigheim, Illkirch-Graffenstaden, Lingolsheim, Bischheim, Hœnheim, Ostwald, Eckbolsheim et Vendenheim, mais aussi de Haguenau, Molsheim, Obernai, Sélestat et Saverne. Je travaille aussi à distance pour des clients partout en France et en Belgique.</p>
   <p>Vous cherchez une <strong>agence web à Strasbourg</strong> ? Avec un <strong>créateur de site internet indépendant</strong>, vous parlez directement à la personne qui conçoit et développe votre site. C’est ce qui permet de livrer en 2 semaines.</p>
   <a href="/rendez-vous" className="seo-link">Réserver un appel gratuit de 20 minutes <ArrowUpRight size={18}/></a>
  </div></section>

  <section className="expertise-section" id="guides"><div className="expertise-heading"><span className="eyebrow">GUIDES UTILES</span><h2>Préparer votre projet.<br/><em>En toute clarté.</em></h2><p>Prix, préparation, type de site, choix du prestataire : des réponses concrètes aux questions que vous vous posez avant de créer votre site.</p><a className="expertise-heading-link" href="/blog">Voir tous les articles <ArrowUpRight size={17}/></a></div><div className="expertise-lines">{guides.map(([href, t, d]) => <a href={href} className="expertise-item" key={href}><span>{t}</span><p>{d}</p><ArrowUpRight aria-hidden="true"/></a>)}</div></section>

  <FaqSection items={faqs} eyebrow="QUESTIONS FRÉQUENTES" title={['Vos questions sur la création de site internet. ', 'C’est normal d’en avoir.']}/>

  <p className="cs-closing">Racontez-moi votre projet de <strong>création de site internet à Strasbourg</strong> : je vous réponds sous 24 heures.</p>
  <Contact/>
 </main><SiteFooter/></>;
}
