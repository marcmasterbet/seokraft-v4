import type { Bulletin, Speed } from './auditTypes';

/* Contrôle de cohérence d'un bulletin AVANT publication.
   Renvoie la liste des incohérences : tant qu'elle n'est pas vide, le bulletin n'est pas publié.
   Fichier sans dépendance d'exécution, pour être testé directement (node tests/regression/validator.test.ts). */

const NOTHING = /rien à faire/i;

/* Phrases de la synthèse ou de l'IA qui contredisent une vérification réussie. */
const CONTRADICTIONS: { re: RegExp; check: string; label: string }[] = [
  { re: /\b(aucun|pas d['’]|sans)\s*(avis|témoignage)/i, check: 'reviews', label: 'dit qu’il n’y a pas d’avis, alors que des avis sont visibles' },
  { re: /\b(aucun|pas de|sans)\s*(numéro|téléphone)\b/i, check: 'phone', label: 'dit qu’il n’y a pas de téléphone, alors qu’un numéro cliquable est présent' },
  { re: /\b(aucun|pas de|sans)\s*formulaire/i, check: 'form', label: 'dit qu’il n’y a pas de formulaire, alors qu’un formulaire est présent' },
  { re: /non sécurisé|pas de cadenas|sans https/i, check: 'https', label: 'dit que le site n’est pas sécurisé, alors qu’il est en HTTPS' },
  { re: /\b(aucune|pas de|sans)\s*description\b/i, check: 'description', label: 'dit qu’il n’y a pas de description, alors qu’elle existe' },
];
/* Moyens de contact que l'IA ne doit citer que s'ils ont été détectés. */
const CHANNEL_WORDS: [RegExp, string][] = [[/whatsapp/i, 'WhatsApp'], [/calendly/i, 'Calendly'], [/messenger/i, 'Messenger']];

const ratable = (v: string | undefined) => v === undefined || v === '–' || !Number.isNaN(parseFloat(String(v).replace(',', '.').replace(/[^\d.]/g, '')));

export function validateBulletin(b: Bulletin): string[] {
  const errors: string[] = [];
  const checks = b.checks ?? [];
  const byId = (label: string) => checks.find((c) => c.label === label);

  /* 1. Statut et recommandation : un point « Grave » ou « À améliorer » doit avoir une vraie recommandation. */
  for (const c of checks) {
    if (c.status !== 'ok' && (!c.advice.trim() || NOTHING.test(c.advice))) errors.push(`« ${c.label} » est classé ${c.status === 'bad' ? 'Grave' : 'À améliorer'} mais sa recommandation est vide ou « Rien à faire ».`);
  }
  for (const p of b.priorities) if (!p.text.trim() || NOTHING.test(p.text)) errors.push(`La priorité « ${p.title} » n’a pas de recommandation.`);

  /* 2. Moyens de contact : une seule liste détectée, partagée par toutes les sections. */
  const channels = b.channels ?? [];
  const written = channels.filter((x) => !['formulaire', 'téléphone', 'bouton de devis ou de contact'].includes(x));
  const form = byId('Formulaire ou e-mail de contact');
  if (form && /seul(ement)? un lien e-mail/i.test(form.detail) && written.length > 1) errors.push(`« Formulaire ou e-mail de contact » dit « seul un lien e-mail » alors que ces moyens sont détectés : ${written.join(', ')}.`);
  const aiText = [b.essentiel, b.impression ?? '', ...b.constats.map((c) => `${c.question} ${c.reponse}`), ...b.priorities.map((p) => `${p.title} ${p.text}`), ...b.positives].join(' \n ');
  if (form && /seul(ement)? un lien e-mail/i.test(form.detail)) {
    const cited = CHANNEL_WORDS.filter(([re]) => re.test(aiText)).map(([, n]) => n);
    if (cited.length) errors.push(`« Formulaire ou e-mail de contact » dit « seul un lien e-mail » alors qu’une autre section cite : ${cited.join(', ')}.`);
  }
  if (b.channels) for (const [re, name] of CHANNEL_WORDS) if (re.test(aiText) && !channels.includes(name)) errors.push(`Le texte cite ${name} comme moyen de contact, mais il n’a pas été détecté sur le site.`);

  /* 3. Preuves de sérieux et avis clients. */
  const proof = byId('Preuves de sérieux');
  const reviewsOk = byId('Avis clients visibles')?.status === 'ok';
  if (proof && reviewsOk && /aucune preuve/i.test(proof.detail) && !/en dehors de vos avis/i.test(proof.detail)) errors.push('« Preuves de sérieux » dit « aucune preuve » alors que des avis clients sont visibles.');

  /* Synthèse, questions et priorités contre les vérifications réussies. */
  const okIds: Record<string, boolean> = {
    reviews: reviewsOk,
    phone: byId('Téléphone visible et cliquable')?.status === 'ok',
    form: form?.status === 'ok',
    https: byId('Connexion sécurisée (cadenas)')?.status === 'ok',
    description: byId('Description dans les résultats Google')?.status === 'ok',
  };
  /* « Pas de description » n'est une erreur que si la phrase parle bien de la description Google
     et que TOUTES les pages analysées en ont une (sinon l'IA parle d'une autre page, ou des images). */
  const sentences = aiText.split(/(?<=[.!?…])\s+|\n/);
  const allPagesDesc = (b.pagesDetail ?? []).every((p) => p.description);
  for (const k of CONTRADICTIONS) {
    if (!okIds[k.check]) continue;
    const hit = k.check === 'description'
      ? allPagesDesc && sentences.some((t) => k.re.test(t) && !/image|photo|visuel|\balt\b|bouton|lien/i.test(t))
      : k.re.test(aiText);
    if (hit) errors.push(`Le texte ${k.label}.`);
  }

  /* 5. Titre cité en entier, avec sa vraie longueur. */
  const title = byId('Titre de la page pour Google');
  const m = title?.detail.match(/«\s(.+)\s»\s\((\d+) caractères\)/);
  if (m) {
    const [, quoted, n] = m;
    const cut = quoted.endsWith('…');
    if (!cut && quoted.length !== Number(n)) errors.push(`Le titre cité fait ${quoted.length} caractères mais le bulletin annonce ${n}.`);
    const full = b.pagesDetail?.[0]?.title;
    if (full && !cut && quoted !== full && full.startsWith(quoted)) errors.push('Le titre cité est tronqué sans « … ».');
  }

  /* 4. Toute mesure affichée doit avoir un statut. */
  for (const s of [b.speed, b.speedDesktop].filter((x): x is Speed => !!x && x.performance !== null)) {
    for (const k of ['fcp', 'lcp', 'cls'] as const) if (!ratable(s[k])) errors.push(`La mesure ${k.toUpperCase()} (${s.strategy}) « ${s[k]} » ne peut pas recevoir de statut.`);
    const clsBad = parseFloat(String(s.cls).replace(',', '.')) > 0.25;
    const id = s.strategy === 'desktop' ? 'sur ordinateur' : 'sur téléphone';
    if (clsBad && !checks.some((c) => c.label === `Stabilité de la page ${id}` && c.status === 'bad')) errors.push(`Le CLS ${id} (${s.cls}) est mauvais mais n’est pas signalé.`);
    if (clsBad && !b.priorities.some((p) => p.title.includes('bouge') && p.title.includes(id))) errors.push(`Le CLS ${id} (${s.cls}) est mauvais mais ne figure pas dans les priorités.`);
  }
  return errors;
}
