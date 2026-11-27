/**
 * Textes de la page d'accueil — rédigés par Jeff Bond (copywriter), intégrés mot pour mot.
 * Ne pas reformuler : toute modification doit venir de Jeff / Marc.
 * Choix validés par Marc (28/10/2026) : numéros des étapes retirés, 2e partie des titres en italique olive,
 * résumés de Jeff dans les cartes d'avis, logo seul, sans mention dessous (12/11/2026).
 * Allègement validé par Marc (28/10/2026) : textes conservés ici mais NON affichés —
 *   tarifs.offerLead + offerList, tarifs.hostingLabel/hostingText, inclus.after,
 *   hebergement.after + accent, recommandations.accent (doublons). Pour les réafficher, voir Home.tsx / Testimonials.tsx.
 */

/** Titre en deux parties : la seconde s'affiche en italique olive. */
export type Title = [string, string];

export const meta = {
 title: "Création de sites internet à Strasbourg, refonte & SEO | SEOKRAFT",
 description: "SEOKRAFT, création de sites internet à Strasbourg : refonte, développement sur mesure, copywriting et SEO. Parlons de votre projet."
};

/* BLOC 1 — HERO */
export const hero = {
 eyebrow: "CRÉATION DE SITES INTERNET · STRASBOURG · ALSACE",
 title: ["Création de sites internet à Strasbourg : ", "votre site doit convaincre, pas seulement exister"] as Title, // le point final est affiché après
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
  { title: "Refonte de sites internet", href: "/refonte-site-internet/strasbourg",
    question: "Votre entreprise a évolué, mais votre site ne reflète plus son niveau d'exigence ?",
    text: "Je retravaille sa structure, son design, sa navigation et ses contenus pour offrir une expérience plus claire, notamment sur mobile.",
    benefit: "une image digitale plus cohérente avec la qualité de votre entreprise." },
  { title: "Référencement local", href: "/seo/strasbourg",
    question: "Vous souhaitez être trouvé sur Google quand on cherche votre métier près de chez vous ?",
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
  "Une plateforme de location sans commission, une praticienne et une community manager à faire connaître dans leur région, une expertise technologique à rendre accessible, une visite à transformer en rendez-vous commercial.",
  "Des besoins différents. Des réponses adaptées."
 ],
 labels: { need: "LE BESOIN", solution: "LA RÉALISATION", features: "POINTS CLÉS" },
 projects: [
  { kind: "loca", name: "LOCADIRECT", url: "https://www.loca-direct.fr/", image: "/images/projet-loca-direct.webp",
    tag: "Plateforme web · Location de vacances entre particuliers",
    need: "Permettre aux voyageurs de louer directement auprès des propriétaires, sans commission ni frais de service.",
    solution: "Une plateforme complète : recherche sur carte de France, filtre « chien accepté », annonces publiées gratuitement par les propriétaires et contact direct par WhatsApp.",
    features: ["Carte interactive des logements.", "Espace propriétaire pour publier son annonce.", "Annuaire des prestataires de la location saisonnière."],
    button: "Découvrir LOCADIRECT" },
  { kind: "massages", name: "L'AME AGIT Ô CORPS", url: "https://massages-pays-basque.fr/", image: "/images/projet-massages-pays-basque.webp",
    tag: "Site vitrine · Massage à domicile au Pays basque",
    need: "Faire connaître une praticienne du bien-être qui se déplace à domicile, et transformer les visiteurs en réservations dans les villes qu'elle couvre.",
    solution: "Un site vitrine apaisant, centré sur le besoin du client, qui présente les soins, rassure sur la praticienne et met la réservation à portée de clic.",
    features: ["Ambiance visuelle douce et soignée.", "Villes desservies mises en avant.", "Réservation accessible depuis le menu."],
    button: "Découvrir L'AME AGIT Ô CORPS" },
  { kind: "cindy", name: "CINDY MAWART", url: "https://communitymanager-paysbasque.fr/", image: "/images/projet-community-manager-pays-basque.webp",
    tag: "Site vitrine · Community manager au Pays basque",
    need: "Présenter une community manager freelance et convaincre les entreprises locales de lui confier leurs réseaux sociaux.",
    solution: "Un site chaleureux et personnel, qui parle directement aux problèmes du client et le guide vers une demande d'audit offert.",
    features: ["Ton direct et proche, en tutoiement.", "Textes qui partent des besoins du client.", "Audit offert mis en avant à chaque étape."],
    button: "Découvrir CINDY MAWART" },
  { kind: "remus", name: "REMUS SYSTEMS", url: "https://remussystems.fr", image: "/images/projet-remus-systems.webp",
    tag: "Site internet sur mesure · Technologies et innovation",
    need: "Présenter une activité technologique complexe sans perdre le visiteur dans des explications difficiles à comprendre.",
    solution: "Un site vitrine à l'identité visuelle affirmée, avec une organisation claire des expertises et des pages consacrées aux solutions, à l'audit et à la recherche.",
    features: ["Identité visuelle premium.", "Présentation structurée des expertises.", "Navigation adaptée aux smartphones."],
    button: "Découvrir REMUS SYSTEMS" },
  { kind: "jeff", name: "JEFF BOND", url: "https://www.jeffbond.fr", image: "/images/projet-jeff-bond.webp",
    tag: "Site vitrine · Prospection commerciale B2B",
    need: "Convaincre des chefs d'entreprise de confier leur prospection téléphonique à un indépendant, et les amener à réserver un échange.",
    solution: "Un site d'une page à l'identité visuelle forte, qui pose le problème du prospect, prouve l'expérience par des résultats chiffrés et guide vers la prise de rendez-vous.",
    features: ["Identité visuelle forte et mémorable.", "Résultats chiffrés mis en avant.", "Appels à l'action et formulaire de contact."],
    button: "Découvrir JEFF BOND" }
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
  ["Référencement local", "Une présence digitale cohérente avec votre zone d'activité, notamment Strasbourg, l'Eurométropole, le Bas-Rhin et l'Alsace."]
 ],
 outro: [
  "Aucun professionnel sérieux ne peut garantir une première position sur Google .",
  "En revanche, il est possible de travailler méthodiquement les éléments qui favorisent la compréhension et la découverte de votre site."
 ],
 button: "Découvrir mon accompagnement SEO"
};

