import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import { Contact } from './Home';
import { relatedArticles, nbsp } from './articles';

type Article = { title: string; eyebrow: string; intro: string; sections: {heading:string; paragraphs:string[]}[]; conclusion:string; slug:string; date?:string; published?:string };

/** Transforme [texte](/url) en lien dans les paragraphes. */
function withLinks(text:string){
 const parts=text.split(/(\[[^\]]+\]\([^)]+\))/g);
 return parts.map((part,i)=>{const m=part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);if(!m)return nbsp(part);const external=/^https?:/.test(m[2]);return external?<a key={i} href={m[2]} target='_blank' rel='noopener noreferrer'>{m[1]}</a>:<Link key={i} href={m[2]}>{m[1]}</Link>;});
}

export default function BlogArticle({article}:{article:Article}) {
 const schema={'@context':'https://schema.org','@type':'BlogPosting',headline:article.title,description:article.intro,datePublished:article.published??article.date,dateModified:article.date,inLanguage:'fr-FR',mainEntityOfPage:'https://www.seokraft.fr/blog/'+article.slug,author:{'@type':'Person',name:'Marc Bretzner',url:'https://www.seokraft.fr/a-propos'},publisher:{'@type':'Organization',name:'SEOKRAFT',url:'https://www.seokraft.fr'}};
 return <><SiteHeader/><main>
  <article>
   {article.date&&<script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/>}
   <header className="work-section page-intro article-head">
    <Link href="/blog" className="article-back">← Le blog</Link>
    <span className="eyebrow"><span className="eyebrow-dot"/> {article.eyebrow.toUpperCase()}</span>
    <h1>{nbsp(article.title)}{/[?!.]$/.test(article.title)?null:<span className="olive-dot">.</span>}</h1>
    <p className="article-lead">{nbsp(article.intro)}</p>
    {article.date&&<p className="article-meta">Par Marc Bretzner · <time dateTime={article.date}>{new Date(article.date).toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'})}</time></p>}
   </header>
   <div className="article-body">{article.sections.map(section=><section key={section.heading}><h2>{nbsp(section.heading)}</h2>{section.paragraphs.map((p,j)=><p key={j}>{withLinks(p)}</p>)}</section>)}</div>
   <section className="article-takeaway">
    <span className="eyebrow">À RETENIR</span>
    <h2>{nbsp(article.conclusion)}</h2>
    <a href="#contact" className="text-link">Parlons de votre projet <ArrowUpRight size={17}/></a>
   </section>
  </article>

  <section className="expertise-section">
   <div className="expertise-heading"><span className="eyebrow">POUR ALLER PLUS LOIN</span><h2>D’autres réponses.<br/><em>Pour votre projet.</em></h2><p>Prix, préparation, référencement : poursuivez votre lecture ou découvrez notre accompagnement.</p><a className="expertise-heading-link" href="/creation-site-internet/strasbourg">Création de site à Strasbourg <ArrowUpRight size={17}/></a></div>
   <div className="expertise-lines">{relatedArticles(article.slug).map(a=><a href={`/blog/${a.slug}`} className="expertise-item" key={a.slug}><span>{nbsp(a.title)}</span><p>{nbsp(a.text)}</p><ArrowUpRight aria-hidden="true"/></a>)}</div>
  </section>

  <Contact/>
 </main><SiteFooter/></>;
}
