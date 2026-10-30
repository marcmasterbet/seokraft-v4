/**
 * Textes de la page d'accueil — rédigés par Jeff Bond (copywriter), intégrés mot pour mot.
 * Ne pas reformuler : toute modification doit venir de Jeff / Marc.
 * Choix validés par Marc (28/10/2026) : numéros des étapes retirés, 2e partie des titres en italique olive,
 * résumés de Jeff dans les cartes d'avis, logo « Studio web indépendant ».
 * Allègement validé par Marc (28/10/2026) : textes conservés ici mais NON affichés —
 *   tarifs.offerLead + offerList, tarifs.hostingLabel/hostingText, inclus.after,
 *   hebergement.after + accent, recommandations.accent (doublons). Pour les réafficher, voir Home.tsx / Testimonials.tsx.
 */

/** Titre en deux parties : la seconde s'affiche en italique olive. */
export type Title = [string, string];

export const meta = {
 title: "Studio web à Strasbourg : création, refonte & SEO | SEOKRAFT",
 description: "SEOKRAFT, studio web à Strasbourg : création et refonte de sites internet, développement sur mesure, copywriting et SEO. Parlons de votre projet."
};

/* BLOC 1 — HERO */
export const hero = {
 eyebrow: "STUDIO WEB INDÉPENDANT · STRASBOURG · ALSACE",
 title: ["Studio web à Strasbourg : ", "votre site doit convaincre, pas seulement exister"] as Title, // le point final est affiché après
 accent: "Votre futur client ne devrait pas avoir à chercher pourquoi il doit vous choisir.",
 paragraphs: [
  "Lorsqu'un prospect découvre votre site internet, il doit comprendre rapidement ce que vous proposez, ce qui vous différencie et comment vous contacter.",
  "Je crée et refonds des sites internet professionnels pour les entreprises, artisans et indépendants. Design sur mesure, développement web, copywriting et référencement naturel : chaque élément est pensé pour valoriser votre activité et faciliter les prises de contact.",
  "Basé à Strasbourg, j'accompagne vos projets en Alsace et partout en France."
 ],
 primary: "Parlons de votre projet",
 secondary: "Réserver un appel gratuit de 20 minutes",
 link: "Voir mes réalisations"
};

/* BLOC 2 — LE PROBLÈME (chaque entrée = un paragraphe ; accent = ligne en italique) */
export const probleme = {
 eyebrow: "UN SITE UTILE À VOTRE ACTIVITÉ",
 title: ["Votre site reçoit des visiteurs. ", "Mais combien repartent sans vous contacter ?"] as Title,
 blocks: [
  { text: "Un prospect cherche un professionnel comme vous." },
  { text: "Il découvre votre entreprise, consulte vos prestations et commence à comparer." },
  { text: "Mais votre offre manque de clarté. Certaines informations sont difficiles à trouver. Sur smartphone, la navigation lui demande trop d'efforts." },
  { text: "Il hésite." },
  { text: "Puis il poursuit ses recherches ailleurs." },
  { text: "Vous voyez les demandes que votre site génère. Pas toutes les opportunités qu'il pourrait vous faire manquer.", accent: true },
  { text: "Un site vieillissant ou mal structuré peut fragiliser la confiance, même lorsque votre entreprise propose d'excellentes prestations." },
  { text: "C'est pourquoi je ne commence pas par choisir un design." },
  { text: "Je cherche d'abord à comprendre votre activité, les attentes de vos clients et les actions que vous souhaitez leur faire réaliser." },
  { text: "L'objectif : créer un parcours simple, de la découverte de votre offre jusqu'à la prise de contact.", accent: true }
 ]
};

