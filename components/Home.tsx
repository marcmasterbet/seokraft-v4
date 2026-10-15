'use client';
import Image from 'next/image';
import Brand from './Brand';
import SiteHeader from './SiteHeader';
import {trackSeokraftConversion} from './AnalyticsConsent';
import { useState, type FormEvent } from 'react';
import { ArrowUpRight, Plus, Minus } from 'lucide-react';

const CALL_LABEL='Réserver mon appel gratuit (20 min)';

/*
 * Réalisations.
 * `result` et `quote` sont facultatifs : laissés vides, ils ne s'affichent pas.
 * Exemple à remplir plus tard :
 *   result:'+40 % de demandes de devis en 3 mois.',
 *   quote:{text:'Marc a su…',author:'Prénom Nom, fonction'}
 */
type Project={name:string;tag:string;description:string;need:string;solution:string;features:string[];url:string;kind:string;result?:string;quote?:{text:string;author:string}};
const projects:Project[]=[
 {name:'REMUS SYSTEMS',tag:'Site vitrine sur mesure · Technologies',description:'Un site vitrine à l’identité affirmée, conçu pour présenter une activité technologique complexe avec clarté et sobriété.',need:'Expliquer une activité technologique complexe à des clients qui ne sont pas experts.',solution:'Une identité visuelle premium, des textes clairs et une page dédiée à chaque expertise : solutions, audit, recherche.',features:['Identité visuelle premium','Une page par expertise','Navigation adaptée au mobile'],url:'https://remussystems.fr',kind:'remus'},
 {name:'LOCA DIRECT',tag:'Plateforme web · Location saisonnière',description:'Une plateforme de mise en relation dans la location saisonnière, pensée pour plusieurs profils d’utilisateurs.',need:'Réunir propriétaires, voyageurs et prestataires sur une seule plateforme simple à utiliser.',solution:'Des comptes utilisateurs pour chaque profil, des fiches de biens claires et un système de mise en relation.',features:['Comptes utilisateurs','Fiches de biens','Mise en relation'],url:'https://www.loca-direct.fr',kind:'loca'}
];

/*
 * Témoignages : la section n'apparaît que si la liste contient au moins un avis.
 * Exemple : {text:'…',author:'Prénom, métier, ville'}
 */
const testimonials:{text:string;author:string}[]=[];

const reasons=[
 ['Vous parlez à celui qui fait','Pas de commercial, pas d’intermédiaire. La personne que vous avez au téléphone est celle qui conçoit votre site.'],
 ['Vos textes écrits par un pro','Jeff Bond, copywriter depuis 20 ans, écrit chacune de vos pages. Vous n’avez rien à rédiger : il suffit de nous parler de votre métier.'],
 ['Un site qui vous ressemble','Pas de modèle tout fait : chaque design est créé pour votre entreprise, votre image et vos clients.'],
 ['Rapide et simple à utiliser','Pensé d’abord pour le mobile, rapide à charger et facile à parcourir : vos visiteurs trouvent tout de suite ce qu’ils cherchent.']
];

const steps=[
 ['Semaine 1 · Échanger','Nous parlons de votre activité, de vos clients et de vos objectifs. Nous définissons ensemble les pages et le message de votre site.'],
 ['Semaines 2 et 3 · Concevoir','Je crée la maquette, Jeff écrit vos textes. Vous voyez votre site avant qu’il soit développé.'],
 ['Semaine 4 · Développer','Je construis le site, je l’adapte au mobile et je pose les fondations SEO techniques.'],
 ['Semaine 5 · Valider et lancer','Nous ajustons ensemble les derniers détails, puis je mets votre site en ligne.']
];

