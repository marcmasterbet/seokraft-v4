import type { Metadata } from 'next';
import { ArrowUpRight } from 'lucide-react';
import SiteHeader from '../../components/SiteHeader';
import SiteFooter from '../../components/SiteFooter';

const description = 'Les services de SEOKRAFT à Strasbourg : création de site internet, refonte de site et référencement local. Textes et SEO inclus, tarif annoncé avant de commencer.';
export const metadata: Metadata = {
 title: 'Services : création, refonte et référencement de site internet | SEOKRAFT',
 description,
 alternates: { canonical: '/services' },
 openGraph: { images: [{ url: '/opengraph-image.jpg', width: 1200, height: 630, alt: 'SEOKRAFT, création de sites internet à Strasbourg' }], title: 'Services | SEOKRAFT', description, url: 'https://www.seokraft.fr/services' }
};

const services = [
 { id: 'creation', title: 'Création de site internet', lead: 'Vous lancez votre activité ou vous n’avez pas encore de vrai site.',
   text: 'Je crée un site sur mesure qui explique clairement ce que vous faites, rassure vos visiteurs et leur donne envie de vous contacter.',
   points: [['Design sur mesure', 'Une mise en page à votre image, pensée d’abord pour le téléphone.'], ['Textes écrits pour vous', 'Des textes qui parlent à vos clients et les poussent à vous contacter.'], ['Référencement inclus', 'Les bases techniques et éditoriales pour être trouvé sur Google.']],
   price: '1 690 € TTC la première page, puis 500 € TTC par page supplémentaire.' },
 { id: 'refonte', title: 'Refonte de site', lead: 'Votre site existe, mais il ne vous ramène pas de clients.',
   text: 'Je le refais pour qu’il soit clair, rapide et bien placé sur Google, sans perdre ce que votre site actuel a déjà construit.',
   points: [['Audit de l’existant', 'Ce qui fonctionne, ce qui vous fait perdre des clients, ce que Google apprécie déjà.'], ['Vos positions conservées', 'Chaque ancienne adresse est redirigée vers la bonne nouvelle page.'], ['Nouveaux textes et design', 'Un site moderne, rapide sur téléphone, qui donne envie de vous appeler.']],
   price: 'Même tarif qu’une création : 1 690 € TTC la première page, puis 500 € TTC par page.' },
 { id: 'referencement', title: 'Référencement local', lead: 'On vous trouve en tapant votre nom, mais pas en cherchant votre métier.',
   text: 'Je travaille votre site pour qu’il apparaisse quand on cherche votre activité dans votre ville et autour.',
   points: [['SEO technique', 'Un site rapide, bien structuré et facile à lire pour Google.'], ['Contenus locaux', 'Des pages qui répondent aux recherches de vos futurs clients près de chez vous.'], ['Fiche Google', 'Une fiche d’établissement complète pour apparaître sur Google Maps.']],
   price: 'Inclus dans chaque création et refonte. Sur devis pour un site existant.' }
];

export default function ServicesPage() {
 return <><SiteHeader/><main>
  <section className="hero hero-text" id="accueil"><div className="hero-layout"><div className="hero-copy"><h1>Mes services<span className="olive-dot">.</span></h1><p className="hero-question">Créer votre site, le refaire ou le rendre visible sur Google : trois besoins, une même exigence.</p><p>Chaque site est fait sur mesure, avec des textes écrits pour convaincre et un référencement local pensé dès le départ. Le prix est annoncé avant de commencer.</p><div className="hero-actions">{services.map(s => <a key={s.id} className="services-jump" href={`#${s.id}`}>{s.title}</a>)}</div></div></div></section>

  {services.map((s, i) => <section className={`expertise-section services-block${i % 2 ? ' services-alt' : ''}`} id={s.id} key={s.id}>
   <div className="expertise-heading"><h2>{s.title}</h2><p className="services-lead">{s.lead}</p><p>{s.text}</p><p className="services-price">{s.price}</p><a className="expertise-heading-link" href="/rendez-vous">Parlons de votre projet <ArrowUpRight size={17}/></a></div>
   <div className="expertise-lines">{s.points.map(([t, d]) => <div className="expertise-item" key={t}><span>{t}</span><p>{d}</p><span aria-hidden="true"/></div>)}</div>
  </section>)}

  <section className="home-cta"><h2>Vous ne savez pas par où commencer ?<br/><em>Faites auditer votre site gratuitement.</em></h2><div className="home-cta-actions"><a className="button button-olive" href="/audit-gratuit">Audit gratuit de mon site <ArrowUpRight size={17}/></a><a className="button home-cta-light" href="/rendez-vous">Réserver un appel de 20 min <ArrowUpRight size={17}/></a><a className="home-cta-link" href="/contact">Écrire un message <ArrowUpRight size={16}/></a></div></section>
 </main><SiteFooter/></>;
}
