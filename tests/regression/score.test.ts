/* Barème appliqué par le code : les cinq audits de novembre 2026 qui avaient donné des notes injustes.
   Usage : node tests/regression/score.test.ts */
import assert from 'node:assert/strict';
import { scoreSite, speedBase, duplicateTitles, explainScore } from '../../lib/auditScore.ts';

type S = 'ok' | 'warn' | 'bad';
const ck = (id: string, status: S, detail = '') => ({ id, cat: 'google' as const, label: id, status, detail, advice: status === 'ok' ? 'Rien à faire.' : 'À corriger.' });
const okAll = (...ids: string[]) => ids.map((id) => ck(id, 'ok'));
const speed = (performance: number, strategy: 'mobile' | 'desktop' = 'mobile', cls = '0') => ({ strategy, performance, accessibility: 95, seo: 95, bestPractices: 95, lcp: '1 s', cls, fcp: '1 s', tbt: '0' });
const page = (title: string) => ({ label: title, path: '/', title, description: true, h1: 'x', words: 400 });
const show = (name: string, r: ReturnType<typeof scoreSite>) => console.log(`  ${name} : ${r.global}/20 — ${JSON.stringify(r.notes)}\n    ${explainScore(r).join('\n    ')}`);

/* 1. Speed : 90 et plus = 20 ; 50 à 89 = 12 à 18 ; sous 50 = 9 ; sous 25 = 6. */
assert.equal(speedBase(96), 20); assert.equal(speedBase(89), 18); assert.equal(speedBase(50), 12); assert.equal(speedBase(62), 14); assert.equal(speedBase(40), 9); assert.equal(speedBase(10), 6);
assert.equal(duplicateTitles([page('ECH'), page('ECH'), page('Accueil – Toiture Aix'), page('ECH')])?.bad, true);
assert.equal(duplicateTitles([page('A'), page('B'), page('C')])?.bad, false);
console.log('✓ Vitesse de départ et titres identiques');

/* 2. Aime Propreté (manus.space) : une seule page de 288 mots. Le bulletin d'origine donnait 16/20 et Référencement 17. */
{
  const r = scoreSite({
    checks: [...okAll('indexable', 'robots', 'sitemap', 'canonical', 'js-content', 'title', 'description', 'h1', 'hierarchy', 'https', 'redirect', 'cert', 'phone', 'cta', 'viewport'),
      ck('site-size', 'bad', 'Le site ne contient qu’une seule page.'), ck('words', 'bad', 'Environ 288 mots.'), ck('maillage', 'bad'), ck('legal', 'bad'), ck('privacy', 'bad'), ck('form', 'warn'), ck('proof', 'warn')],
    speed: speed(62), aiMessage: 12,
  });
  show('Aime Propreté', r);
  assert.equal(r.notes.referencement, 9, 'site d’une seule page : référencement plafonné à 9');
  assert.equal(r.notes.securite, 9);
  assert.equal(r.notes.vitesse, 14);
  assert.equal(r.notes.message, 12, 'note de l’IA retenue (plus basse que le plafond des vérifications)');
  assert.equal(r.global, 9, 'site d’une seule page : jamais plus de 9');
  assert.ok(!r.penalties.some((p) => p.id === 'maillage'), 'maillage d’un site d’une page : déjà compté avec « une seule page »');
}

/* 2 bis. Cas réel du 17/11 : l'IA donne 19 en message à une page de 288 mots sans aucune preuve. */
{
  const r = scoreSite({
    checks: [...okAll('indexable', 'robots', 'sitemap', 'canonical', 'js-content', 'title', 'description', 'h1', 'hierarchy', 'https', 'redirect', 'cert', 'phone', 'cta', 'viewport'),
      ck('site-size', 'bad'), ck('words', 'bad'), ck('legal', 'bad'), ck('privacy', 'bad'), ck('headers', 'warn'), ck('proof', 'warn', 'Aucune preuve de sérieux repérée (avis, réalisations, années d’expérience, labels, garanties).')],
    speed: null, aiMessage: 19,
  });
  show('Aime Propreté (réel)', r);
  assert.equal(r.notes.message, 17, 'aucune preuve : important, −3');
  assert.equal(r.global, 9);
}

/* 3. Experts Conseil Habitat : titres « ECH » partout, version http ouverte, mentions et confidentialité absentes, liens vides. */
{
  const r = scoreSite({
    checks: [...okAll('indexable', 'robots', 'sitemap', 'canonical', 'js-content', 'description', 'h1', 'hierarchy', 'https', 'cert', 'cta', 'form', 'viewport', 'title-local'),
      ck('title', 'warn', '74 caractères'), ck('words', 'warn', 'Environ 494 mots.'), ck('pages-seo', 'warn'), ck('redirect', 'bad'), ck('legal', 'bad'), ck('privacy', 'bad'), ck('form-info', 'warn'),
      ck('headers', 'warn'), ck('server-version', 'warn'), ck('empty-links', 'bad'), ck('phone', 'warn'), ck('reviews', 'bad'), ck('images', 'bad')],
    speed: speed(100), aiMessage: 10,
    pagesDetail: [page('Experts Conseil Habitat – Rénovation toiture & isolation à Aix-en-Provence'), page('ECH'), page('ECH'), page('ECH'), page('ECH'), page('ECH')],
  });
  show('Experts Conseil Habitat', r);
  assert.ok(r.penalties.some((p) => p.id === 'titles-dup' && p.gravity === 'grave'));
  assert.ok(!r.penalties.some((p) => p.id === 'pages-seo'), 'titres identiques : compté une seule fois');
  assert.ok(!r.penalties.some((p) => p.id === 'reviews'), 'avis : hors barème');
  assert.ok(!r.penalties.some((p) => p.id === 'server-version'), 'versions affichées : comprises dans les réglages de l’hébergement');
  assert.equal(r.notes.referencement, 9);
  assert.equal(r.notes.securite, 0);
  assert.equal(r.notes.vitesse, 19);
  assert.equal(r.global, 9);
}

