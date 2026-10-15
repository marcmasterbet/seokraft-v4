import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Référencement SEO à Strasbourg | SEOKRAFT',
  description: 'Accompagnement SEO à Strasbourg : optimisation technique des pages, référencement local et suivi de la visibilité Google. Échangeons sur votre site.',
  alternates: { canonical: '/seo/strasbourg/' },
  robots: { index: true, follow: true },
  openGraph: { title: 'Référencement naturel à Strasbourg | SEOKRAFT', description: 'Un référencement naturel pensé pour les entreprises de Strasbourg et d’Alsace.', url: 'https://www.seokraft.fr/seo/strasbourg/' },
};

const services = [
  { title: 'Fondations SEO', text: 'Structurer les pages, les balises et les contenus pour faciliter leur compréhension par les moteurs de recherche.' },
  { title: 'Optimisation des pages', text: 'Travailler les titres, les contenus, le maillage interne et les intentions de recherche utiles à vos clients.' },
  { title: 'Référencement local', text: 'Renforcer la cohérence de votre présence en ligne pour les recherches liées à Strasbourg et à votre zone d’intervention.' },
  { title: 'Suivi et améliorations', text: 'Mesurer les évolutions et prioriser les actions en fonction des données plutôt que des promesses de positionnement.' },
];

export default function SeoStrasbourgPage() {
  return <main style={{ background: '#f4f0e8', color: '#11110f', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '30px 24px' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, paddingBottom: 32, borderBottom: '1px solid #c9c7be' }}>
        <Link href='/' style={{ color: '#11110f', textDecoration: 'none', fontSize: 26, fontWeight: 700, letterSpacing: '-.05em' }}>SEOKRAFT<span style={{ color: '#596247' }}>.</span></Link>
        <Link href='/#contact' style={{ color: '#596247', textDecoration: 'none', fontSize: 14 }}>Parlons de votre projet ↗</Link>
      </header>
      <section style={{ padding: '100px 0 76px' }}>
        <p style={{ fontSize: 12, letterSpacing: '.2em', textTransform: 'uppercase', fontWeight: 700, color: '#596247' }}>SEO · Strasbourg · Alsace</p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: 'clamp(46px, 7vw, 90px)', lineHeight: 1.06, letterSpacing: '-.045em', maxWidth: 1000, margin: '24px 0' }}>Référencement SEO à Strasbourg<span style={{ color: '#596247' }}>.</span></h1>
        <p style={{ fontSize: 'clamp(18px, 2vw, 23px)', lineHeight: 1.65, maxWidth: 750 }}>Votre site doit être compréhensible pour Google, utile pour vos visiteurs et capable de présenter clairement votre activité. SEOKRAFT accompagne les entreprises de Strasbourg et d’Alsace dans l’amélioration de leur référencement naturel.</p>
        <Link href='/rendez-vous' style={{ display: 'inline-block', marginTop: 26, padding: '17px 25px', background: '#596247', color: '#fff', textDecoration: 'none', fontWeight: 600 }}>Discuter de votre projet ↗</Link>
      </section>
      <section style={{ borderTop: '1px solid #c9c7be', padding: '55px 0' }}>
        <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: 'clamp(30px, 4vw, 52px)', lineHeight: 1.15 }}>Une stratégie SEO adaptée à votre activité</h2>
        <p style={{ lineHeight: 1.8, maxWidth: 800, fontSize: 17 }}>Artisan, prestataire de services, commerce ou entreprise B2B : les recherches de vos futurs clients ne sont pas toutes les mêmes. Le travail commence par comprendre votre offre, votre zone géographique et les pages dont vous avez réellement besoin.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 18, marginTop: 35 }}>
          {services.map(s => <article key={s.title} style={{ border: '1px solid #c9c7be', padding: 25 }}><h3 style={{ fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: 27 }}>{s.title}</h3><p style={{ lineHeight: 1.7 }}>{s.text}</p></article>)}
        </div>
      </section>
      <section style={{ borderTop: '1px solid #c9c7be', padding: '55px 0 70px' }}>
        <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: 'clamp(30px, 4vw, 52px)' }}>Pourquoi travailler votre visibilité locale ?</h2>
        <p style={{ lineHeight: 1.8, maxWidth: 800, fontSize: 17 }}>Une entreprise implantée à Strasbourg peut être recherchée par son métier, son service ou sa localisation. Des pages bien structurées, des informations cohérentes et un contenu pertinent facilitent la compréhension de votre activité par les moteurs de recherche. Le SEO demande du temps : aucun classement ni volume de contacts ne peut être garanti.</p>
        <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: 'clamp(30px, 4vw, 52px)', marginTop: 65 }}>Parlons de votre site.</h2>
        <p style={{ lineHeight: 1.8, maxWidth: 740, fontSize: 17 }}>Vous souhaitez améliorer la présentation de votre activité et les fondations SEO de votre site ? Échangeons sur votre projet et les possibilités adaptées à votre besoin.</p>
        <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', marginTop: 30 }}><Link href='/rendez-vous' style={{ background: '#596247', color: 'white', padding: '16px 23px', textDecoration: 'none' }}>Parler de votre projet ↗</Link><Link href='/rendez-vous' style={{ color: '#11110f', padding: '16px 0' }}>Réserver un appel ↗</Link></div>
      </section>
      <footer style={{ padding: '28px 0', borderTop: '1px solid #c9c7be', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, fontSize: 13 }}><span>© SEOKRAFT — Marc Bretzner</span><Link href='/' style={{ color: '#596247' }}>Retour à l’accueil ↗</Link></footer>
    </div>
  </main>;
}
