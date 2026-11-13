/* Test du contrôle de cohérence : le bulletin réel du 11/11/2026, tel qu'il avait été publié, doit être bloqué.
   Usage : node tests/regression/validator.test.ts */
import assert from 'node:assert/strict';
import { validateBulletin, scrubContradictions } from '../../components/bulletinCheck.ts';

const TITLE = 'Conciergerie digitale – Développez vos revenus Airbnb & Booking sans les contraintes de la gestion quotidienne';
const ck = (group: string, label: string, status: string, detail: string, advice: string) => ({ group, label, status, detail, advice });
/* Extrait fidèle du bulletin 96e3518ddd3b60e1669dd617 avant correction. */
const old: any = {
  id: '96e3518ddd3b60e1669dd617', version: 2, url: 'https://conciergerie.digital-bnb.com/', host: 'conciergerie.digital-bnb.com', createdAt: '2026-11-11T20:00:00Z', global: 12,
  notes: { vitesse: 13, securite: 16, google: 11, textes: 12, contact: 10 }, verdict: 'Moyen, des clients vous échappent', essentiel: 'Le site présente bien son métier.',
  priorities: [{ level: 'critique', title: 'Aucun numéro de téléphone visible', text: 'Afficher un numéro cliquable.' }], positives: [],
  constats: [{ question: 'Sait-on comment contacter ?', reponse: 'Oui : bouton « Devis gratuit » en haut, WhatsApp, Calendly et e-mail sur la page contact' }],
  speed: { strategy: 'mobile', performance: 65, accessibility: 92, seo: 85, bestPractices: 96, lcp: '8,3 s', cls: '0', fcp: '2,7 s', tbt: '–' },
  speedDesktop: { strategy: 'desktop', performance: 72, accessibility: 92, seo: 85, bestPractices: 96, lcp: '1,3 s', cls: '0,403', fcp: '0,6 s', tbt: '–' },
  ai: true, pagesDetail: [{ label: 'Accueil', path: '/', title: TITLE, description: false, h1: '', words: 935 }],
  checks: [
    ck('google', 'Hiérarchie des titres (H1, H2, H3)', 'bad', '0 H1, 13 H2, 7 H3.', 'Rien à faire.'),
    ck('google', 'Titre de la page pour Google', 'warn', `« ${TITLE.slice(0, 90)} » (110 caractères).`, 'Viser moins de 60 caractères.'),
    ck('contact', 'Formulaire ou e-mail de contact', 'warn', 'Seul un lien e-mail est proposé.', 'Proposer un formulaire simple.'),
    ck('contact', 'Avis clients visibles', 'ok', 'Des avis ou témoignages de clients sont présentés.', ''),
    ck('contact', 'Preuves de sérieux', 'warn', 'Aucune preuve de sérieux repérée (réalisations, années d’expérience, labels, garanties).', 'Montrer vos réalisations.'),
  ],
};
const errors = validateBulletin(old);
console.log(errors.map((e) => `  · ${e}`).join('\n'));
for (const re of [/Hiérarchie des titres.*Rien à faire/, /seul un lien e-mail/, /aucune preuve/, /tronqué|caractères/, /CLS sur ordinateur.*pas signalé/, /CLS sur ordinateur.*priorités/, /WhatsApp/])
  assert.ok(errors.some((e) => re.test(e)), `Incohérence non détectée : ${re}`);
console.log(`✓ Le bulletin d’origine est bloqué (${errors.length} incohérences détectées).`);

/* Description : propreurs.fr (13/11/2026) bloqué à tort. L'accueil a une description, une autre page non. */
const descOk = ck('google', 'Description dans les résultats Google', 'ok', '152 caractères.', 'Bonne description.');
const base: any = { ...old, checks: [descOk], priorities: [], constats: [], positives: [], channels: [], speed: undefined, speedDesktop: undefined };
const pages = (sub: boolean) => [{ label: 'Accueil', path: '/', title: 'A', description: true, h1: 'A', words: 400 }, { label: 'Services', path: '/services', title: 'S', description: sub, h1: 'S', words: 300 }];
const descErr = (b: any) => validateBulletin(b).filter((e) => /description/.test(e));
assert.equal(descErr({ ...base, pagesDetail: pages(false), essentiel: 'La page Services n’a pas de description dans Google.' }).length, 0, 'Autre page sans description : ne doit pas bloquer');
assert.equal(descErr({ ...base, pagesDetail: pages(true), essentiel: 'Plusieurs images sans description.' }).length, 0, 'Images sans description : ne doit pas bloquer');
assert.equal(descErr({ ...base, pagesDetail: pages(true), essentiel: 'Votre site n’a pas de description dans Google.' }).length, 1, 'Vraie contradiction : doit bloquer');
console.log('✓ Règle « description » : autre page et images acceptées, vraie contradiction bloquée.');

/* HTTPS : elite-conciergerie-33.com (13/11/2026) bloqué à tort. */
{
  const https = ck('securite', 'Connexion sécurisée (cadenas)', 'ok', 'Cadenas présent.', 'Rien à faire.');
  const mk = (essentiel: string): any => ({ ...base, checks: [https], pagesDetail: [], essentiel, priorities: [{ level: 'important', title: 'Formulaire non sécurisé', text: 'Le formulaire envoie les données sans protection.' }] });
  const hErr = (b: any) => validateBulletin(b).filter((e) => /HTTPS/.test(e));
  assert.equal(hErr(mk('Les données du formulaire ne sont pas sécurisées.')).length, 0, 'Formulaire non sécurisé : ne doit pas bloquer');
  assert.equal(hErr(mk('Le serveur n’est pas sécurisé : protections manquantes.')).length, 0, 'Serveur : ne doit pas bloquer');
  const wrong = mk('Bon site. Votre site n’est pas sécurisé. Contact clair.');
  assert.equal(hErr(wrong).length, 1, 'Vraie contradiction détectée');
  const removed = scrubContradictions(wrong);
  assert.deepEqual(removed, ['Votre site n’est pas sécurisé.']);
  assert.equal(wrong.essentiel, 'Bon site. Contact clair.');
  assert.equal(hErr(wrong).length, 0, 'Après nettoyage : plus de contradiction');
  console.log('✓ Règle « HTTPS » : formulaire/serveur acceptés, phrase fausse retirée au lieu de bloquer.');
}