/* BLOC 3 — LES PRESTATIONS */
export const prestations = {
 eyebrow: "DES SOLUTIONS WEB POUR VOTRE ENTREPRISE",
 title: ["Votre activité a ses propres besoins. ", "Votre site doit y répondre."] as Title,
 paragraphs: [
  "Créer votre première présence en ligne, moderniser votre site ou développer des fonctionnalités spécifiques : chaque projet appelle une réponse différente.",
  "Chez SEOKRAFT, je conçois des solutions adaptées à votre métier, sans ajouter de complexité inutile."
 ],
 button: "Discutons de votre projet web",
 items: [
  { title: "Création de sites internet", href: "/creation-site-internet/strasbourg",
    question: "Vous lancez votre entreprise ou souhaitez enfin disposer d'une présence en ligne professionnelle ?",
    text: "Je crée des sites vitrines qui présentent clairement votre activité, valorisent vos prestations et permettent à vos visiteurs de vous contacter facilement.",
    benefit: "un site qui inspire confiance dès la première visite." },
  { title: "Refonte de sites internet", href: "#contact",
    question: "Votre entreprise a évolué, mais votre site ne reflète plus son niveau d'exigence ?",
    text: "Je retravaille sa structure, son design, sa navigation et ses contenus pour offrir une expérience plus claire, notamment sur mobile.",
    benefit: "une image digitale plus cohérente avec la qualité de votre entreprise." },
  { title: "Développement web sur mesure", href: "#contact",
    question: "Vous avez besoin de fonctionnalités qui dépassent celles d'un site vitrine classique ?",
    text: "Prise de rendez-vous, paiement en ligne, espace client ou plateforme web : je développe des solutions adaptées aux usages de votre activité.",
    benefit: "des fonctionnalités conçues autour de vos besoins réels." },
  { title: "Référencement SEO & GEO", href: "/seo/strasbourg",
    question: "Vous souhaitez améliorer la visibilité de votre entreprise sur Google et dans les nouveaux environnements de recherche ?",
    text: "Je vous accompagne sur la structure technique, les contenus et les informations qui permettent aux moteurs de recherche de mieux comprendre votre activité.",
    benefit: "une présence en ligne travaillée pour répondre aux recherches pertinentes de vos futurs clients." }
 ],
 benefitLabel: "Votre bénéfice :"
};

/* BLOC 4 — LES RÉALISATIONS */
export const realisations = {
 eyebrow: "SÉLECTION DE PROJETS WEB",
 title: ["Vous voulez savoir ce que je peux créer ? ", "Regardez ce que j'ai déjà réalisé."] as Title,
 paragraphs: [
  "Chaque projet présenté ici répond à un besoin différent.",
  "L'un devait rendre accessible une expertise technologique exigeante. L'autre devait organiser la mise en relation de plusieurs catégories d'utilisateurs.",
  "Deux problématiques. Deux réponses adaptées."
 ],
 labels: { need: "LE BESOIN", solution: "LA RÉALISATION", features: "POINTS CLÉS" },
 projects: [
  { kind: "remus", name: "REMUS SYSTEMS", url: "https://remussystems.fr",
    tag: "Site internet sur mesure · Technologies et innovation",
    need: "Présenter une activité technologique complexe sans perdre le visiteur dans des explications difficiles à comprendre.",
    solution: "Un site vitrine à l'identité visuelle affirmée, avec une organisation claire des expertises et des pages consacrées aux solutions, à l'audit et à la recherche.",
    features: ["Identité visuelle premium.", "Présentation structurée des expertises.", "Navigation adaptée aux smartphones."],
    button: "Découvrir REMUS SYSTEMS" },
  { kind: "loca", name: "LOCA DIRECT", url: "https://www.loca-direct.fr",
    tag: "Développement de plateforme web · Location saisonnière",
    need: "Réunir propriétaires, voyageurs et prestataires au sein d'une même plateforme, avec des usages différents.",
    solution: "Un environnement web structuré autour de plusieurs profils utilisateurs, de la présentation des biens et de la mise en relation.",
    features: ["Comptes utilisateurs.", "Présentation des biens.", "Fonctionnalités de mise en relation."],
    button: "Découvrir LOCA DIRECT" }
 ],
 accent: "Un projet web réussi ne se résume pas à son apparence. Il doit répondre à un besoin concret."
};

/* BLOC 5 — SEO & GEO */
export const seoGeo = {
 eyebrow: "RÉFÉRENCEMENT NATUREL · VISIBILITÉ EN LIGNE",
 title: ["Votre site peut être excellent. ", "Encore faut-il que les bons prospects le découvrent."] as Title,
 intro: [
  "Imaginez qu'un client recherche votre prestation sur Google.",
  "Il trouve plusieurs entreprises de votre secteur, compare leurs offres et prend contact avec l'une d'elles.",
  "Votre site aurait peut-être répondu parfaitement à son besoin.",
  "Mais s'il n'apparaît pas sur les recherches pertinentes, ce prospect risque de ne jamais le découvrir."
 ],
 accent: "Le référencement naturel sert à rapprocher votre entreprise des personnes qui recherchent réellement ses services.",
 lead: "Chez SEOKRAFT, je travaille plusieurs dimensions complémentaires.",
 dimensions: [
  ["SEO technique", "Une structure cohérente, des pages correctement organisées et une attention portée aux performances du site."],
  ["SEO éditorial", "Des contenus construits autour des intentions de recherche, avec des titres pertinents, un vocabulaire métier naturel et des informations utiles."],
  ["Référencement local", "Une présence digitale cohérente avec votre zone d'activité, notamment Strasbourg, l'Eurométropole, le Bas-Rhin et l'Alsace."],
  ["GEO et recherches assistées par IA", "Des informations claires, structurées et fiables pour faciliter la compréhension de votre entreprise dans les nouveaux environnements de recherche."]
 ],
 outro: [
  "Aucun professionnel sérieux ne peut garantir une première position sur Google ou une recommandation par une intelligence artificielle.",
  "En revanche, il est possible de travailler méthodiquement les éléments qui favorisent la compréhension et la découverte de votre site."
 ],
 button: "Découvrir mon accompagnement SEO & GEO"
};

