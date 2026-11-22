import type { Metadata } from 'next';
import BlogArticle from '../../../components/BlogArticle';

const title = 'Pourquoi mon site n’apparaît pas sur Google ?';
const seoTitle = 'Site introuvable sur Google : 9 causes et solutions';
const description = 'Votre site n’apparaît pas sur Google ? Les 9 causes les plus fréquentes, comment les vérifier vous-même en quelques minutes, et quoi corriger en premier.';

export const metadata: Metadata = { title: `${seoTitle} | SEOKRAFT`, description, alternates: { canonical: '/blog/site-invisible-google' }, robots: { index: true, follow: true }, openGraph: { images: [{ url: '/opengraph-image.jpg', width: 1200, height: 630, alt: 'SEOKRAFT, création de sites internet à Strasbourg' }], title, description, url: 'https://www.seokraft.fr/blog/site-invisible-google', type: 'article' } };

const article = {
 title,
 slug: 'site-invisible-google',
 eyebrow: 'Google · Référencement',
 date: '2026-11-22',
 intro: 'Vous tapez votre métier et votre ville dans Google, puis vous faites défiler les pages… et votre site n’apparaît nulle part. C’est l’une des frustrations les plus courantes chez les dirigeants de petites entreprises. La bonne nouvelle : la cause est presque toujours identifiable, et souvent simple à corriger. Voici comment savoir où vous en êtes, puis les neuf raisons les plus fréquentes.',
 sections: [
  { heading: 'D’abord, vérifiez si Google connaît votre site', paragraphs: [
   'Deux situations très différentes se cachent derrière « je ne suis pas sur Google ». Soit Google ne connaît pas du tout votre site, soit il le connaît mais le place trop loin dans les résultats pour que quelqu’un le voie.',
   'Pour le savoir, tapez dans Google « site: » suivi de votre adresse, sans espace : par exemple site:monentreprise.fr. Si aucune page ne s’affiche, Google ne connaît pas votre site : le problème est technique (causes 1 à 4). Si vos pages s’affichent, Google les connaît mais ne les juge pas assez pertinentes : le problème vient du contenu ou de la concurrence (causes 5 à 9).'
  ]},
  { heading: 'Cause n°1 : votre site est trop récent', paragraphs: [
   'Un site mis en ligne il y a quelques jours n’est pas encore découvert par Google. Selon les cas, il faut compter de quelques jours à quelques semaines pour qu’il apparaisse, et plusieurs mois avant qu’il gagne des places sur des recherches concurrentielles.',
   'Pour accélérer les choses, déclarez votre site dans la Google Search Console, l’outil gratuit de Google, et envoyez-lui votre plan du site (le fichier sitemap). C’est la première chose à faire après une mise en ligne.'
  ]},
  { heading: 'Cause n°2 : votre site interdit à Google de l’afficher', paragraphs: [
   'C’est plus fréquent qu’on ne le croit. Pendant la construction d’un site, on active souvent une consigne qui demande à Google de ne pas l’afficher, pour ne pas montrer un chantier. Si personne ne la retire à la mise en ligne, le site reste invisible, parfois pendant des années.',
   'Cette consigne peut se trouver dans le code de vos pages (une balise « noindex ») ou dans un fichier appelé robots.txt. Sur WordPress, vérifiez aussi qu’une case « Demander aux moteurs de recherche de ne pas indexer ce site » n’est pas cochée dans les réglages de lecture.'
  ]},
  { heading: 'Cause n°3 : Google n’arrive pas à lire vos pages', paragraphs: [
   'Certains sites affichent leur contenu uniquement grâce à des scripts lourds, ou placent l’essentiel de leurs textes dans des images. Pour un visiteur, la page paraît normale. Pour Google, elle peut sembler presque vide.',
   'Un test simple : sélectionnez le texte de votre page d’accueil avec la souris. Si vos titres et vos phrases ne se sélectionnent pas, c’est probablement une image, et Google ne la lit pas comme un texte.'
  ]},
  { heading: 'Cause n°4 : des erreurs techniques bloquent l’accès', paragraphs: [
   'Un certificat de sécurité expiré (le cadenas à côté de l’adresse), des pages qui renvoient une erreur, un site qui existe en plusieurs versions (avec et sans « www », en http et en https) : ces problèmes brouillent les pistes et peuvent empêcher Google de retenir la bonne version de vos pages.',
   'La Search Console signale la plupart de ces erreurs dans sa rubrique sur l’indexation des pages. C’est le meilleur endroit pour comprendre pourquoi une page n’apparaît pas.'
  ]},
  { heading: 'Cause n°5 : vos pages ne disent pas clairement ce que vous faites', paragraphs: [
   'Google montre une page quand il est sûr qu’elle répond à la recherche. Si votre page d’accueil s’intitule « Accueil » ou « Bienvenue », si son titre principal est un slogan et si votre métier n’apparaît qu’en bas de page, Google hésite, et il choisit un concurrent plus explicite.',
   'Chaque page devrait avoir un titre clair, qui dit votre métier et, pour une activité locale, votre ville : par exemple « Couvreur à Molsheim, toiture et zinguerie » plutôt que « Bienvenue chez Dupont ».'
  ]},
  { heading: 'Cause n°6 : une seule page pour tous vos services', paragraphs: [
   'Chaque service que vous proposez correspond à une recherche différente. Un plombier ne sera pas cherché de la même façon pour une fuite, une chaudière ou une salle de bain. Avec une seule page qui résume tout, vous ne pouvez répondre précisément à aucune de ces recherches.',
   'Une page par service principal, avec un vrai texte qui explique ce que vous faites, pour qui et où, multiplie vos chances d’être trouvé.'
  ]},
  { heading: 'Cause n°7 : trop peu de texte', paragraphs: [
   'Google ne devine pas : il lit. Une page qui ne contient que quelques lignes et trois photos ne lui donne pas assez d’informations pour comprendre votre activité et la juger utile.',
   'Il ne s’agit pas d’écrire pour remplir, mais de répondre aux questions que se posent vos clients : ce que vous faites exactement, dans quel secteur, en combien de temps, à quel prix approximatif, avec quelles garanties.'
  ]},
  { heading: 'Cause n°8 : la ville n’apparaît nulle part', paragraphs: [
   'Pour une entreprise locale, la majorité des recherches contiennent un lieu : « électricien Strasbourg », « paysagiste Haguenau ». Si votre ville et votre secteur d’intervention n’apparaissent ni dans vos titres ni dans vos textes, vous passez à côté de ces recherches.',
   'C’est tout l’enjeu du référencement local, que nous détaillons dans notre article sur [comment être trouvé par les clients de votre ville](/blog/referencement-local-strasbourg).'
  ]},
  { heading: 'Cause n°9 : la concurrence est simplement mieux préparée', paragraphs: [
   'Parfois, votre site est correct, mais vos concurrents ont plus de pages, de meilleurs textes, des avis clients, et sont en ligne depuis plus longtemps. Google les juge alors plus pertinents que vous.',
   'Dans ce cas, il n’y a pas de bouton magique : il faut renforcer votre site page après page, avec des contenus utiles, et obtenir des liens depuis d’autres sites sérieux (annuaires professionnels, partenaires, presse locale).'
  ]},
  { heading: 'Par quoi commencer ?', paragraphs: [
   'Réglez d’abord ce qui empêche Google de voir votre site (causes 1 à 4) : tant que ces blocages existent, le reste ne sert à rien. Ensuite, travaillez la clarté de vos pages : titres, une page par service, ville, textes utiles.',
   'Si vous ne savez pas par où commencer, notre [audit gratuit de votre site](/audit-gratuit) vérifie ces points pour vous et vous indique les trois problèmes à corriger en priorité. Et si votre site demande davantage, découvrez notre accompagnement en [référencement à Strasbourg](/seo/strasbourg).'
  ]}
 ],
 conclusion: 'Un site invisible sur Google n’est presque jamais une fatalité : un blocage technique ou des pages trop floues en sont généralement la cause. Vérifiez d’abord que Google peut voir votre site, puis aidez-le à comprendre ce que vous faites et où.'
};

export default function Page() { return <BlogArticle article={article} />; }
