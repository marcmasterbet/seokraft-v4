import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import SiteHeader from '../../../components/SiteHeader';
import Testimonials from '../../../components/Testimonials';
import SiteFooter from '../../../components/SiteFooter';

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

const audiences = [
 ['Artisans et commerçants', 'Présenter vos services, vos réalisations et vos horaires, et recevoir des demandes de devis directement depuis votre site.'],
 ['Indépendants et professions libérales', 'Inspirer confiance dès la première visite, expliquer clairement votre accompagnement et faciliter la prise de rendez-vous.'],
 ['Associations', 'Présenter votre association, valoriser vos membres et publier vos actualités, avec un site capable d’évoluer avec vous.'],
 ['TPE et PME', 'Moderniser votre image, structurer une offre plus large et développer des fonctionnalités adaptées à votre métier.']
];

const included = ['Réflexion sur la structure du site', 'Design sur mesure, fidèle à votre image', 'Version mobile et tablette soignée', 'Copywriting professionnel orienté conversion', 'Bases du référencement SEO', 'Formulaire de contact', 'Mise en ligne', 'Accompagnement avant et après le lancement'];

const steps = [
 ['01', 'Échanger', 'Un premier appel gratuit de 20 minutes, en visio ou par téléphone, pour comprendre votre activité, vos objectifs et vos priorités. Si vous êtes à Strasbourg ou dans les environs, je peux aussi me déplacer pour vous rencontrer.'],
 ['02', 'Concevoir', 'Je propose une structure et un design pensés pour votre activité et vos futurs clients. Vous suivez l’avancement à chaque étape.'],
 ['03', 'Valider', 'Nous ajustons ensemble les textes, la présentation et les fonctionnalités avant la mise en ligne.'],
 ['04', 'Lancer et suivre', 'Votre site est mis en ligne, hébergé et maintenu. Je reste votre interlocuteur direct pour la suite.']
];

const towns = ['Strasbourg', 'Schiltigheim', 'Illkirch-Graffenstaden', 'Lingolsheim', 'Bischheim', 'Hœnheim', 'Ostwald', 'Eckbolsheim', 'Vendenheim', 'Haguenau', 'Molsheim', 'Obernai', 'Sélestat', 'Saverne'];

const faqs = [
 ['Faut-il être à Strasbourg pour travailler avec vous ?', 'Non. La majorité des échanges se fait en visio, par téléphone et par e-mail, ce qui permet d’accompagner des clients partout en France et en Belgique. Pour les entreprises de Strasbourg et des environs, un déplacement est possible pour se rencontrer.'],
 ['Combien coûte la création d’un site internet ?', 'Un site sur mesure démarre à 1 990 € TTC pour une page, et le tarif évolue selon le nombre de pages : par exemple 2 990 € TTC pour 4 pages. Les fonctionnalités spécifiques (réservation, espace client, blog…) sont chiffrées sur devis. L’hébergement et la maintenance représentent 49 € TTC par mois.'],
 ['Combien de temps faut-il pour créer un site ?', 'Le délai dépend du nombre de pages, des fonctionnalités et de la disponibilité de vos contenus. Il est précisé dans le devis, avant le démarrage du projet.'],
 ['Pouvez-vous refaire mon site existant ?', 'Oui. Une refonte permet de moderniser votre image, de clarifier la navigation et d’améliorer les bases de votre référencement, en conservant ce qui fonctionne déjà.'],
 ['Mon site sera-t-il visible sur Google à Strasbourg ?', 'Chaque site est construit avec des fondations SEO solides : structure, balises, contenus et performances. Le référencement demande toutefois du temps, et aucun positionnement ne peut être garanti. Un accompagnement SEO dédié est possible si vous souhaitez aller plus loin.'],
 ['Qui sera mon interlocuteur ?', 'Moi, Marc Bretzner. Vous échangez directement avec la personne qui conçoit et développe votre site, du premier appel jusqu’au suivi après la mise en ligne.']
];