/* BLOC 6 — À PROPOS */
export const aPropos = {
 eyebrow: "UN DÉVELOPPEUR WEB INDÉPENDANT",
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
 /** Extraits mot pour mot de chaque recommandation (validés par Marc le 30/10), dans l'ordre des avis (Séverine, Hugo, Jean-François, Urkey, Itclean). */
 cards: [
  { name: "Séverine Kayser — REMUS SYSTEMS", role: "Directrice générale", summary: "Il a su donner vie à notre projet avec beaucoup de professionnalisme, de créativité et un vrai souci du détail." },
  { name: "Hugo Elvira — VATEA", role: "Production audiovisuelle", summary: "J’ai particulièrement apprécié son écoute, sa disponibilité et son implication dans le projet." },
  { name: "Jean-François Framarin — Association UZTA", role: "Association de professionnels à Ustaritz", summary: "Marc est un interlocuteur accessible, à l’écoute et véritablement impliqué dans les projets qu’il accompagne." },
  { name: "UrkeyConciergerie", role: "Conciergerie", summary: "Je te remercie pour tes services au top et vais te recommander à mes contacts. Merci beaucoup Marc !" },
  { name: "Itclean Propreté", role: "Entreprise de propreté", summary: "Il a pris le temps de m’alerter spontanément d’un problème sur mon site internet, ce qui nous a permis de le corriger rapidement." }
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
  "Le référencement naturel, technique et éditorial."
 ],
 simTitle: "Configurez votre site",
 simLead: "Sélectionnez le nombre de pages pour obtenir une estimation adaptée à votre projet.",
 includedNote: "1 690 € TTC pour la première page, puis 500 € TTC par page supplémentaire. Copywriting, SEO technique et SEO éditorial inclus.",
 extrasLabel: "Fonctionnalités supplémentaires",
 extrasText: "Blog, prise de rendez-vous en ligne, espace client et développements particuliers : sur devis.",
 hostingLabel: "Hébergement et maintenance",
 hostingText: "60 € TTC par mois avec l'hébergement, ou 50 € TTC par mois pour la maintenance seule si votre site reste chez votre propre hébergeur.",
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
  ["Référencement naturel :", "le SEO technique et le SEO éditorial, travaillés page par page."],
  ["Mise en ligne :", "publication du site une fois les étapes de validation terminées."],
  ["Accompagnement :", "échanges et suivi avant et après le lancement, selon les modalités convenues."]
 ],
 after: "Le copywriting, le SEO technique et le SEO éditorial sont compris dans le prix de chaque page.",
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
 price: "60 € TTC/mois",
 conditionsTitle: "Les conditions sont définies à l'avance :",
 conditions: [
  "Service associé à chaque création de site.",
  "Maintenance seule, si votre site reste chez votre propre hébergeur : 50 € TTC/mois.",
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
   "Chez SEOKRAFT, la création d'un site internet professionnel débute à 1 690 € TTC pour une page, puis 500 € TTC par page supplémentaire.",
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
   "Oui. Le copywriting professionnel, le SEO technique et le SEO éditorial sont inclus dans le prix de chaque page.",
   "Il n'y a pas d'option à ajouter : chaque page est rédigée et optimisée pour être trouvée sur Google."]],
  ["Proposez-vous l'hébergement et la maintenance du site ?", [
   "Oui. Chaque création SEOKRAFT comprend un service associé d'hébergement et de maintenance technique, facturé 60 € TTC par mois en complément. Si votre site reste chez votre propre hébergeur, la maintenance seule est à 50 € TTC par mois.",
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
  lines: ["Développeur web indépendant basé à Strasbourg.", "Création de sites internet, refonte et référencement local en Alsace et partout en France."],
  accent: "Votre entreprise a son expertise. Donnons à vos futurs clients les moyens de la découvrir et de la comprendre."
 }
};
