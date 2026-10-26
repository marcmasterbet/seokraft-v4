/**
 * Liste unique des articles du blog.
 * Utilisée par la page /blog, le sitemap et les liens « Pour aller plus loin ».
 * Pour publier un article : créer app/blog/<slug>/page.tsx puis l’ajouter ici, en tête de liste.
 */
export type ArticleSummary = { slug: string; tag: string; title: string; text: string; cat: 'site' | 'seo' };

export const articles: ArticleSummary[] = [
 { slug: 'choisir-createur-site-internet-strasbourg', tag: 'Strasbourg · Choisir son prestataire', title: 'Comment choisir son créateur de site internet à Strasbourg ?', text: 'Freelance ou agence, réalisations, avis, devis, propriété du site : les critères et les questions à poser avant de vous engager.', cat: 'site' },
 { slug: 'site-vitrine-ou-e-commerce', tag: 'Création de site · Choisir', title: 'Site vitrine ou site e-commerce : que choisir ?', text: 'Différences, coûts, obligations et cas concrets pour choisir le bon type de site selon votre activité.', cat: 'site' },
 { slug: 'refonte-site-internet', tag: 'Refonte · Site internet', title: 'Comment savoir si votre site internet doit être refait ?', text: 'Les signes qui montrent qu’une refonte s’impose, et les précautions pour ne pas perdre votre référencement.', cat: 'site' },
 { slug: 'wix-ou-site-sur-mesure', tag: 'Wix · Sur mesure · Comparatif', title: 'Wix ou site sur mesure : lequel choisir pour votre entreprise ?', text: 'Coûts sur plusieurs années, liberté, référencement et propriété : une comparaison honnête.', cat: 'site' },
 { slug: 'preparer-creation-site-internet', tag: 'Création de site · Check-list', title: 'Que préparer avant de créer son site internet ?', text: 'Objectifs, pages, contenus, nom de domaine, budget : la check-list pour démarrer votre projet sur de bonnes bases.', cat: 'site' },
 { slug: 'site-internet-association', tag: 'Association · Site internet', title: 'Créer le site internet de son association : par où commencer ?', text: 'Pages essentielles, adhésions et dons en ligne, obligations et mise à jour : le guide pour un site associatif durable.', cat: 'site' },
 { slug: 'prix-site-internet', tag: 'Prix · Création de site', title: 'Combien coûte un site internet en 2026 ?', text: 'Site fait soi-même, freelance ou agence : les fourchettes de prix, les coûts annuels et les pièges à éviter.', cat: 'site' },
 { slug: 'futur-recherche-ia', tag: 'Google · IA · Tendances', title: 'AI Overviews et Mode IA en France : ce qui change pour votre site', text: 'Les réponses IA de Google sont arrivées en France en 2026. Ce qui change pour les clics, les entreprises locales et votre site.', cat: 'seo' },
 { slug: 'etre-visible-chatgpt', tag: 'ChatGPT · Guide pratique', title: 'Comment rendre son entreprise visible sur ChatGPT ?', text: 'Comment ChatGPT trouve ses sources, les réglages techniques à vérifier et les actions concrètes pour être cité.', cat: 'seo' },
 { slug: 'seo-vs-geo', tag: 'SEO · GEO · Stratégie', title: 'SEO vs GEO : quelles différences pour votre entreprise ?', text: 'Ce qui est commun, ce qui change, et par où commencer pour une petite entreprise.', cat: 'seo' },
 { slug: 'geo', tag: 'GEO · Définition', title: 'GEO : définition et actions concrètes pour être cité par les IA', text: 'Une définition simple du GEO, le fonctionnement des moteurs IA et les actions qui ont réellement du sens.', cat: 'seo' }
];

/** Quatre autres articles à proposer en fin de lecture. */
export function relatedArticles(slug: string, count = 4) {
 const i = articles.findIndex(a => a.slug === slug);
 const others = articles.filter(a => a.slug !== slug);
 if (i < 0) return others.slice(0, count);
 return Array.from({ length: Math.min(count, others.length) }, (_, k) => others[(i + k) % others.length]);
}

/** Espace insécable avant ? ! : ; (typographie française) pour éviter un signe seul en début de ligne. */
export const nbsp = (t: string) => t.replace(/ ([?!:;»])/g, '\u00a0$1').replace(/« /g, '«\u00a0');
