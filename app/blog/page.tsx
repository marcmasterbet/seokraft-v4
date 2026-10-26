import type { Metadata } from 'next';
import { ArrowUpRight } from 'lucide-react';
import SiteHeader from '../../components/SiteHeader';
import SiteFooter from '../../components/SiteFooter';
import { StudioSection, Contact } from '../../components/Home';
import { articles, nbsp } from '../../components/articles';

export const metadata: Metadata = {
 title: 'Blog : sites internet, SEO et visibilité en ligne | SEOKRAFT',
 description: 'Conseils pour créer un site internet efficace, améliorer votre référencement sur Google et comprendre la visibilité dans les réponses des IA.',
 alternates: { canonical: '/blog' },
 openGraph: { type: 'website', url: 'https://www.seokraft.fr/blog', title: 'Le blog SEOKRAFT', description: 'Sites internet, SEO et visibilité en ligne : des conseils clairs pour les entreprises.' }
};

const siteArticles = articles.filter(a => a.cat === 'site');
const seoArticles = articles.filter(a => a.cat === 'seo');

function ArticleLines({ list }: { list: typeof articles }) {
 return <div className="expertise-lines">{list.map(a => <a href={`/blog/${a.slug}`} className="expertise-item" key={a.slug}><span>{nbsp(a.title)}</span><p>{nbsp(a.text)}</p><ArrowUpRight aria-hidden="true"/></a>)}</div>;
}

export default function BlogIndex() {
 return <><SiteHeader/><main>
  <section className="work-section page-intro">
   <div className="section-head"><div><span className="eyebrow"><span className="eyebrow-dot"/> LE BLOG SEOKRAFT</span><h1>Des conseils clairs.<br/><em>Pour un site qui travaille.</em></h1></div><p>Créer ou refaire votre site, comprendre les prix, être trouvé sur Google et dans les réponses des IA : des réponses concrètes aux questions que se posent les entreprises.</p></div>
  </section>

  <section className="expertise-section" id="creer-son-site">
   <div className="expertise-heading"><span className="eyebrow">CRÉER SON SITE INTERNET</span><h2>Bien préparer.<br/><em>Bien choisir.</em></h2><p>Prix, préparation, type de site, refonte, choix du prestataire : tout ce qu’il faut savoir avant de lancer votre projet.</p><a className="expertise-heading-link" href="/creation-site-internet/strasbourg">Création de site à Strasbourg <ArrowUpRight size={17}/></a></div>
   <ArticleLines list={siteArticles}/>
  </section>

  <StudioSection/>

  <section className="expertise-section" id="seo-ia">
   <div className="expertise-heading"><span className="eyebrow">SEO, GEO &amp; IA</span><h2>Être trouvé.<br/><em>Sur Google et ailleurs.</em></h2><p>Référencement naturel, réponses de l’IA de Google, ChatGPT : comprendre comment vos futurs clients vous cherchent aujourd’hui.</p><a className="expertise-heading-link" href="/seo/strasbourg">Référencement SEO à Strasbourg <ArrowUpRight size={17}/></a></div>
   <ArticleLines list={seoArticles}/>
  </section>

  <Contact/>
 </main><SiteFooter/></>;
}
