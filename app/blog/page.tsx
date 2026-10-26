import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import SiteHeader from '../../components/SiteHeader';
import SiteFooter from '../../components/SiteFooter';
import { articles } from '../../components/articles';

export const metadata: Metadata = {
 title: 'Blog : sites internet, SEO et visibilité en ligne | SEOKRAFT',
 description: 'Conseils pour créer un site internet efficace, améliorer votre référencement sur Google et comprendre la visibilité dans les réponses des IA.',
 alternates: { canonical: '/blog' },
 openGraph: { type: 'website', url: 'https://www.seokraft.fr/blog', title: 'Le blog SEOKRAFT', description: 'Sites internet, SEO et visibilité en ligne : des conseils clairs pour les entreprises.' }
};



export default function BlogIndex() {
 return <><SiteHeader/><main className="lp">
  <section className="lp-hero">
   <span className="eyebrow"><span className="eyebrow-dot"/>LE BLOG SEOKRAFT</span>
   <h1>Sites internet, SEO <em>et visibilité</em><span className="olive-dot">.</span></h1>
   <p className="lp-lead">Des conseils clairs et concrets pour créer un site internet utile à votre activité, être trouvé sur Google et comprendre comment évolue la recherche en ligne.</p>
  </section>
  <section className="lp-block blog-list">
   {articles.map(a => <Link key={a.slug} href={`/blog/${a.slug}`} className="blog-item"><span className="eyebrow">{a.tag}</span><h2>{a.title}</h2><p>{a.text}</p><span className="blog-more">Lire l’article <ArrowUpRight size={16}/></span></Link>)}
  </section>
  <section className="lp-block lp-cta">
   <span className="eyebrow light">UN PROJET DE SITE ?</span>
   <h2>Parlons de votre<br/><em>prochain site internet.</em></h2>
   <div className="hero-actions"><Link className="button lp-button-light" href="/creation-site-internet/strasbourg">Découvrir la création de site <ArrowUpRight size={17}/></Link><Link className="lp-cta-call" href="/rendez-vous">Réserver un appel gratuit <ArrowUpRight size={17}/></Link></div>
  </section>
 </main><SiteFooter/></>;
}
