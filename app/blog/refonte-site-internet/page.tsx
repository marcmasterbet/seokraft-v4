import type { Metadata } from 'next';
import BlogArticle from '../../../components/BlogArticle';

const title = 'Comment savoir si votre site internet doit être refait ?';
const seoTitle = 'Faut-il refaire son site internet ? Les 8 signes';
const description = 'Site lent, daté, inadapté au mobile ou sans contacts ? Les 8 signes qu’une refonte s’impose, et comment la réussir sans perdre votre référencement.';

export const metadata: Metadata = { title: `${seoTitle} | SEOKRAFT`, description, alternates: { canonical: '/blog/refonte-site-internet' }, robots: { index: true, follow: true }, openGraph: { images: [{ url: '/opengraph-image.jpg', width: 1200, height: 630, alt: 'SEOKRAFT, studio web à Strasbourg' }], title, description, url: 'https://www.seokraft.fr/blog/refonte-site-internet', type: 'article' } };

const article = {
 title,
 slug: 'refonte-site-internet',
 eyebrow: 'Refonte · Site internet',
 date: '2026-10-26',
 intro: 'Votre site existe depuis quelques années, mais vous hésitez à le montrer ? Vous n’êtes pas seul. Un site vieillit plus vite qu’on ne le pense : technologies, usages mobiles et attentes des clients évoluent en permanence. Voici les signes qui montrent qu’une refonte devient nécessaire, et les précautions à prendre pour ne pas perdre ce qui fonctionne déjà.',
 sections: [
  { heading: 'Signe n°1 : votre site n’est pas agréable sur mobile', paragraphs: [
   'Une grande partie des visites se fait aujourd’hui sur smartphone. Si vos visiteurs doivent zoomer, si les boutons sont trop petits ou si les menus débordent de l’écran, ils partiront avant d’avoir lu votre offre.',
   'Faites le test vous-même : ouvrez votre site sur votre téléphone et essayez de trouver vos tarifs, puis de vous contacter. Si cela vous agace, vos clients aussi.'
  ]},
  { heading: 'Signe n°2 : il est lent', paragraphs: [
   'Un site qui met plusieurs secondes à s’afficher perd des visiteurs à chaque instant d’attente. La vitesse fait aussi partie des signaux pris en compte par Google pour évaluer l’expérience des pages.',
   'Des images trop lourdes, un thème surchargé ou de nombreuses extensions accumulées au fil des années sont souvent en cause. Au-delà d’un certain point, il est plus efficace de repartir sur une base saine que de corriger à la marge.'
  ]},
  { heading: 'Signe n°3 : il ne reflète plus votre entreprise', paragraphs: [
   'Vos services ont évolué, vos tarifs ont changé, vous avez de nouvelles réalisations ou un nouveau positionnement, mais votre site raconte encore l’histoire d’il y a cinq ans.',
   'Un client qui découvre une offre dépassée ou des informations contradictoires doute. Votre site doit être la version la plus juste de votre entreprise, pas un souvenir.'
  ]},
  { heading: 'Signe n°4 : il ne génère aucun contact', paragraphs: [
   'Un site qui reçoit des visites mais aucune demande a un problème de message, de structure ou de confiance : offre floue, absence de preuves, formulaire difficile à trouver, pas d’appel à l’action clair.',
   'Une refonte est l’occasion de repenser le parcours du visiteur : comprendre l’offre en quelques secondes, être rassuré par des réalisations et des avis, puis vous contacter facilement.'
  ]},
  { heading: 'Signe n°5 : vous ne pouvez pas le modifier', paragraphs: [
   'Changer un horaire ou ajouter une photo ne devrait pas demander des semaines ni une facture à chaque fois. Si vous dépendez entièrement d’un prestataire injoignable ou d’un outil que plus personne ne maîtrise, votre site devient un frein.',
   'Lors d’une refonte, clarifiez dès le départ ce que vous pourrez modifier vous-même et ce qui restera à la charge du prestataire.'
  ]},
  { heading: 'Signes n°6 à 8 : sécurité, image et visibilité', paragraphs: [
   'Sécurité : un site dont les composants ne sont plus mis à jour, ou qui n’affiche pas le cadenas HTTPS, expose vos visiteurs et votre réputation.',
   'Image : un design daté donne l’impression d’une entreprise moins sérieuse, même si votre travail est excellent. Vos concurrents ont peut-être modernisé leur site.',
   'Visibilité : si votre site n’apparaît sur aucune recherche liée à votre métier et à votre ville, sa structure et ses contenus sont probablement à revoir.'
  ]},
  { heading: 'Refonte : les précautions à ne pas oublier', paragraphs: [
   'Ne perdez pas votre référencement. Avant la refonte, listez les pages qui reçoivent des visites et celles qui sont bien positionnées. Si leurs adresses changent, mettez en place des redirections permanentes (301) de l’ancienne adresse vers la nouvelle. Sans cela, vous repartez de zéro sur Google.',
   'Gardez ce qui fonctionne. Les contenus qui répondent bien aux questions de vos clients, vos avis et vos réalisations doivent être conservés et améliorés, pas supprimés.',
   'Vérifiez la propriété de votre nom de domaine et de vos accès : hébergement, statistiques, Search Console. Ils doivent être à votre nom avant de changer de prestataire.',
   'Après la mise en ligne, surveillez la Search Console pendant quelques semaines pour repérer les erreurs et les pages introuvables.'
  ]},
  { heading: 'Refaire ou améliorer ?', paragraphs: [
   'Tout ne justifie pas une refonte complète. Si votre site est récent, rapide et bien construit, quelques améliorations ciblées suffisent parfois : réécriture de la page d’accueil, nouvelles pages de services, meilleur formulaire de contact.',
   'En revanche, si plusieurs des signes ci-dessus s’accumulent, une refonte sera souvent plus rentable qu’une série de corrections. Pour estimer le budget, consultez notre guide [combien coûte un site internet en 2026](/blog/prix-site-internet), ou découvrez notre accompagnement en [création et refonte de site à Strasbourg](/creation-site-internet/strasbourg).'
  ]}
 ],
 conclusion: 'Si votre site vous gêne au moment de donner votre adresse web à un client, c’est souvent le signe le plus fiable. Une refonte bien préparée modernise votre image sans sacrifier le référencement déjà acquis.'
};

export default function Page() { return <BlogArticle article={article} />; }