/* BLOC 6 — À PROPOS */
export const aPropos = {
 eyebrow: "UN STUDIO WEB À TAILLE HUMAINE",
 title: ["15 ans d'expérience dans le développement. ", "Un seul interlocuteur pour votre site."] as Title,
 paragraphs: [
  "Je suis Marc Bretzner, fondateur de SEOKRAFT.",
  "Depuis 15 ans, je travaille dans le développement informatique. Cette expérience me permet aujourd'hui de concevoir des sites internet et des solutions web adaptés aux besoins des professionnels.",
  "Mais la technique ne suffit pas à réussir un projet.",
  "Il faut aussi comprendre votre métier, savoir présenter vos services et faciliter la vie de vos visiteurs.",
  "C'est pourquoi j'associe développement, design, expérience utilisateur et copywriting. Selon les besoins, je travaille également avec un partenaire spécialisé dans la rédaction de textes commerciaux."
 ],
 accent: "Vous bénéficiez ainsi de compétences complémentaires, tout en conservant un interlocuteur unique.",
 stepsTitle: "Une collaboration en trois étapes",
 steps: [ // numéros retirés à la demande de Marc
  ["Échanger", "Comprendre votre entreprise, vos clients, vos priorités et votre budget."],
  ["Concevoir", "Définir une structure claire, les fonctionnalités nécessaires et une présentation fidèle à votre activité."],
  ["Valider", "Examiner ensemble les pages et réaliser les ajustements prévus avant la mise en ligne."]
 ],
 after: "Pas de jargon inutile ni de fonctionnalités ajoutées pour impressionner.",
 accent2: "Mon rôle : vous expliquer les choix, prendre en charge leur réalisation et vous accompagner à chaque étape.",
 button: "Échanger directement avec Marc"
};

/* BLOC 7 — RECOMMANDATIONS CLIENTS */
export const recommandations = {
 eyebrow: "AVIS ET RECOMMANDATIONS",
 title: ["Avant de me confier votre site, ", "découvrez ce que disent mes clients."] as Title,
 paragraphs: [
  "Un portfolio montre ce qui a été réalisé.",
  "Les recommandations permettent de découvrir comment la collaboration s'est déroulée.",
  "Écoute, compréhension des besoins, disponibilité et accompagnement : ces aspects comptent autant que les compétences techniques lorsque vous choisissez un développeur web.",
  "Découvrez les retours de professionnels et de structures qui ont sollicité SEOKRAFT."
 ],
 /** Résumés de Jeff, dans l'ordre des avis (Séverine, Hugo, Jean-François, Urkey, Itclean). */
 cards: [
  { name: "Séverine Kayser — REMUS SYSTEMS", role: "Directrice générale", summary: "Un retour sur la compréhension rapide des idées, la créativité et le souci du détail apportés à la création du site de REMUS SYSTEMS." },
  { name: "Hugo Elvira — VATEA", role: "Production audiovisuelle", summary: "Un retour sur la compréhension de ses besoins, la réalisation d'un site fonctionnel et l'implication tout au long du projet." },
  { name: "Jean-François Framarin — Association UZTA", role: "Association de professionnels à Ustaritz", summary: "Une collaboration consacrée à la création complète du site internet d'une association réunissant commerçants, artisans et professions libérales." },
  { name: "UrkeyConciergerie", role: "Conciergerie", summary: "Une recommandation mettant en avant la qualité des services et la volonté de recommander SEOKRAFT." },
  { name: "Itclean Propreté", role: "Entreprise de propreté", summary: "Un témoignage sur la réactivité de Marc, son expertise et sa capacité à identifier un problème sur un site internet." }
 ],
 accent: "Les témoignages originaux restent affichés dans leur intégralité, sans modification de leurs propos.",
 button: "Lire les recommandations sur LinkedIn"
};