export default function CreationSiteStrasbourg() {
 return <><SiteHeader/><main className="lp">
  <section className="lp-hero">
   <span className="eyebrow"><span className="eyebrow-dot"/>CRÉATION DE SITE INTERNET · STRASBOURG · ALSACE</span>
   <h1>Création de site internet <em>à Strasbourg</em><span className="olive-dot">.</span></h1>
   <p className="lp-lead">Vous êtes artisan, indépendant, association ou dirigeant de TPE à Strasbourg ou en Alsace ? SEOKRAFT conçoit des sites internet professionnels et sur mesure, qui présentent clairement votre activité, inspirent confiance et donnent envie à vos futurs clients de vous contacter.</p>
   <div className="hero-actions"><Link className="button button-olive" href="/#contact">Parlons de votre projet <ArrowUpRight size={17}/></Link><Link className="hero-call-button" href="/rendez-vous">Réserver un appel gratuit <ArrowUpRight size={17}/></Link></div>
  </section>

  <section className="lp-block lp-split">
   <div><span className="eyebrow">POUR QUI ?</span><h2>Un site pensé pour <em>votre métier.</em></h2><p>Chaque activité a ses propres clients, ses propres questions et ses propres objectifs. Votre site doit y répondre simplement, sans complexité inutile.</p></div>
   <div className="lp-cards">{audiences.map(([t, d]) => <article key={t}><h3>{t}</h3><p>{d}</p></article>)}</div>
  </section>

  <section className="lp-block lp-dark">
   <span className="eyebrow light">INCLUS DANS CHAQUE CRÉATION</span>
   <h2>De l’idée à la mise en ligne,<br/><em>tout est compris.</em></h2>
   <ul className="lp-included">{included.map(i => <li key={i}>{i}</li>)}</ul>
  </section>

  <section className="lp-block">
   <span className="eyebrow">COMMENT ÇA SE PASSE</span>
   <h2>Un accompagnement simple,<br/><em>à distance ou sur place.</em></h2>
   <ol className="lp-steps">{steps.map(([n, t, d]) => <li key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p></li>)}</ol>
  </section>

  <section className="lp-block lp-work">
   <div className="section-head"><div><span className="eyebrow">RÉALISATIONS</span><h2>Des projets concrets.<br/><em>Une même exigence.</em></h2></div><p>Du site vitrine technologique à la plateforme web, chaque projet est conçu autour des objectifs du client.</p></div>
   <div className="lp-projects">
    <a href="https://remussystems.fr" target="_blank" rel="noopener noreferrer"><Image src="/images/projet-remus-systems.webp" alt="Site internet Remus Systems réalisé par SEOKRAFT" width={1908} height={886} sizes="(max-width: 800px) 100vw, 50vw"/><span className="eyebrow">SITE VITRINE SUR MESURE</span><h3>Remus Systems <ArrowUpRight size={18}/></h3></a>
    <a href="https://www.loca-direct.fr" target="_blank" rel="noopener noreferrer"><Image src="/images/projet-loca-direct.webp" alt="Plateforme web Loca Direct réalisée par SEOKRAFT" width={1908} height={520} sizes="(max-width: 800px) 100vw, 50vw"/><span className="eyebrow">PLATEFORME WEB</span><h3>Loca Direct <ArrowUpRight size={18}/></h3></a>
   </div>
  </section>

  <Testimonials/>

  <section className="lp-block lp-split">
   <div><span className="eyebrow">TARIFS</span><h2>Un budget clair,<br/><em>dès le départ.</em></h2><p>Le prix dépend du nombre de pages et des fonctionnalités. Le devis confirme le périmètre et le tarif définitif avant tout engagement.</p><Link className="text-link" href="/#tarifs">Estimer mon site avec le simulateur <ArrowUpRight size={17}/></Link><p className="lp-guide">À lire : <Link href="/blog/prix-site-internet">combien coûte un site internet en 2026 ?</Link></p></div>
   <div className="lp-prices">
    <div><span>Site une page</span><strong>1 990 € <small>TTC</small></strong></div>
    <div><span>Site vitrine 4 pages</span><strong>2 990 € <small>TTC</small></strong></div>
    <div><span>Site vitrine 8 pages</span><strong>4 190 € <small>TTC</small></strong></div>
    <div><span>Hébergement et maintenance</span><strong>49 € <small>TTC / mois</small></strong></div>
    <p>Fonctionnalités spécifiques (réservation, espace client, blog) sur devis. Engagement initial de 12 mois pour l’hébergement et la maintenance.</p>
   </div>
  </section>

  <section className="lp-block lp-zone">
   <span className="eyebrow">ZONE D’INTERVENTION</span>
   <h2>Strasbourg, l’Eurométropole<br/><em>et toute l’Alsace.</em></h2>
   <p>J’accompagne les entreprises et associations de Strasbourg et de ses environs, avec la possibilité de me déplacer pour un rendez-vous. Grâce au travail à distance, je réalise aussi des sites pour des clients partout en France et en Belgique.</p>
   <ul className="lp-towns">{towns.map(t => <li key={t}>{t}</li>)}</ul>
  </section>

  <section className="lp-block lp-faq">
   <div><span className="eyebrow">QUESTIONS FRÉQUENTES</span><h2>Créer votre site<br/><em>en toute clarté.</em></h2></div>
   <div>{faqs.map(([q, a], i) => <details key={q} open={i === 0}><summary>{q}</summary><p>{a}</p></details>)}</div>
  </section>

  <section className="lp-block lp-guides">
   <span className="eyebrow">GUIDES UTILES</span>
   <h2>Préparer votre projet<br/><em>en toute sérénité.</em></h2>
   <ul>
    <li><Link href="/blog/prix-site-internet">Combien coûte un site internet en 2026 ? <ArrowUpRight size={16}/></Link></li>
    <li><Link href="/blog/preparer-creation-site-internet">Que préparer avant de créer son site internet ? <ArrowUpRight size={16}/></Link></li>
    <li><Link href="/blog/site-vitrine-ou-e-commerce">Site vitrine ou site e-commerce : que choisir ? <ArrowUpRight size={16}/></Link></li>
    <li><Link href="/blog/choisir-createur-site-internet-strasbourg">Comment choisir son créateur de site internet à Strasbourg ? <ArrowUpRight size={16}/></Link></li>
   </ul>
  </section>

  <section className="lp-block lp-cta">
   <span className="eyebrow light">PARLONS DE VOTRE PROJET</span>
   <h2>Votre futur site commence<br/><em>par une conversation.</em></h2>
   <p>Présentez-moi votre activité et vos besoins : nous verrons ensemble quelle solution vous correspond.</p>
   <div className="hero-actions"><Link className="button lp-button-light" href="/#contact">Décrire mon projet <ArrowUpRight size={17}/></Link><Link className="lp-cta-call" href="/rendez-vous">Réserver un appel gratuit de 20 minutes <ArrowUpRight size={17}/></Link></div>
  </section>
 </main><SiteFooter/></>;
}