const faqs=[
 ['Combien coûte la création d’un site internet ?','À partir de 2 800 € TTC pour un site jusqu’à 5 pages, textes et SEO éditorial inclus. S’y ajoutent 49 € TTC par mois pour l’hébergement et la maintenance. Vous recevez un devis détaillé avant tout engagement.'],
 ['Combien de temps faut-il pour créer mon site ?','5 semaines en moyenne entre notre premier échange et la mise en ligne. Les projets avancés ont leur propre planning, fixé au devis.'],
 ['Que dois-je fournir ?','Votre logo et vos photos si vous en avez, ainsi qu’un échange sur votre métier. Jeff Bond, notre copywriter, écrit tous les textes à partir de ce que vous nous racontez.'],
 ['Pourquoi pas Wix ou un site fait soi-même ?','Un site fait soi-même coûte moins cher, mais il vous coûte du temps, et il ressemble souvent à des milliers d’autres. Je vous livre un site unique, avec des textes professionnels, entretenu dans la durée, pendant que vous vous occupez de votre métier.'],
 ['Est-ce que mon site m’appartient ?','Les droits d’utilisation, les accès, la propriété du nom de domaine et les conditions de restitution sont définis clairement dans votre devis et votre contrat.'],
 ['Pourrai-je modifier mon site moi-même ?','Les possibilités de modification et les accès dépendent de la solution retenue. Je précise ce qui est prévu dès le devis et je vous accompagne dans la prise en main.'],
 ['Mon site pourra-t-il évoluer ?','Oui. Les évolutions peuvent être anticipées dès la conception, et les fonctionnalités complémentaires chiffrées si nécessaire.'],
 ['Le référencement est-il inclus ?','Les bases, oui : vos pages sont structurées et optimisées pour Google dès la création. Pour un vrai travail de visibilité (suivi, contenus réguliers, présence dans les IA), un accompagnement SEO & GEO est assuré par notre partenaire en stratégie éditoriale et SEO éditorial. Aucun positionnement sur Google ne peut être garanti.'],
 ['Pourquoi la maintenance est-elle obligatoire ?','Parce qu’un site non entretenu devient lent, vulnérable et finit par perdre sa place sur Google. Avec la maintenance, votre site reste rapide, sécurisé et à jour, sans que vous ayez à y penser.']
];


function Contact(){
 const [sent,setSent]=useState(false);
 const [error,setError]=useState('');
 const [busy,setBusy]=useState(false);
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setBusy(true);setError('');
  const form=new FormData(e.currentTarget);
  const payload=Object.fromEntries(form.entries());
  try{
   const r=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
   if(!r.ok){const response=await r.json().catch(()=>({}));throw new Error(response.error==='Service de contact non configuré'?'Le formulaire est temporairement indisponible. Merci de réessayer ultérieurement.':'Votre message n’a pas pu être envoyé. Merci de réessayer.');}
   trackSeokraftConversion('contact_submit');
   setSent(true);
  }catch(err){setError(err instanceof Error?err.message:'Une erreur est survenue. Merci de réessayer.');}
  finally{setBusy(false);}
 }
 return <section className="contact-section" id="contact">{sent?
  <div className="sent-state" role="status" aria-live="polite"><span className="sent-check" aria-hidden="true">✓</span><h2>Merci pour votre confiance.</h2><p className="sent-lead">Votre message a bien été reçu.</p><p className="sent-detail">Je prendrai personnellement connaissance de votre demande et reviendrai vers vous avec une réponse adaptée à votre projet.</p><div className="sent-signature"><span>À bientôt,</span><strong>Marc Bretzner</strong><span>SEOKRAFT</span></div><a href="#accueil" onClick={()=>setSent(false)}>Retour à l’accueil <ArrowUpRight size={17}/></a></div>
 :<div className="contact-wrap"><div className="contact-intro"><span className="eyebrow">CONTACT</span><h2>Parlons de<br/><em>votre projet.</em></h2><p>Réservez un appel gratuit de 20 minutes. Vous me présentez votre activité, je vous dis honnêtement ce dont vous avez besoin et combien cela coûte. Sans engagement.</p><a className="button button-olive contact-call-button" href="/rendez-vous">{CALL_LABEL} <ArrowUpRight size={17}/></a><p className="contact-alt">Vous préférez écrire ? Décrivez votre projet dans le formulaire.</p></div>
  <form className="mail-form" onSubmit={submit}><div className="mail-heading"><span className="mail-dot"/>VOTRE DEMANDE <span className="mail-to">SEOKRAFT — MARC BRETZNER</span></div>
   <label>Votre nom <input type="text" name="name" placeholder="Nom et prénom" required autoComplete="name"/></label>
   <label>Votre e-mail <input type="email" name="email" placeholder="vous@entreprise.fr" required autoComplete="email"/></label>
   <label>Votre téléphone (facultatif) <input type="tel" name="phone" placeholder="06 00 00 00 00" autoComplete="tel"/></label>
   <label>Votre projet <select name="subject" required defaultValue=""><option value="" disabled>Choisir un type de projet</option><option>Création de site internet</option><option>Refonte de site internet</option><option>Projet web avancé</option><option>Référencement SEO & GEO</option><option>Autre demande</option></select></label>
   <label>Votre message <textarea name="message" placeholder="Mon activité, ce que j’attends de mon site, mon site actuel s’il existe…" required minLength={15} rows={6}/></label>
   <input type="text" name="website" tabIndex={-1} autoComplete="off" className="honey" aria-hidden="true"/>
   <p className="contact-privacy">Les informations envoyées sont utilisées pour répondre à votre demande. Consultez notre <a href="/politique-de-confidentialite">politique de confidentialité</a>.</p>
   {error&&<p className="form-error" role="alert">{error}</p>}
   <button className="button button-dark" type="submit" disabled={busy}>{busy?'Envoi en cours…':'Envoyer ma demande'} <ArrowUpRight size={17}/></button>
  </form></div>}</section>
}