/* BLOC 8 — TARIFS */
export const tarifs = {
 eyebrow: "TARIFS · CRÉATION DE SITES INTERNET",
 title: ["Combien coûte un site internet professionnel ? ", "Commencez par une estimation claire."] as Title,
 paragraphs: [
  "Vous souhaitez investir dans un site internet, mais vous avez besoin de connaître votre budget avant d'aller plus loin.",
  "C'est normal.",
  "Le coût dépend notamment du nombre de pages, des fonctionnalités attendues et de la complexité du projet.",
  "Pour vous aider à vous projeter, SEOKRAFT propose un simulateur de prix."
 ],
 offerTitle: "Création de site internet",
 priceFrom: "À partir de",
 offerLead: "Une offre de création comprenant, selon le périmètre convenu :",
 offerList: [
  "La conception et le design sur mesure.",
  "Le développement des pages prévues.",
  "Une version adaptée aux mobiles.",
  "Le copywriting professionnel.",
  "Les fondations du référencement naturel."
 ],
 simTitle: "Configurez votre site",
 simLead: "Sélectionnez le nombre de pages pour obtenir une estimation adaptée à votre projet.",
 seoLabel: "Optimisation SEO éditoriale approfondie",
 seoPrice: "150 € TTC par page, en option.",
 seoText: "Cette prestation complémentaire permet de travailler plus spécifiquement les mots-clés, les intentions de recherche et l'optimisation des contenus.",
 extrasLabel: "Fonctionnalités supplémentaires",
 extrasText: "Blog, prise de rendez-vous en ligne, espace client et développements particuliers : sur devis.",
 hostingLabel: "Hébergement et maintenance",
 hostingText: "49 € TTC par mois, en complément de la création.",
 disclaimer: "Votre estimation est indicative et ne constitue pas un engagement contractuel.",
 accent: "Un devis personnalisé précisera le prix définitif, les prestations incluses et les éventuelles options.",
 button: "Obtenir mon devis personnalisé"
};

/* BLOC 9 — PRESTATIONS INCLUSES */
export const inclus = {
 eyebrow: "CE QUI EST COMPRIS DANS VOTRE CRÉATION",
 title: ["Vous avez un projet de site. ", "Je prends en charge sa réalisation."] as Title,
 paragraphs: [
  "Vous n'avez pas besoin de maîtriser le développement web, le design ou la structure d'un site pour lancer votre projet.",
  "Mon travail consiste à réunir les éléments nécessaires pour construire un ensemble cohérent."
 ],
 listTitle: "Votre création comprend :",
 list: [
  ["Structure du site :", "organisation des pages et des informations."],
  ["Design sur mesure :", "une présentation adaptée à votre identité."],
  ["Développement web :", "réalisation des pages prévues au devis."],
  ["Version mobile :", "adaptation aux smartphones et tablettes."],
  ["Formulaire de contact :", "un moyen simple pour vos prospects de vous joindre."],
  ["Copywriting professionnel :", "des textes pensés pour présenter clairement vos prestations et leurs bénéfices."],
  ["Bases SEO :", "les fondations essentielles au référencement naturel."],
  ["Mise en ligne :", "publication du site une fois les étapes de validation terminées."],
  ["Accompagnement :", "échanges et suivi avant et après le lancement, selon les modalités convenues."]
 ],
 after: "L'optimisation SEO éditoriale approfondie peut être ajoutée selon vos objectifs de référencement.",
 accent: "Design, technique et contenus sont pensés ensemble pour éviter un site esthétique, mais difficile à comprendre ou à utiliser."
};

/* BLOC 10 — HÉBERGEMENT ET MAINTENANCE */
export const hebergement = {
 eyebrow: "HÉBERGEMENT & MAINTENANCE TECHNIQUE",
 title: ["Votre site est en ligne. ", "Qui s'occupe de son suivi technique ?"] as Title,
 paragraphs: [
  "La création d'un site internet ne s'arrête pas au moment où il devient accessible à vos visiteurs.",
  "Il faut également prévoir son hébergement et son suivi technique dans la durée.",
  "Chez SEOKRAFT, ce service accompagne chaque création afin que ces éléments soient intégrés à votre projet dès le départ."
 ],
 priceLabel: "Hébergement et maintenance :",
 price: "49 € TTC/mois",
 conditionsTitle: "Les conditions sont définies à l'avance :",
 conditions: [
  "Service associé à chaque création de site.",
  "Engagement initial de 12 mois.",
  "Reconduction mensuelle à l'issue de cette période.",
  "Prestations couvertes et modalités de résiliation précisées dans le contrat."
 ],
 after: "Vous savez ainsi qu'un accompagnement technique est prévu après la mise en ligne, sans devoir rechercher un prestataire supplémentaire pour ce service.",
 accent: "Le périmètre exact des interventions est détaillé dans votre contrat, pour éviter toute ambiguïté."
};

