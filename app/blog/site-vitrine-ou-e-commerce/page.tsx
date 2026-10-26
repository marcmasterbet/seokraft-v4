import type { Metadata } from 'next';
import BlogArticle from '../../../components/BlogArticle';

const title = 'Site vitrine ou site e-commerce : que choisir ?';
const description = 'Site vitrine ou boutique en ligne ? Différences, coûts, obligations légales et cas concrets pour choisir le bon type de site selon votre activité.';

export const metadata: Metadata = { title: `${title} | SEOKRAFT`, description, alternates: { canonical: '/blog/site-vitrine-ou-e-commerce' }, robots: { index: true, follow: true }, openGraph: { title, description, url: 'https://www.seokraft.fr/blog/site-vitrine-ou-e-commerce', type: 'article' } };

const article = {
 title,
 slug: 'site-vitrine-ou-e-commerce',
 eyebrow: 'Création de site · Choisir',
 date: '2026-10-26',
 intro: 'Avant de demander un devis, une question revient souvent : faut-il un simple site vitrine ou une vraie boutique en ligne ? Le choix a des conséquences sur le budget, le temps à consacrer au site chaque semaine et les obligations légales. Voici comment trancher selon votre activité, sans payer pour des fonctionnalités inutiles.',
 sections: [
  { heading: 'La différence en une phrase', paragraphs: [
   'Un site vitrine présente votre activité et pousse le visiteur à vous contacter : il sert à rassurer, expliquer et générer des demandes de devis, d’appels ou de rendez-vous.',
   'Un site e-commerce permet d’acheter directement en ligne : catalogue de produits, panier, paiement, gestion des commandes et des livraisons. La vente se conclut sur le site, sans échange préalable avec vous.',
   'Entre les deux, il existe des solutions intermédiaires : un site vitrine avec prise de rendez-vous en ligne, réservation, paiement d’un acompte ou vente de quelques produits. Pour beaucoup de petites entreprises, c’est la bonne réponse.'
  ]},
  { heading: 'Le site vitrine : pour qui ?', paragraphs: [
   'Le site vitrine convient à la majorité des artisans, prestataires de services, indépendants, professions libérales, associations et entreprises B2B. Leur client a besoin d’un devis, d’un échange ou d’un rendez-vous avant de s’engager.',
   'Son rôle est de répondre aux questions que se pose un client potentiel : que proposez-vous, pour qui, où, à quel prix, avec quelles garanties ? Des réalisations, des avis et une prise de contact simple font le reste.',
   'C’est aussi la solution la plus simple à faire vivre : une fois en ligne, un site vitrine demande peu de mises à jour, en dehors de vos actualités et de nouvelles réalisations.'
  ]},
  { heading: 'Le site e-commerce : pour qui ?', paragraphs: [
   'L’e-commerce s’adresse aux entreprises qui vendent des produits ou des prestations standardisées, avec un prix fixe et sans besoin de conseil personnalisé : un commerce qui veut vendre en ligne, un créateur, un producteur, une marque.',
   'Il demande davantage de travail au quotidien : photos et fiches produits, gestion des stocks, préparation des commandes, expéditions, retours, service client. Une boutique en ligne est une activité à part entière, pas seulement un site.',
   'Elle implique aussi des obligations spécifiques lorsque vous vendez à des particuliers : conditions générales de vente, informations précontractuelles, droit de rétractation de 14 jours dans la plupart des cas, paiement sécurisé et gestion des données personnelles.'
  ]},
  { heading: 'Les coûts ne sont pas les mêmes', paragraphs: [
   'Un site vitrine sur mesure coûte généralement de 1 000 € à 5 000 € selon le nombre de pages et le prestataire. Nous détaillons les fourchettes dans notre guide [combien coûte un site internet en 2026](/blog/prix-site-internet).',
   'Une boutique en ligne coûte plus cher à créer, car elle demande davantage de développement, de pages et de paramétrages. Il faut aussi prévoir des frais récurrents : abonnement à une plateforme ou maintenance renforcée, commissions sur les paiements, éventuellement des extensions payantes.',
   'Avant de vous lancer, estimez vos ventes en ligne réalistes. Si elles ne couvrent pas ces coûts récurrents, un site vitrine bien construit sera plus rentable.'
  ]},
  { heading: 'Quelques cas concrets', paragraphs: [
   'Un plombier, un électricien ou une entreprise de nettoyage : site vitrine. Le client veut un devis, un délai et de la confiance, pas un panier.',
   'Une conciergerie ou un gîte : site vitrine avec réservation ou formulaire de demande. La réservation en ligne apporte un vrai confort, sans les contraintes d’une boutique complète.',
   'Un coach, un thérapeute, un consultant : site vitrine avec prise de rendez-vous en ligne, éventuellement avec paiement à la réservation.',
   'Un commerce de décoration, une marque de cosmétiques, un producteur local : e-commerce, si vous avez le temps et l’organisation pour gérer les commandes. Sinon, commencez par un site vitrine présentant vos produits et vos points de vente.'
  ]},
  { heading: 'Commencer petit, évoluer ensuite', paragraphs: [
   'Rien n’oblige à tout faire dès le départ. Un site bien conçu peut commencer en vitrine, puis accueillir plus tard la prise de rendez-vous, un espace client ou une boutique lorsque le besoin est confirmé.',
   'La condition : prévoir cette évolution dès la conception, en choisissant une base technique capable de grandir. Parlez-en à votre prestataire avant de démarrer, même si vous ne l’utilisez pas tout de suite.'
  ]},
  { heading: 'Les questions à vous poser', paragraphs: [
   'Mes clients ont-ils besoin d’un échange avant d’acheter ? Si oui, privilégiez le site vitrine.',
   'Mes prix sont-ils fixes et mes produits faciles à expédier ? Si oui, l’e-commerce peut avoir du sens.',
   'Ai-je le temps de gérer des commandes chaque semaine ? Si non, commencez par une vitrine.',
   'Mes ventes en ligne couvriront-elles les frais de la boutique ? Faites le calcul avant de vous engager.',
   'Pour cadrer votre projet, consultez aussi notre article [que préparer avant de créer son site internet](/blog/preparer-creation-site-internet).'
  ]}
 ],
 conclusion: 'Le bon site n’est pas celui qui a le plus de fonctionnalités, c’est celui qui correspond à la façon dont vos clients achètent. Pour la plupart des petites entreprises, un site vitrine solide, éventuellement complété par la réservation, est le meilleur point de départ.'
};

export default function Page() { return <BlogArticle article={article} />; }
