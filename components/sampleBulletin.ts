import type { Bulletin } from './auditTypes';

/* Bulletin fictif, présenté comme exemple sur la landing page (aucune entreprise réelle). */
export const SAMPLE_BULLETIN: Bulletin = {
  id: 'exemple', version: 1, url: 'https://www.menuiserie-exemple.fr/', host: 'menuiserie-exemple.fr', createdAt: '2026-11-10T09:00:00.000Z',
  global: 11, notes: { technique: 9.5, google: 12, textes: 11, contact: 11.5 }, verdict: 'Peut mieux faire, des clients vous échappent',
  essentiel: 'Le site présente un vrai savoir-faire et de belles photos de réalisations. Mais sur téléphone, il met plus de 7 secondes à s’afficher, et le numéro n’est pas cliquable : beaucoup de visiteurs partent avant de vous contacter. Priorité : rendre le site rapide sur mobile et le contact évident dès l’arrivée.',
  priorities: [
    { level: 'critique', title: 'Le site est lent sur téléphone', text: 'Le contenu principal met plus de 7 secondes à apparaître. Alléger les photos du haut de page ferait gagner plusieurs secondes.' },
    { level: 'critique', title: 'Le numéro n’est pas cliquable', text: 'Sur téléphone, il faut recopier le numéro pour appeler. Un numéro cliquable en haut de page, c’est un appel en un geste.' },
    { level: 'important', title: 'Google n’a pas de résumé du site', text: 'Aucune description n’est prévue : Google en invente une. Rédigez quelques lignes avec votre métier et votre ville.' },
    { level: 'important', title: 'Les avis clients sont introuvables', text: 'Aucun témoignage sur l’accueil. Deux ou trois avis réels rassureraient avant la prise de contact.' },
    { level: 'planifier', title: 'Les mentions légales sont incomplètes', text: 'L’hébergeur n’est pas indiqué. C’est une obligation légale, rapide à corriger.' },
  ],
  constats: [
    { question: 'En 5 secondes, comprend-on ce que vous faites ?', reponse: 'Oui, le métier est clair dès le titre' },
    { question: 'Le site parle-t-il des besoins de vos clients ?', reponse: 'Surtout de l’entreprise, peu des clients' },
    { question: 'Voit-on ce que le client y gagne ?', reponse: 'Les bénéfices restent implicites' },
    { question: 'Qu’est-ce qui prouve que vous êtes fiable ?', reponse: 'De belles réalisations, mais aucun avis' },
    { question: 'Sait-on quoi faire pour vous contacter ?', reponse: 'Le contact est caché en bas de page' },
  ],
  speed: { strategy: 'mobile', performance: 38, accessibility: 81, seo: 83, bestPractices: 74, lcp: '7,4 s', cls: '0,21', fcp: '3,1 s', tbt: '640 ms' },
  positives: ['Le métier et la zone d’intervention sont clairs.', 'Les photos montrent de vraies réalisations.', 'Le site est sécurisé (cadenas HTTPS).'],
  ai: true,
};
