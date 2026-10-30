import type { Metadata } from 'next';
import BlogArticle from '../../../components/BlogArticle';

const title = 'Que préparer avant de créer son site internet ?';
const description = 'Objectifs, pages, textes, photos, nom de domaine, budget : la check-list pour préparer la création de votre site internet et obtenir des devis comparables.';

export const metadata: Metadata = { title: `${title} | SEOKRAFT`, description, alternates: { canonical: '/blog/preparer-creation-site-internet' }, robots: { index: true, follow: true }, openGraph: { images: [{ url: '/opengraph-image.jpg', width: 1200, height: 630, alt: 'SEOKRAFT, studio web à Strasbourg' }], title, description, url: 'https://www.seokraft.fr/blog/preparer-creation-site-internet', type: 'article' } };

const article = {
 title,
 slug: 'preparer-creation-site-internet',
 eyebrow: 'Création de site · Check-list',
 date: '2026-10-26',
 intro: 'Un projet de site bien préparé avance plus vite, coûte moins cher en allers-retours et donne un meilleur résultat. Pas besoin d’un cahier des charges de cinquante pages : quelques réponses claires suffisent pour obtenir des devis précis et démarrer sur de bonnes bases. Voici la check-list à remplir avant de contacter un prestataire.',
 sections: [
  { heading: '1. L’objectif principal de votre site', paragraphs: [
   'Que doit faire votre site pour votre entreprise ? Recevoir des demandes de devis, faire réserver des rendez-vous, rassurer des clients qui vous ont déjà trouvés, présenter une association, vendre en ligne ?',
   'Choisissez un objectif principal, éventuellement un ou deux secondaires. Tout le reste en découle : la structure des pages, les textes, les boutons d’action et les fonctionnalités nécessaires. Si vous hésitez sur le type de site, lisez notre article [site vitrine ou site e-commerce](/blog/site-vitrine-ou-e-commerce).'
  ]},
  { heading: '2. Vos clients et leurs questions', paragraphs: [
   'Qui sont vos clients idéaux ? Particuliers ou professionnels, de quelle zone, avec quels besoins ? Notez les questions qu’ils vous posent le plus souvent au téléphone ou par e-mail.',
   'Ces questions sont une mine d’or : elles indiquent ce que votre site doit expliquer, et ce que vos futurs clients tapent dans Google ou demandent aux assistants IA.'
  ]},
  { heading: '3. La liste des pages', paragraphs: [
   'Dressez une première liste des pages dont vous pensez avoir besoin. Pour un site vitrine classique : accueil, une page par service important, réalisations, à propos, contact. Ajoutez une FAQ, un blog ou une page tarifs si cela a du sens.',
   'Le nombre de pages est l’un des premiers facteurs de prix. Une liste claire permet d’obtenir des devis comparables, et votre prestataire pourra vous conseiller pour l’ajuster.'
  ]},
  { heading: '4. Vos contenus : textes, photos, logo', paragraphs: [
   'Les contenus sont la cause de retard la plus fréquente dans un projet de site. Faites le point dès maintenant sur ce que vous avez déjà et ce qu’il faudra produire.',
   'Textes : allez-vous les rédiger vous-même, ou faut-il prévoir une rédaction professionnelle ? Des textes clairs et convaincants font souvent plus pour vos demandes de contact que le design.',
   'Photos : des photos réelles de votre équipe, de vos locaux et de vos réalisations inspirent bien plus confiance que des images de banque d’images. Si nécessaire, prévoyez une séance photo.',
   'Logo et identité : avez-vous un logo en bonne qualité, des couleurs, une typographie ? Sinon, le prestataire pourra proposer une identité simple ou vous orienter.'
  ]},
  { heading: '5. Des exemples de sites que vous aimez', paragraphs: [
   'Rassemblez trois à cinq sites qui vous plaisent, dans votre secteur ou ailleurs, et notez pourquoi : l’ambiance, la clarté, une fonctionnalité, la façon de présenter les prix.',
   'Notez aussi ce que vous n’aimez pas. Ces exemples font gagner beaucoup de temps et évitent les malentendus sur le style attendu.'
  ]},
  { heading: '6. Les fonctionnalités nécessaires', paragraphs: [
   'Formulaire de contact, prise de rendez-vous, réservation, paiement en ligne, espace client, blog, plusieurs langues : listez ce qui est indispensable dès le lancement et ce qui peut attendre.',
   'Les fonctionnalités spécifiques sont presque toujours chiffrées à part. Distinguer l’indispensable du « plus tard » vous permet de maîtriser le budget tout en préparant l’évolution du site.'
  ]},
  { heading: '7. Nom de domaine, accès et aspects pratiques', paragraphs: [
   'Avez-vous déjà un nom de domaine ? Si oui, vérifiez qu’il est bien à votre nom et retrouvez vos accès. Sinon, réfléchissez à quelques noms courts et faciles à retenir.',
   'Listez aussi vos accès existants : ancien site, hébergement, adresse e-mail professionnelle, statistiques. Dans le cas d’une refonte, ces informations sont indispensables. Notre article [comment savoir si votre site doit être refait](/blog/refonte-site-internet) détaille les précautions à prendre.',
   'Pensez enfin aux aspects légaux : mentions légales, politique de confidentialité et, si vous vendez en ligne, conditions générales de vente.'
  ]},
  { heading: '8. Votre budget et votre calendrier', paragraphs: [
   'Fixez une fourchette de budget, en incluant les coûts annuels d’hébergement et de maintenance. Si vous ne savez pas par où commencer, notre guide [combien coûte un site internet en 2026](/blog/prix-site-internet) donne des repères.',
   'Indiquez aussi une date souhaitée de mise en ligne, et si elle est liée à un événement : ouverture, salon, lancement d’une offre. Un calendrier réaliste tient compte du temps nécessaire pour préparer les contenus et valider les étapes.'
  ]}
 ],
 conclusion: 'Avec un objectif clair, une liste de pages, vos contenus et quelques exemples, vous êtes prêt à demander des devis comparables. Le reste se construit avec votre prestataire, étape par étape.'
};

export default function Page() { return <BlogArticle article={article} />; }