/* BLOC 11 — FAQ */
export const faq = {
 eyebrow: "QUESTIONS FRÉQUENTES · CRÉATION WEB",
 title: ["Prix, autonomie, référencement : ", "les réponses avant de vous lancer."] as Title,
 items: [
  ["Combien coûte la création d'un site internet à Strasbourg ?", [
   "Chez SEOKRAFT, la création d'un site internet professionnel débute à 1 990 € TTC.",
   "Le montant dépend du nombre de pages, des fonctionnalités et des besoins propres à votre entreprise. Un simulateur permet d'obtenir une première estimation avant l'établissement d'un devis personnalisé."]],
  ["Pourrai-je modifier les textes et les images de mon site moi-même ?", [
   "Votre niveau d'autonomie dépend de la solution technique retenue.",
   "Lors de la préparation du projet, nous définissons les éléments que vous souhaitez pouvoir modifier. Les possibilités de gestion et les éventuelles prestations associées sont précisées au devis."]],
  ["Mon site internet m'appartiendra-t-il ?", [
   "Les droits sur le site, les conditions d'utilisation, les accès et les modalités de transfert éventuel doivent être précisés contractuellement.",
   "Nous examinons ces points avant le démarrage pour que vous sachiez exactement ce qui est prévu."]],
  ["Pourrai-je ajouter de nouvelles pages ou fonctionnalités plus tard ?", [
   "Oui, des évolutions peuvent être envisagées selon l'architecture et les contraintes techniques du site.",
   "Nouvelle prestation, blog, réservation en ligne ou espace client : chaque besoin complémentaire peut faire l'objet d'une étude et d'un devis."]],
  ["Le copywriting et le SEO sont-ils inclus dans la création ?", [
   "Le copywriting professionnel et les bases du référencement naturel font partie de l'offre de création, selon le périmètre prévu au devis.",
   "L'optimisation SEO éditoriale approfondie est une prestation distincte, proposée en option à 150 € TTC par page.",
   "Cette distinction permet de connaître précisément le niveau de travail éditorial compris dans votre projet."]],
  ["Proposez-vous l'hébergement et la maintenance du site ?", [
   "Oui. Chaque création SEOKRAFT comprend un service associé d'hébergement et de maintenance technique, facturé 49 € TTC par mois en complément.",
   "L'engagement initial est de 12 mois, suivi d'une reconduction mensuelle.",
   "Le contrat détaille les prestations couvertes et les conditions de résiliation."]]
 ] as [string, string[]][]
};

/* BLOC 12 — CONTACT */
export const contact = {
 eyebrow: "PARLONS DE VOTRE PROJET WEB",
 title: ["Votre futur site mérite mieux ", "qu'un devis envoyé sans comprendre votre activité."] as Title,
 paragraphs: [
  "Vous envisagez de créer votre site internet, de moderniser votre présence en ligne ou de développer une solution web particulière ?",
  "Racontez-moi votre projet.",
  "Ce que vous proposez, les clients que vous souhaitez attirer, les difficultés rencontrées avec votre site actuel ou les fonctionnalités dont vous avez besoin.",
  "Nous pourrons identifier une approche adaptée, puis définir les prochaines étapes."
 ],
 optionsLead: "Deux possibilités pour commencer :",
 options: [ // numéros retirés à la demande de Marc
  { title: "Présentez-moi votre projet", paragraphs: ["Décrivez votre besoin dans le formulaire.", "Je pourrai ainsi prendre connaissance de votre activité et de vos attentes avant notre échange."], button: "Envoyer mon projet" },
  { title: "Échangeons directement pendant 20 minutes", paragraphs: ["Vous préférez expliquer votre projet de vive voix ?", "Réservez un appel gratuit de 20 minutes pour aborder vos objectifs, vos contraintes et les solutions envisageables."], button: "Réserver mon appel gratuit" }
 ],
 signature: {
  name: "SEOKRAFT — Marc Bretzner",
  lines: ["Studio web indépendant basé à Strasbourg.", "Création de sites internet, refonte, développement sur mesure et référencement SEO & GEO en Alsace et partout en France."],
  accent: "Votre entreprise a son expertise. Donnons à vos futurs clients les moyens de la découvrir et de la comprendre."
 }
};
