import type { AuditResult, Bulletin, Check, Status } from './auditTypes';
import { buildFactReport } from './factAudit';

/* Audit fictif, présenté comme exemple sur la page « Audit gratuit » (aucune entreprise réelle).
   Il est construit avec le même calcul que les vrais audits. */
const c = (id: string, status: Status, detail = ''): Check => ({ id, cat: 'google', label: id, status, detail, advice: '' });
const result: AuditResult = {
  url: 'https://www.menuiserie-exemple.fr/', host: 'menuiserie-exemple.fr', fetchedAt: '2026-11-18T09:00:00.000Z', title: 'Menuiserie Exemple',
  checks: [
    c('https', 'ok'), c('indexable', 'ok'), c('robots', 'ok'), c('viewport', 'ok'),
    c('title', 'warn', '« Menuiserie Exemple » (18 caractères).'),
    c('title-local', 'bad', 'Votre ville (Molsheim) n’apparaît ni dans le titre Google ni dans le grand titre de l’accueil.'),
    c('h1', 'ok', '« Menuiserie Exemple, depuis 1998 »'),
    c('description', 'bad', 'Aucune description n’est définie.'),
    c('site-size', 'ok', '7 page(s) trouvée(s) en plus de l’accueil.'),
    c('words', 'ok', 'Environ 640 mots.'), c('sitemap', 'ok'), c('broken', 'ok'),
    c('legal', 'ok', 'Un lien vers les mentions légales est présent.'), c('privacy', 'ok'),
    c('phone', 'warn', 'Un numéro est affiché, mais pas cliquable.'),
    c('form', 'ok', 'Un formulaire de contact est disponible.'),
    c('cta', 'ok', 'Un bouton invite à agir dès le haut de la page.'),
  ],
  facts: { leftovers: [], deadCtas: [], legalDeadUrl: '', broken: [] },
};
const speed = { strategy: 'mobile' as const, performance: 34, accessibility: 88, seo: 92, bestPractices: 90, lcp: '7,4 s', cls: '0,02', fcp: '3,1 s', tbt: '420 ms' };
const { report, global } = buildFactReport(result, speed);

export const SAMPLE_BULLETIN: Bulletin = {
  id: 'exemple', version: 2, url: result.url, host: result.host, createdAt: '2026-11-18T09:00:00.000Z',
  global, notes: {}, verdict: report.verdictTitle, essentiel: report.verdictSub,
  priorities: [], positives: report.strengths, constats: [], speed, ai: false, facts: report,
};