export default function Home(){const [faq,setFaq]=useState<number|null>(0);return <><SiteHeader/><main>

{/* 1. HERO */}
<section className="hero" id="accueil"><div className="hero-top"><span className="eyebrow"><span className="eyebrow-dot"/> CRÉATION DE SITES INTERNET · STRASBOURG &amp; ALSACE</span><span className="hero-aside">CRÉATION DE SITES INTERNET<br/>SOLUTIONS WEB SUR MESURE</span></div><div className="hero-layout"><div className="hero-copy"><h1>Un site internet qui vous amène <em>des clients</em>, pas seulement une jolie vitrine<span className="olive-dot">.</span></h1><p className="hero-question">Je conçois et développe votre site sur mesure. Jeff Bond, copywriter depuis 20 ans, écrit des textes qui donnent envie de vous contacter.</p><p>Deux experts, un seul interlocuteur : moi.</p><div className="hero-actions"><a className="button button-olive" href="/rendez-vous">{CALL_LABEL} <ArrowUpRight size={17}/></a></div><ul className="hero-proof" aria-label="Ce qui est inclus"><li>Design sur mesure</li><li>Textes professionnels inclus</li><li>Un seul interlocuteur</li><li>En ligne en 5 semaines</li></ul></div><div className="hero-visual"><div className="hero-photo"><Image src="/images/marc-noir-blanc.jpg" alt="Marc Bretzner, fondateur de SEOKRAFT, travaillant sur un projet web" fill priority sizes="(max-width: 800px) 90vw, 45vw" style={{objectFit:'cover',objectPosition:'center 39%'}}/></div><a className="hero-project-link" href="#realisations">Voir mes réalisations <ArrowUpRight size={18}/></a></div></div></section>

{/* 2. PROBLÈME */}
<section className="intro-scene" id="besoins" aria-label="Pourquoi refaire ou créer votre site internet"><span className="eyebrow light">LE CONSTAT</span><h2>Un site qui ne convainc pas<br/><em>ne vous rapporte rien.</em></h2><p>Beaucoup d’entreprises ont un site. Peu en tirent des demandes de devis. En général, pour l’une de ces raisons :</p><ul className="intro-list"><li>Il est difficile à utiliser sur mobile, et vos visiteurs repartent sans vous contacter.</li><li>Il paraît daté et donne une mauvaise première impression.</li><li>Ses textes parlent de vous, pas de ce que vos clients veulent savoir.</li><li>Vous avez dû jongler entre un graphiste, un développeur et un rédacteur, sans que personne ne pilote l’ensemble.</li></ul><p><strong>Mon travail consiste à régler ces quatre points en même temps.</strong></p></section>

{/* 3. SERVICES */}
<section className="expertise-section" id="expertises"><div className="expertise-heading"><span className="eyebrow">MES SERVICES</span><h2>Le bon site.<br/><em>Pour le bon objectif.</em></h2><p>Créer votre présence en ligne, moderniser un site existant ou aller plus loin : je vous propose la solution adaptée, sans complexité inutile.</p><a className="expertise-heading-link" href="/rendez-vous">{CALL_LABEL} <ArrowUpRight size={17}/></a></div><div className="expertise-lines"><a href="#tarifs" className="expertise-item"><span>Création de site internet</span><p>Votre activité présentée clairement, avec des textes qui donnent envie de vous appeler.</p><ArrowUpRight aria-hidden="true"/></a><a href="#contact" className="expertise-item"><span>Refonte de site internet</span><p>Votre site actuel modernisé : plus clair, plus rapide sur mobile, et fidèle à votre entreprise d’aujourd’hui.</p><ArrowUpRight aria-hidden="true"/></a><a href="#contact" className="expertise-item"><span>Solutions web avancées</span><p>Réservation, paiement en ligne, espace client : des fonctionnalités qui vous font gagner du temps chaque semaine.</p><ArrowUpRight aria-hidden="true"/></a><a href="/seo/strasbourg/" className="expertise-item"><span>Référencement SEO &amp; GEO</span><p>Pour gagner en visibilité sur Google et dans les IA, un accompagnement dédié, assuré par notre partenaire en stratégie éditoriale et SEO éditorial.</p><ArrowUpRight aria-hidden="true"/></a></div></section>

{/* 4. POURQUOI MOI */}
<section className="human-section" id="studio"><div className="human-quote"><span className="eyebrow">UN STUDIO INDÉPENDANT, UN DUO D’EXPERTS</span><h2>Deux expertises.<br/><em>Un seul interlocuteur.</em></h2><p>Je m’appelle Marc Bretzner. Je crée des sites internet pour les entreprises de Strasbourg et d’Alsace. Je travaille avec Jeff Bond, copywriter indépendant depuis 20 ans : je m’occupe de la conception et du développement, il s’occupe des mots. Vous, vous ne parlez qu’à moi.</p><div className="studio-steps studio-reasons" aria-label="Pourquoi travailler avec SEOKRAFT">{reasons.map(([t,d])=><div key={t}><strong>{t}</strong><span>{d}</span></div>)}</div><a href="/a-propos" className="text-link">Découvrir l’équipe <ArrowUpRight size={17}/></a></div><div className="human-image"><Image src="/images/marc-portrait-studio.webp" alt="Portrait de Marc Bretzner, interlocuteur unique chez SEOKRAFT" fill sizes="(max-width: 800px) 100vw, 38vw" style={{objectFit:'cover',objectPosition:'center top'}}/></div></section>

{/* 5. MÉTHODE */}
<section className="seo-scene method-scene" id="methode"><div className="seo-scene-inner"><span className="eyebrow light">MA MÉTHODE</span><h2>De notre premier appel à la mise en ligne :<br/><em>5 semaines.</em></h2><ol className="studio-steps method-steps">{steps.map(([t,d])=><li key={t}><strong>{t}</strong><span>{d}</span></li>)}</ol><p className="method-provide"><strong>Ce que vous avez à fournir :</strong> votre logo, vos photos si vous en avez, et un échange pour que nous comprenions votre métier. Nous nous occupons du reste.</p><p className="method-note">Délai moyen pour un site vitrine. Les projets avancés font l’objet d’un planning sur devis.</p><a href="/rendez-vous" className="seo-link">{CALL_LABEL} <ArrowUpRight size={18}/></a></div></section>

{/* 6. RÉALISATIONS */}
<section className="work-section" id="realisations"><div className="section-head"><div><span className="eyebrow">RÉALISATIONS</span><h2>Deux projets, deux besoins.<br/><em>La même exigence.</em></h2></div><p>Du site vitrine technologique à la plateforme web : découvrez comment chaque projet a été pensé autour d’un objectif précis.</p></div><div className="project-stack portfolio-editorial">{projects.map(p=><article className={`project project-${p.kind}`} key={p.kind}><a href={p.url} target="_blank" rel="noopener noreferrer" className="project-image-link portfolio-image-link" aria-label={`Visiter le site ${p.name}`}><Image src={p.kind==='remus'?'/images/projet-remus-systems.webp':'/images/projet-loca-direct.webp'} alt={`Capture authentique du site ${p.name} réalisé par SEOKRAFT`} width={1908} height={p.kind==='loca'?520:886} sizes={p.kind==='remus'?'(max-width: 800px) 100vw, 90vw':'(max-width: 800px) 100vw, 75vw'} className="portfolio-screenshot"/><span className="project-visit">VOIR LE SITE <ArrowUpRight size={16}/></span></a><div className="project-meta"><div><span className="eyebrow">{p.tag}</span><h3>{p.name}</h3></div><p>{p.description}</p></div><div className="project-case-study"><div className="project-case-copy"><span className="project-case-label">LE DÉFI</span><p>{p.need}</p></div><div className="project-case-copy"><span className="project-case-label">NOTRE RÉPONSE</span><p>{p.solution}</p>{p.result&&<><span className="project-case-label project-case-label-result">LE RÉSULTAT</span><p>{p.result}</p></>}</div><div className="project-case-details"><span className="project-case-label">POINTS CLÉS</span><ul>{p.features.map(feature=><li key={feature}>{feature}</li>)}</ul><a href={p.url} target="_blank" rel="noopener noreferrer" className="project-case-link">Voir le site <ArrowUpRight size={16}/></a></div></div>{p.quote&&<blockquote className="project-quote"><p>« {p.quote.text} »</p><cite>{p.quote.author}</cite></blockquote>}</article>)}</div></section>

{/* 7. TÉMOIGNAGES (masqué tant que la liste est vide) */}
{testimonials.length>0&&<section className="testimonials-section" id="avis"><span className="eyebrow">ILS M’ONT FAIT CONFIANCE</span><h2>Ce que mes clients<br/><em>en disent.</em></h2><div className="testimonials-grid">{testimonials.map(t=><blockquote key={t.author}><p>« {t.text} »</p><cite>{t.author}</cite></blockquote>)}</div></section>}

{/* 8. TARIFS */}
<section className="prices-section sk-pricing" id="tarifs" aria-labelledby="tarifs-titre">
  <div className="sk-pricing-head"><span className="eyebrow">TARIFS · CRÉATION WEB SUR MESURE</span><h2 id="tarifs-titre">Un prix clair,<br/><em>avant tout engagement.</em></h2><p>Un site pensé pour votre entreprise, jusque dans les détails : un design sur mesure, des textes écrits par un copywriter professionnel et une mise en ligne en 5 semaines en moyenne.</p></div>
  <div className="sk-pricing-offer"><div className="sk-pricing-main"><span className="eyebrow">SITE INTERNET SUR MESURE</span><div className="sk-price"><span>À partir de</span><strong>2 800 € <small>TTC</small></strong></div><p className="sk-price-lead">Tout ce qu’il faut pour présenter votre activité et recevoir des demandes de devis.</p><a className="button button-olive" href="#contact">Demander mon devis <ArrowUpRight size={17}/></a><p className="sk-pricing-note">Devis détaillé avant tout engagement.</p></div>
  <div className="sk-pricing-included"><h3>Ce que comprend votre création</h3><ul><li>Jusqu’à 5 pages conçues pour votre activité</li><li>Design sur mesure, adapté au mobile et à la tablette</li><li>Développement web et navigation soignée</li><li>Tous les textes écrits par un copywriter professionnel</li><li>Optimisation SEO éditoriale de vos pages</li><li>Fondations SEO techniques : structure, balises, indexation</li><li>Formulaire de contact et mise en ligne</li><li>En ligne en 5 semaines en moyenne</li></ul><p>Le périmètre exact de la rédaction, des optimisations et des fonctionnalités est défini dans votre devis.</p></div></div>
  <div className="sk-pricing-service"><div><span className="eyebrow">HÉBERGEMENT &amp; MAINTENANCE</span><h3>Votre site entre de bonnes mains.</h3><p>Vous n’avez pas à vous occuper de la technique : je prends en charge l’hébergement et la maintenance technique de votre site, et je reste joignable si vous avez une question.</p><p className="sk-pricing-note">Associé à chaque création. Engagement initial de 12 mois, puis reconduction mensuelle. Les prestations couvertes, modalités de résiliation et éventuels frais complémentaires sont détaillés au contrat.</p></div><div className="sk-service-price"><strong>49 € <small>TTC / mois</small></strong><span>En complément du prix de création</span></div></div>
  <div className="sk-pricing-bottom"><div><span className="eyebrow">PROJETS SPÉCIFIQUES</span><h3>Votre projet va plus loin ?</h3><p>Réservation, paiement, espace client ou outil métier : je vous fais une proposition adaptée.</p></div><a className="button button-olive" href="/rendez-vous">{CALL_LABEL} <ArrowUpRight size={17}/></a></div>
</section>

{/* 9. FAQ */}
<section className="faq-section"><div><span className="eyebrow">QUESTIONS FRÉQUENTES</span><h2>Vos questions,<br/><em>mes réponses.</em></h2></div><div className="faq-list">{faqs.map(([q,a],i)=><div className="faq-item" key={q}><button onClick={()=>setFaq(faq===i?null:i)} aria-expanded={faq===i}>{q}{faq===i?<Minus size={19}/>:<Plus size={19}/>}</button>{faq===i&&<p>{a}</p>}</div>)}</div></section>

{/* 10. CONTACT */}
<Contact/></main><footer className="footer"><Brand/><div><span>Création et refonte de sites internet · Solutions web · SEO &amp; GEO</span><span>© {new Date().getFullYear()} SEOKRAFT — Marc Bretzner</span></div><nav className="footer-legal" aria-label="Informations juridiques"><a href="/mentions-legales">Mentions légales</a><a href="/politique-de-confidentialite">Confidentialité</a><a href="/cgv">CGV</a></nav><a href="#accueil" aria-label="Retour en haut de page" title="Retour en haut"><ArrowUpRight size={19}/></a></footer></>}
