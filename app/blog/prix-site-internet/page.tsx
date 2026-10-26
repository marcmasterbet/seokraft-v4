import type { Metadata } from 'next';
import BlogArticle from '../../../components/BlogArticle';

const title = 'Combien coûte un site internet en 2026 ?';
const description = 'Prix d’un site internet en 2026 : site fait soi-même, freelance ou agence, coûts annuels, ce qui fait varier le tarif et les pièges à éviter. Exemples concrets.';

export const metadata: Metadata = { title: `${title} | SEOKRAFT`, description, alternates: { canonical: '/blog/prix-site-internet' }, robots: { index: true, follow: true }, openGraph: { title, description, url: 'https://www.seokraft.fr/blog/prix-site-internet', type: 'article' } };

const article = {
 title,
 slug: 'prix-site-internet',
 eyebrow: 'Prix · Création de site internet',
 date: '2026-10-26',
 intro: 'C’est souvent la première question que l’on se pose avant de lancer son site, et les réponses trouvées en ligne vont de « gratuit » à plusieurs dizaines de milliers d’euros. Les deux sont vraies : tout dépend de ce que vous attendez de votre site. Voici des repères concrets pour comprendre les prix, comparer les offres et préparer votre budget sans mauvaise surprise.',
 sections: [
  { heading: 'La réponse courte', paragraphs: [
   'Pour un site vitrine professionnel, on observe en France trois grandes familles de prix. Un site fait soi-même avec un outil en ligne coûte généralement de quelques dizaines à quelques centaines d’euros par an. Un freelance démarre souvent autour de 500 € pour un projet très simple, et se situe plus couramment entre 1 000 € et 4 000 € pour un site sur mesure. Une agence commence en général autour de 2 000 € et peut dépasser 10 000 € pour un projet complet.',
   'À cela s’ajoutent des coûts annuels : nom de domaine, hébergement et maintenance. Ils sont souvent oubliés au moment de comparer les devis, alors qu’ils font partie du coût réel de votre site sur plusieurs années.',
   'Ces chiffres restent indicatifs. Deux devis au même prix peuvent recouvrir des prestations très différentes : c’est le contenu de l’offre qui compte, bien plus que le montant affiché.'
  ]},
  { heading: 'Faire son site soi-même : le moins cher, mais pas gratuit', paragraphs: [
   'Les créateurs de sites en ligne comme Wix, Squarespace ou les offres WordPress hébergées permettent de démarrer rapidement. Les abonnements vont d’une dizaine d’euros à plusieurs dizaines d’euros par mois selon les fonctionnalités, souvent avec un tarif réduit en engagement annuel.',
   'Le vrai coût est ailleurs : votre temps. Choisir un modèle, rédiger les textes, trouver les photos, régler l’affichage mobile et les bases du référencement demande souvent plusieurs jours, voire plusieurs semaines, quand ce n’est pas votre métier.',
   'Cette solution convient bien pour tester une idée ou lancer une activité avec un budget très serré. Elle montre ses limites lorsque vous voulez une image vraiment professionnelle, des fonctionnalités spécifiques ou un site qui se distingue de ceux de vos concurrents construits sur les mêmes modèles.'
  ]},
  { heading: 'Passer par un freelance', paragraphs: [
   'Un développeur ou designer indépendant offre souvent le meilleur équilibre entre prix et accompagnement. Vous échangez directement avec la personne qui réalise votre site, sans intermédiaire, ce qui simplifie les échanges et les ajustements.',
   'Les écarts de prix entre freelances sont importants. Un site à quelques centaines d’euros repose généralement sur un modèle existant légèrement adapté, avec vos textes fournis tels quels. Un site à plusieurs milliers d’euros inclut plutôt une réflexion sur la structure, un design sur mesure, la rédaction ou la réécriture des contenus et des bases de référencement.',
   'Le point à vérifier : la disponibilité dans la durée. Demandez qui assure l’hébergement, les mises à jour et les corrections une fois le site en ligne.'
  ]},
  { heading: 'Faire appel à une agence', paragraphs: [
   'Une agence mobilise plusieurs profils : chef de projet, designer, développeur, rédacteur, parfois spécialiste du référencement. C’est un vrai atout pour les projets complexes, les sites avec de nombreuses pages ou les entreprises qui ont besoin d’une organisation structurée.',
   'Ce fonctionnement a un coût. Les tarifs d’agence démarrent généralement autour de 2 000 € pour un site vitrine et montent rapidement selon le nombre de pages, les fonctionnalités et le niveau de personnalisation.',
   'Pour un artisan, un indépendant ou une petite association, une agence n’est pas toujours nécessaire. Un freelance expérimenté peut offrir un résultat comparable sur un site vitrine, avec un interlocuteur unique.'
  ]},
  { heading: 'Ce qui fait vraiment varier le prix', paragraphs: [
   'Le nombre de pages est le premier facteur : chaque page doit être pensée, rédigée, mise en forme et testée sur ordinateur et sur mobile. Un site d’une page de présentation n’a pas le même coût qu’un site de huit pages détaillant chacun de vos services.',
   'Le design compte ensuite. Un modèle adapté coûte moins cher qu’une identité conçue sur mesure, mais votre site risque de ressembler à beaucoup d’autres. Les contenus pèsent aussi dans la balance : si vous fournissez des textes prêts à publier, le travail est plus court que si vos textes doivent être rédigés pour convaincre et être bien compris par Google.',
   'Enfin, les fonctionnalités font la plus grosse différence. Un formulaire de contact est simple. La prise de rendez-vous en ligne, le paiement, un espace client, un catalogue ou un système de réservation demandent du développement supplémentaire et sont presque toujours chiffrés à part.'
  ]},
  { heading: 'Les coûts annuels à ne pas oublier', paragraphs: [
   'Un nom de domaine en .fr ou .com coûte en général entre 10 € et 50 € par an. L’hébergement d’un site vitrine démarre autour de quelques dizaines d’euros par an pour une offre basique, et augmente avec le trafic et les besoins techniques.',
   'La maintenance est le poste le plus souvent sous-estimé. Un site doit être sauvegardé, mis à jour et surveillé pour rester sécurisé et rapide. Selon les prestataires, elle est facturée à l’année, au mois ou à l’intervention, et le niveau de service varie énormément : simple hébergement, mises à jour techniques, petites modifications de contenu, assistance.',
   'Pour comparer deux offres, calculez le coût total sur trois ans : création, plus trois années de domaine, d’hébergement et de maintenance. C’est souvent plus révélateur que le prix de départ.'
  ]},
  { heading: 'Les pièges d’un site trop bon marché', paragraphs: [
   'Un devis très bas cache parfois des frais qui arrivent plus tard : modifications facturées une par une, hébergement imposé à un prix élevé, ou maintenance non prévue. Demandez toujours ce qui est inclus, et ce qui ne l’est pas.',
   'Vérifiez aussi la propriété de votre site et de votre nom de domaine. Le domaine doit idéalement être à votre nom, et les conditions de récupération du site en cas de changement de prestataire doivent être écrites dans le contrat.',
   'Enfin, un site qui ne génère aucun contact n’est jamais une bonne affaire, même à petit prix. La clarté du message, la qualité des textes et la facilité de contact comptent davantage que quelques centaines d’euros d’écart sur le devis.'
  ]},
  { heading: 'Un exemple concret : les tarifs de SEOKRAFT', paragraphs: [
   'Par souci de transparence, voici nos propres tarifs. Chez SEOKRAFT, un site sur mesure démarre à 1 990 € TTC pour une page, 2 990 € TTC pour un site vitrine de 4 pages et 4 190 € TTC pour 8 pages. Ce prix comprend la réflexion sur la structure, le design sur mesure, la version mobile, le copywriting professionnel, les bases du référencement, le formulaire de contact et la mise en ligne.',
   'L’hébergement et la maintenance représentent 49 € TTC par mois, avec un engagement initial de 12 mois. Les fonctionnalités spécifiques comme la réservation en ligne, un espace client ou un blog sont chiffrées sur devis.',
   'Un simulateur est disponible sur la page d’accueil pour estimer votre projet en quelques secondes selon le nombre de pages et les options souhaitées.'
  ]},
  { heading: 'Comment préparer votre budget', paragraphs: [
   'Avant de demander des devis, clarifiez trois choses : l’objectif principal de votre site (être trouvé, rassurer, recevoir des demandes, vendre), les pages dont vous avez besoin, et les fonctionnalités indispensables. Quelques sites que vous aimez, chez vos concurrents ou ailleurs, aident aussi beaucoup à vous faire comprendre.',
   'Demandez ensuite deux ou trois devis détaillés, avec le même périmètre pour pouvoir les comparer. Un bon devis précise le nombre de pages, qui rédige les textes, ce qui est prévu pour le référencement, les délais, les coûts annuels et les conditions de propriété.',
   'Enfin, pensez votre site comme un investissement : s’il vous apporte un ou deux clients supplémentaires par an, il est souvent rentabilisé bien avant la fin de sa première année.'
  ]}
 ],
 conclusion: 'Le bon prix d’un site internet n’est pas le plus bas : c’est celui qui correspond à vos objectifs, avec un périmètre clair et des coûts annuels connus dès le départ.'
};

export default function Page() { return <BlogArticle article={article} />; }
