import type { Metadata } from 'next';
import { ArrowUpRight } from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';

export const metadata: Metadata = { title: 'Page introuvable | SEOKRAFT', robots: { index: false, follow: true } };

export default function NotFound() {
 return <><SiteHeader/><main>
  <section className="work-section page-intro">
   <div className="section-head"><div><span className="eyebrow"><span className="eyebrow-dot"/> ERREUR 404</span><h1>Cette page n’existe pas<br/><em>ou a été déplacée.</em></h1></div><p>Le lien que vous avez suivi est peut-être ancien. Voici les pages les plus utiles pour continuer.</p></div>
  </section>
  <section className="expertise-section"><div className="expertise-heading"><span className="eyebrow">CONTINUER LA VISITE</span><h2>Où souhaitez-vous<br/><em>aller ?</em></h2></div>
   <div className="expertise-lines">
    <a href="/" className="expertise-item"><span>Accueil</span><p>Découvrir SEOKRAFT, studio web indépendant à Strasbourg.</p><ArrowUpRight aria-hidden="true"/></a>
    <a href="/creation-site-internet/strasbourg" className="expertise-item"><span>Création de site internet</span><p>Prestations, tarifs, délais et réponses à vos questions.</p><ArrowUpRight aria-hidden="true"/></a>
    <a href="/blog" className="expertise-item"><span>Blog</span><p>Conseils pour créer votre site et être trouvé sur Google.</p><ArrowUpRight aria-hidden="true"/></a>
    <a href="/rendez-vous" className="expertise-item"><span>Réserver un appel</span><p>Un échange gratuit de 20 minutes pour parler de votre projet.</p><ArrowUpRight aria-hidden="true"/></a>
   </div>
  </section>
 </main><SiteFooter/></>;
}
