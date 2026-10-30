import type { Metadata } from 'next';
import BlogArticle from '../../../components/BlogArticle';

const title = 'GEO : définition et actions concrètes pour être cité par les IA';
const seoTitle = 'GEO : définition et actions pour être cité par les IA';
const description = 'Qu’est-ce que le GEO (Generative Engine Optimization) ? Définition simple, fonctionnement des moteurs IA et actions pour rendre votre entreprise citable.';

export const metadata: Metadata = { title: `${seoTitle} | SEOKRAFT`, description, alternates: { canonical: '/blog/geo' }, robots: { index: true, follow: true }, openGraph: { images: [{ url: '/opengraph-image.jpg', width: 1200, height: 630, alt: 'SEOKRAFT, studio web à Strasbourg' }], title, description, url: 'https://www.seokraft.fr/blog/geo', type: 'article' } };

const article = {
 title,
 slug: 'geo',
 eyebrow: 'GEO · Définition · Bonnes pratiques',
 date: '2026-10-26',
 intro: 'ChatGPT, Perplexity, Gemini, les AI Overviews et le Mode IA de Google : une partie des recherches se termine désormais par une réponse rédigée plutôt que par une liste de liens. Le GEO désigne l’ensemble des pratiques qui aident une entreprise à être comprise, et parfois citée, dans ces réponses. Voici une définition claire et les actions qui ont réellement du sens pour une petite entreprise.',
 sections: [
  { heading: 'Le GEO, en une phrase', paragraphs: [
   'GEO signifie Generative Engine Optimization, que l’on peut traduire par « optimisation pour les moteurs génératifs ». Le terme a été popularisé en 2023 par des travaux de chercheurs qui étudiaient comment certains contenus sont davantage repris que d’autres dans les réponses produites par l’IA.',
   'Là où le SEO vise à faire apparaître une page dans une liste de résultats, le GEO cherche à ce que les informations de votre entreprise soient correctement comprises, reprises et attribuées lorsqu’une IA rédige une réponse.',
   'Il ne s’agit pas d’une technique secrète ni d’un réglage à activer. Aucun prestataire ne peut « placer » une entreprise dans ChatGPT ou garantir une citation : les réponses varient selon la question, l’outil utilisé et le moment.'
  ]},
  { heading: 'Comment une IA choisit ses sources', paragraphs: [
   'Lorsqu’un assistant effectue une recherche en ligne, il procède en général en deux temps. Il interroge d’abord un index de pages web, puis il sélectionne quelques passages jugés pertinents et fiables pour rédiger sa synthèse, souvent accompagnée de liens vers les sources utilisées.',
   'Conséquence directe : une page qui n’est pas accessible aux robots, pas indexée ou difficile à comprendre a très peu de chances d’être reprise. À l’inverse, un passage qui répond clairement à une question précise, avec des faits vérifiables, est plus facile à exploiter pour une IA.',
   'Les modèles s’appuient aussi sur ce qui est dit de vous ailleurs : profils professionnels, annuaires, articles, avis clients. Une entreprise décrite de façon cohérente sur plusieurs sources est plus facile à identifier qu’une entreprise présente uniquement sur son propre site.'
  ]},
  { heading: 'Les actions concrètes qui comptent', paragraphs: [
   'Première action : rendre vos pages accessibles. Vérifiez que votre fichier robots.txt n’empêche pas l’accès des robots des moteurs de recherche et des assistants IA, et que vos pages importantes sont bien indexées dans Google Search Console.',
   'Deuxième action : une page claire par service important. Indiquez ce que vous faites, pour qui, où, à quel prix lorsque c’est possible, et comment se déroule la prestation. Notre page [création de site internet à Strasbourg](/creation-site-internet/strasbourg) suit exactement cette logique.',
   'Troisième action : répondre aux vraies questions de vos clients. Un article qui répond précisément à « combien coûte un site internet ? » est plus utile, pour les internautes comme pour les IA, qu’un texte vague sur « l’importance du digital ». C’est l’objectif de notre guide sur le [prix d’un site internet](/blog/prix-site-internet).',
   'Quatrième action : apporter des preuves. Des exemples de réalisations, des chiffres datés, des avis clients et un auteur identifié rendent votre contenu plus crédible et plus facile à citer.',
   'Cinquième action : soigner votre présence en dehors de votre site. Un profil LinkedIn à jour, une fiche d’établissement, des avis et des mentions dans des sources locales renforcent la cohérence de votre entreprise sur le web.'
  ]},
  { heading: 'Structurer ses pages pour être bien compris', paragraphs: [
   'Utilisez des titres explicites qui reprennent les questions que se posent vos clients, puis répondez dès le premier paragraphe avant d’entrer dans le détail. Cette structure aide le lecteur pressé et facilite l’extraction d’un passage pertinent.',
   'Gardez l’essentiel de l’information sous forme de texte. Une information importante enfermée dans une image, un PDF ou une vidéo sans transcription est plus difficile à exploiter.',
   'Les données structurées (schema.org) peuvent préciser qui vous êtes et ce que vous proposez, à condition qu’elles correspondent au contenu visible. Elles complètent un bon contenu, elles ne le remplacent pas.'
  ]},
  { heading: 'Ce qui ne sert à rien, ou presque', paragraphs: [
   'Publier en masse des textes générés automatiquement et sans valeur ajoutée. Les IA reprennent rarement des contenus qui disent la même chose que des centaines d’autres pages.',
   'Répéter des mots-clés ou ajouter « IA » dans tous les titres. Cela n’améliore ni la clarté ni la crédibilité.',
   'Compter sur un fichier spécial comme llms.txt pour Google. Google indique qu’aucun fichier ni balisage spécifique n’est nécessaire pour apparaître dans ses fonctionnalités d’IA : les bonnes pratiques classiques du référencement suffisent.'
  ]},
  { heading: 'Comment mesurer les résultats', paragraphs: [
   'Suivez d’abord des indicateurs fiables : les demandes de contact, le trafic issu des moteurs de recherche et la progression des recherches sur le nom de votre entreprise. Dans Google Search Console, les apparitions dans les AI Overviews et le Mode IA sont comptabilisées avec le reste du trafic de recherche web.',
   'Dans votre outil de statistiques, surveillez les visites provenant d’assistants comme ChatGPT ou Perplexity, qui apparaissent généralement comme des sites référents.',
   'Vous pouvez aussi tester régulièrement quelques questions réalistes dans plusieurs assistants, par exemple « quel prestataire pour créer un site internet à Strasbourg ? ». Notez les résultats, mais gardez en tête qu’une réponse ponctuelle n’est pas une mesure fiable.'
  ]}
 ],
 conclusion: 'Le GEO n’est pas une discipline magique : c’est la suite logique d’un bon référencement. Des pages claires, des réponses précises, des preuves concrètes et une présence cohérente sur le web restent la meilleure façon d’être compris par les moteurs comme par les IA.'
};

export default function Page() { return <BlogArticle article={article} />; }
