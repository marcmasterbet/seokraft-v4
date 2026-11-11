/* Test de non-régression du générateur de bulletins.
   Usage : npm run build, puis npm run test:audit
   Lance une copie du site du bulletin 96e3518ddd3b60e1669dd617, un faux PageSpeed et une fausse IA,
   démarre le site SEOKRAFT en local, génère le bulletin et vérifie les 6 corrections. */
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
import { startSite, startPsi, startAi, TITLE } from './conciergerie-fixture.mjs';

const [SITE, PSI, AI, APP] = [8791, 8792, 8793, 3100];
const servers = [startSite(SITE), startPsi(PSI), startAi(AI)];
const app = spawn('npx', ['next', 'start', '-p', String(APP)], { stdio: 'ignore', env: { ...process.env,
  AUDIT_ALLOW_LOCAL: '1', AUDIT_TOOL_PASSWORD: 'test-regression', ANTHROPIC_API_KEY: 'test', ANTHROPIC_BASE_URL: `http://127.0.0.1:${AI}`,
  PSI_BASE_URL: `http://127.0.0.1:${PSI}/run`, BLOB_READ_WRITE_TOKEN: '' } });
const stop = () => { app.kill(); servers.forEach((s) => s.close()); };

try {
  for (let i = 0; i < 60; i++) { try { await fetch(`http://127.0.0.1:${APP}/`); break; } catch { await new Promise((r) => setTimeout(r, 500)); } }
  const res = await fetch(`http://127.0.0.1:${APP}/api/outil-audit`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-audit-key': 'test-regression' }, body: JSON.stringify({ url: `http://127.0.0.1:${SITE}/` }) });
  const b = await res.json();
  assert.equal(res.status, 200, `Bulletin non publié : ${b.error}`);
  const check = (label) => b.checks.find((c) => c.label === label);
  const ok = (name, fn) => { fn(); console.log(`  ✓ ${name}`); };
  console.log(`Bulletin ${b.id} : ${b.global}/20, notes ${JSON.stringify(b.notes)}`);

  ok('1. H1 absent : statut Grave et recommandation d’ajouter un H1', () => {
    const h = check('Hiérarchie des titres (H1, H2, H3)');
    assert.equal(h.status, 'bad'); assert.match(h.detail, /^0 H1, 13 H2, 7 H3/); assert.match(h.advice, /titre principal \(H1\) unique/); assert.doesNotMatch(h.advice, /rien à faire/i);
    for (const c of b.checks) if (c.status !== 'ok') assert.doesNotMatch(c.advice || 'vide', /^(vide|rien à faire)/i, c.label);
  });
  ok('2. Moyens de contact cohérents (WhatsApp, Calendly, e-mail)', () => {
    const f = check('Formulaire ou e-mail de contact');
    assert.doesNotMatch(f.detail, /seul un lien e-mail/i); assert.match(f.detail, /WhatsApp/); assert.match(f.detail, /Calendly/); assert.match(f.detail, /e-mail/);
    for (const x of ['e-mail', 'WhatsApp', 'Calendly']) assert.ok(b.channels.includes(x), x);
  });
  ok('3. Preuves de sérieux tiennent compte des avis', () => {
    assert.equal(check('Avis clients visibles').status, 'ok'); assert.match(check('Preuves de sérieux').detail, /^En dehors de vos avis clients/);
  });
  ok('4. CLS ordinateur 0,403 classé Mauvais, dans les priorités, et pèse sur la vitesse', () => {
    const c = check('Stabilité de la page sur ordinateur'); assert.equal(c.status, 'bad');
    assert.equal(check('Stabilité de la page sur téléphone').status, 'ok');
    assert.ok(b.priorities.some((p) => p.title === 'La page bouge pendant le chargement sur ordinateur'));
  });
  ok('5. Titre cité en entier avec sa vraie longueur', () => {
    assert.equal(check('Titre de la page pour Google').detail, `« ${TITLE} » (${TITLE.length} caractères).`);
  });
  ok('6. Statistique sourcée sur la page du bulletin', async () => {});
  const html = await (await fetch(`http://127.0.0.1:${APP}/bulletin/${b.id}`)).text();
  assert.match(html, /étude Google, 2016 : 53 % des visites sur mobile abandonnées au-delà de 3 s/);
  assert.match(html, /bv-rate-bad">Mauvais</);
  console.log('Tous les contrôles passent.');
} catch (e) { console.error('ÉCHEC :', e.message); process.exitCode = 1; } finally { stop(); }
