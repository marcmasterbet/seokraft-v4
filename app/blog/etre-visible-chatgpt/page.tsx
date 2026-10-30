import type { Metadata } from 'next';
import BlogArticle from '../../../components/BlogArticle';

const title = 'Comment rendre son entreprise visible sur ChatGPT ?';
const description = 'Apparaître dans ChatGPT : comment l’outil trouve ses sources, les réglages à vérifier (OAI-SearchBot, Bing) et les actions concrètes pour une entreprise.';

export const metadata: Metadata = { title: `${title} | SEOKRAFT`, description, alternates: { canonical: '/blog/etre-visible-chatgpt' }, robots: { index: true, follow: true }, openGraph: { images: [{ url: '/opengraph-image.jpg', width: 1200, height: 630, alt: 'SEOKRAFT, studio web à Strasbourg' }], title, description, url: 'https://www.seokraft.fr/blog/etre-visible-chatgpt', type: 'article' } };

const article = {
 title,
 slug: 'etre-visible-chatgpt',
 eyebrow: 'ChatGPT · Visibilité · Guide pratique',
 date: '2026-10-26',
 intro: 'De plus en plus de clients posent directement leurs questions à ChatGPT : « quel artisan contacter ? », « quel prestataire choisir pour mon site ? ». Il n’existe ni inscription ni formule payante pour y être recommandé. En revanche, plusieurs actions concrètes augmentent les chances que votre entreprise soit trouvée, comprise et citée. Voici lesquelles, en commençant par les réglages techniques que beaucoup de sites oublient.',
 sections: [
  { heading: 'Comment ChatGPT trouve ses informations', paragraphs: [
   'ChatGPT peut répondre de deux façons. Soit à partir des connaissances acquises lors de son entraînement, qui s’arrêtent à une certaine date. Soit en effectuant une recherche sur le web en temps réel, puis en citant les pages consultées sous forme de liens.',
   'Pour une entreprise locale ou récente, c’est surtout la recherche en temps réel qui compte : elle permet d’apparaître même si votre activité est peu connue, à condition que vos pages soient accessibles et clairement rédigées.',
   'Les réponses ne sont jamais figées. Deux personnes posant la même question peuvent obtenir des réponses différentes, et votre entreprise peut être citée un jour puis absente le lendemain.'
  ]},
  { heading: 'Étape 1 : autoriser le robot de recherche d’OpenAI', paragraphs: [
   'OpenAI utilise plusieurs robots. Celui qui compte pour apparaître dans les résultats de recherche de ChatGPT s’appelle OAI-SearchBot. D’après la documentation d’OpenAI, un site qui le bloque n’apparaît pas dans les réponses de recherche de ChatGPT.',
   'Un autre robot, GPTBot, sert à l’entraînement des modèles. Vous pouvez choisir de le bloquer sans empêcher votre site d’apparaître dans la recherche : ce sont deux réglages indépendants.',
   'Vérifiez donc votre fichier robots.txt, et demandez à votre hébergeur ou à votre prestataire si un pare-feu ou un service de protection ne bloque pas ces robots par défaut. C’est une cause fréquente et invisible d’absence.'
  ]},
  { heading: 'Étape 2 : être bien indexé, sur Google et sur Bing', paragraphs: [
   'Les assistants s’appuient en partie sur des index de recherche existants. Un site mal indexé sur les moteurs classiques part donc avec un handicap.',
   'Inscrivez votre site dans Google Search Console, mais aussi dans Bing Webmaster Tools, souvent oublié. Soumettez votre sitemap dans les deux et vérifiez que vos pages importantes sont bien indexées.'
  ]},
  { heading: 'Étape 3 : une page claire pour chaque service', paragraphs: [
   'Une IA doit pouvoir répondre sans hésiter à quatre questions en lisant votre site : que faites-vous, pour qui, où, et comment vous contacter. Si ces informations sont dispersées ou floues, elle préférera citer un concurrent plus explicite.',
   'Créez une page par service important, avec la zone desservie, le déroulement de la prestation, des exemples de réalisations et, si possible, des tarifs indicatifs. Par exemple, notre page [création de site internet à Strasbourg](/creation-site-internet/strasbourg) répond directement à ces questions.'
  ]},
  { heading: 'Étape 4 : répondre aux questions de vos clients', paragraphs: [
   'Les utilisateurs de ChatGPT posent des questions complètes : « combien coûte un site vitrine pour un artisan ? », « quelle différence entre une conciergerie et une agence immobilière ? ». Les pages qui répondent précisément à ce type de question ont plus de chances d’être consultées et citées.',
   'Listez les questions que vos clients vous posent au téléphone ou par e-mail, et consacrez une page ou un article à chacune des plus fréquentes. Répondez dès le début, puis détaillez avec des exemples et des chiffres datés, comme dans notre guide sur le [prix d’un site internet](/blog/prix-site-internet).'
  ]},
  { heading: 'Étape 5 : exister en dehors de votre site', paragraphs: [
   'ChatGPT croise souvent plusieurs sources. Ce que l’on trouve sur vous ailleurs renforce votre crédibilité : profil LinkedIn complet, recommandations de clients, annuaires professionnels, articles ou partenaires qui vous mentionnent.',
   'Veillez à ce que le nom de votre entreprise, votre activité et votre zone soient décrits de la même manière partout. Des informations contradictoires rendent votre entreprise plus difficile à identifier.'
  ]},
  { heading: 'Comment vérifier les résultats', paragraphs: [
   'Testez régulièrement quelques questions réalistes dans ChatGPT, en activant la recherche web, par exemple « quel créateur de site internet à Strasbourg pour une petite entreprise ? ». Notez si votre entreprise apparaît et quelles sources sont citées : elles vous indiquent où il serait utile d’être présent.',
   'Dans votre outil de statistiques, surveillez les visites dont la source est chatgpt.com. Elles sont encore modestes pour la plupart des sites, mais ce sont souvent des visiteurs déjà bien informés.',
   'Enfin, demandez à vos nouveaux clients comment ils vous ont connu. C’est parfois le seul moyen de savoir qu’une recommandation est venue d’un assistant IA.'
  ]}
 ],
 conclusion: 'On ne s’inscrit pas sur ChatGPT : on le rend capable de vous trouver et de vous comprendre. Un site accessible aux bons robots, des pages claires, des réponses précises et une réputation cohérente sont les leviers qui comptent.'
};

export default function Page() { return <BlogArticle article={article} />; }