/* 4. JeGO : adresse officielle, plan du site et robots.txt pointent vers l'adresse lovable.app. */
{
  const r = scoreSite({
    checks: [...okAll('indexable', 'robots', 'sitemap', 'js-content', 'title', 'description', 'h1', 'hierarchy', 'site-size', 'words', 'maillage', 'https', 'redirect', 'cert', 'legal', 'legal-content', 'privacy', 'form-info', 'cta', 'form', 'viewport'),
      ck('canonical', 'bad', 'l’adresse officielle de 6 page(s) pointe vers agence-web-jego.lovable.app'), ck('schema', 'bad'), ck('phone', 'bad'), ck('headers', 'warn'), ck('cookies', 'warn'), ck('reviews', 'bad')],
    speed: speed(96), aiMessage: 18,
  });
  show('JeGO', r);
  assert.equal(r.notes.referencement, 9);
  assert.equal(r.notes.message, 18);
  assert.equal(r.global, 9, 'Google renvoyé vers une autre adresse : jamais plus de 9');
}

/* 5. PrestiFact : pas de robots.txt ni de plan du site ; l'IA ajoute ce que le code ne peut pas voir. Le bulletin d'origine donnait 12/20 et Référencement 15. */
{
  const r = scoreSite({
    checks: [...okAll('indexable', 'canonical', 'js-content', 'title', 'description', 'h1', 'hierarchy', 'site-size', 'words', 'maillage', 'https', 'cert', 'cta', 'viewport', 'form', 'phone'),
      ck('robots', 'warn'), ck('sitemap', 'warn'), ck('schema', 'bad'), ck('redirect', 'bad'), ck('legal', 'bad'), ck('privacy', 'bad'), ck('form-info', 'warn'), ck('headers', 'warn'), ck('server-version', 'warn')],
    speed: speed(100), aiMessage: 9,
    additions: [{ note: 'referencement', level: 'grave', title: 'Titres Google génériques sur 5 pages sur 6' }, { note: 'message', level: 'grave', title: 'Le formulaire de contact n’envoie aucun message' }],
  });
  show('PrestiFact', r);
  assert.equal(r.notes.referencement, 7, '20 − 3 (robots) − 3 (plan du site) − 1 (fiche) − 6 (titres génériques)');
  assert.equal(r.notes.message, 9);
  assert.equal(r.notes.securite, 0);
  assert.equal(r.global, 8);
}

/* 6. Un site sain reste bien noté : on ne noircit jamais pour vendre. */
{
  const r = scoreSite({
    checks: okAll('indexable', 'robots', 'sitemap', 'canonical', 'js-content', 'title', 'description', 'h1', 'hierarchy', 'site-size', 'words', 'maillage', 'schema', 'https', 'redirect', 'cert', 'legal', 'legal-content', 'privacy', 'form-info', 'headers', 'phone', 'cta', 'form', 'proof', 'viewport', 'empty-links', 'leftovers'),
    speed: speed(95), aiMessage: 17,
  });
  show('Site sain', r);
  assert.equal(r.notes.referencement, 20); assert.equal(r.global, 19.5); assert.equal(r.cap, undefined);
}

/* 7. Plafonds : certificat expiré → 3 ; noindex → 6 ; aucun moyen de contact → un seul problème grave. */
{
  const base = okAll('robots', 'sitemap', 'title', 'description', 'h1', 'site-size', 'words', 'https', 'redirect', 'legal', 'privacy', 'viewport');
  assert.equal(scoreSite({ checks: [...base, ck('indexable', 'ok'), ck('cert', 'bad')], speed: speed(95), aiMessage: 16 }).global, 3);
  assert.equal(scoreSite({ checks: [...base, ck('indexable', 'bad'), ck('cert', 'ok')], speed: speed(95), aiMessage: 16 }).global, 6);
  const nc = scoreSite({ checks: [...base, ck('indexable', 'ok'), ck('phone', 'bad'), ck('form', 'bad'), ck('cta', 'bad')], speed: speed(95), aiMessage: 16 });
  assert.equal(nc.penalties.filter((p) => p.part === 'message').length, 1, 'aucun contact : une seule pénalité grave, pas trois');
  assert.equal(nc.notes.message, 9);
  console.log('✓ Plafonds : certificat 3, noindex 6, aucun contact compté une fois');
}

/* 8. La même gravité retire toujours les mêmes points, et chaque problème compté a un niveau affiché identique. */
{
  const r = scoreSite({ checks: [ck('robots', 'warn'), ck('sitemap', 'warn'), ck('legal', 'bad'), ck('title', 'warn')], speed: speed(95), aiMessage: 20 });
  for (const p of r.penalties) {
    assert.equal(p.points, { grave: 6, important: 3, prevoir: 1 }[p.gravity]);
    assert.equal(r.levels.find((l) => l.id === p.id)?.level, p.gravity, `${p.id} : niveau affiché = niveau compté`);
  }
  console.log('✓ Étiquettes et points toujours cohérents');
}
console.log('Tous les contrôles du barème passent.');
