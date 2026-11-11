/* Reproduction du site audité dans le bulletin 96e3518ddd3b60e1669dd617 (conciergerie.digital-bnb.com, 11/11/2026),
   avec les caractéristiques qui ont produit les 6 incohérences corrigées. Sert de cas de non-régression. */
import http from 'node:http';

export const TITLE = 'Conciergerie digitale – Développez vos revenus Airbnb & Booking sans les contraintes de la gestion quotidienne';
const imgs = Array.from({ length: 11 }, (_, i) => `<img src="/img/p${i}.webp" width="400" height="300">`).join('');
const h2 = Array.from({ length: 13 }, (_, i) => `<h2>Section ${i + 1} de la conciergerie digitale</h2><p>Gestion des annonces, des voyageurs et des avis pour les propriétaires.</p>`);
const h3 = Array.from({ length: 7 }, (_, i) => `<h3>Détail ${i + 1}</h3><p>Optimisation des annonces Airbnb et Booking, messages voyageurs, calendrier.</p>`);
const words = 'Nous accompagnons les propriétaires de logements en location courte durée pour développer leurs revenus sans contrainte. '.repeat(55);
const nav = `<header><nav><a href="/">Accueil</a><a href="/prestations/">Services à la carte</a><a href="/automatisation-premium/">Automatisation Premium</a><a href="/conciergerie-digitale/">Conciergerie digitale</a><a href="/tarifs/">Tarifs</a><a class="btn" href="/contact/">Devis gratuit</a></nav></header>`;
const page = (title, body) => `<!doctype html><html lang="fr-FR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="generator" content="WordPress 7.1"><title>${title}</title><link rel="icon" href="/favicon.ico"><script src="/wp-includes/js/jquery/jquery.min.js?ver=3.7.1"></script></head><body>${nav}<main>${body}</main><footer><a href="/mentions-legales/">Mentions légales</a> <a href="/politique-de-confidentialite/">Politique de confidentialité</a> © 2026</footer></body></html>`;
const HOME = page(TITLE, `<p>${words}</p>${h2.join('')}${h3.join('')}${imgs}<section><p><strong>Avis clients</strong></p><p>★★★★★ « Revenus en hausse dès le premier mois. »</p></section><p><a href="/prestations/">Nos services à la carte</a> <a href="/tarifs/">Voir les tarifs</a> <a href="/conciergerie-digitale/">La conciergerie digitale</a> <a href="/contact/">Demander un audit gratuit</a></p>`);
const sub = (t, extra = '') => page(t, `<h2>${t}</h2><p>${words.slice(0, 1800)}</p>${extra}`);
const PAGES = {
  '/': HOME,
  '/contact/': sub('Contact', `<p>Écrivez-nous : <a href="mailto:contact@digital-bnb.com">contact@digital-bnb.com</a>, <a href="https://wa.me/33600000000">WhatsApp</a> ou <a href="https://calendly.com/digital-bnb/appel">réservez un appel sur Calendly</a>.</p>`),
  '/prestations/': sub('Services à la carte'), '/automatisation-premium/': sub('Automatisation Premium – Conciergerie digitale'),
  '/conciergerie-digitale/': sub('Conciergerie digitale – Conciergerie digitale'), '/tarifs/': sub('Tarifs'),
  '/mentions-legales/': sub('Mentions légales'), '/politique-de-confidentialite/': sub('Politique de confidentialité'),
};

export function startSite(port) {
  return http.createServer((req, res) => {
    const path = new URL(req.url, 'http://x').pathname;
    if (path === '/robots.txt') { res.end('User-agent: *\nSitemap: /sitemap.xml'); return; }
    if (path === '/sitemap.xml') { res.setHeader('content-type', 'application/xml'); res.end(`<urlset>${Object.keys(PAGES).map((p) => `<loc>http://127.0.0.1:${port}${p}</loc>`).join('')}</urlset>`); return; }
    if (PAGES[path]) { res.setHeader('content-type', 'text/html; charset=utf-8'); res.end(PAGES[path]); return; }
    res.statusCode = 404; res.end('');
  }).listen(port, '127.0.0.1');
}

/* Faux PageSpeed : mêmes mesures que le bulletin réel (CLS ordinateur 0,403). */
export function startPsi(port) {
  const audits = (lcp, cls, fcp) => ({ 'largest-contentful-paint': { displayValue: lcp }, 'cumulative-layout-shift': { displayValue: cls }, 'first-contentful-paint': { displayValue: fcp }, 'total-blocking-time': { displayValue: '120 ms' } });
  return http.createServer((req, res) => {
    const desktop = new URL(req.url, 'http://x').searchParams.get('strategy') === 'desktop';
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ lighthouseResult: {
      categories: { performance: { score: desktop ? 0.72 : 0.65 }, accessibility: { score: 0.92 }, seo: { score: 0.85 }, 'best-practices': { score: 0.96 } },
      audits: desktop ? audits('1,3 s', '0,403', '0,6 s') : audits('8,3 s', '0', '2,7 s'),
    } }));
  }).listen(port, '127.0.0.1');
}

/* Fausse IA : reprend la réponse réelle sur les moyens de contact (« Devis gratuit », WhatsApp, Calendly, e-mail). */
export function startAi(port) {
  const out = { score: 12, essentiel: 'Le site présente clairement la conciergerie digitale, et chaque offre a sa page. Il est peu optimisé pour Google : pas de descriptions et un titre d’accueil trop long. Priorité n°1 : un titre court et une description pour chaque page.', impression: '',
    constats: [{ question: 'Le titre Google dit-il le métier et la ville ?', reponse: 'Le métier oui, la ville non, et le titre est trop long' }, { question: 'Chaque service a-t-il sa page ?', reponse: 'Oui pour les trois offres' }, { question: 'Les titres de page sont-ils clairs ?', reponse: 'Peu : « Conciergerie digitale » est répété' }, { question: 'Les pages sont-elles reliées ?', reponse: 'Oui, depuis le menu et le texte' }, { question: 'Comprend-on le métier en 5 secondes ?', reponse: 'Oui, le message d’accueil est clair' }, { question: 'Sait-on comment contacter ?', reponse: 'Oui : bouton « Devis gratuit » en haut, WhatsApp, Calendly et e-mail sur la page contact' }],
    priorities: [{ level: 'important', title: 'Aucune description dans Google', text: 'Aucune des pages n’a de description. Rédigez une à deux phrases par page.' }], positives: ['Le métier est compris en quelques secondes.'] };
  return http.createServer((req, res) => {
    let body = ''; req.on('data', (c) => { body += c; }); req.on('end', () => {
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify({ content: [{ type: 'text', text: JSON.stringify(out) }], stop_reason: 'end_turn' }));
    });
  }).listen(port, '127.0.0.1');
}
