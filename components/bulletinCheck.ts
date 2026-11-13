import type { Bulletin, Speed } from './auditTypes';

/* Contrôle de cohérence d'un bulletin AVANT publication.
   Renvoie la liste des incohérences : tant qu'elle n'est pas vide, le bulletin n'est pas publié.
   Fichier sans dépendance d'exécution, pour être testé directement (node tests/regression/validator.test.ts). */

const NOTHING = /rien à faire/i;

/* Phrases de la synthèse ou de l'IA qui contredisent une vérification réussie. */
/* Phrases de l'IA qui contredisent une vérification réussie. On juge phrase par phrase, et on ignore
   les phrases qui parlent d'autre chose (« formulaire non sécurisé », « pas de téléphone en haut de page »…). */
const CONTRADICTIONS: { re: RegExp; except: RegExp; check: string; label: string }[] = [
  { re: /\b(aucun|pas d['’]|sans)\s*(avis|témoignage)/i, except: /google|fiche|étoile|note/i, check: 'reviews', label: 'dit qu’il n’y a pas d’avis, alors que des avis sont visibles' },
  { re: /\b(aucun|pas de|sans)\s*(numéro|téléphone)\b/i, except: /haut|en-tête|menu|première vue|dès l|cliquable|bouton|whatsapp|page|accueil/i, check: 'phone', label: 'dit qu’il n’y a pas de téléphone, alors qu’un numéro cliquable est présent' },
  { re: /\b(aucun|pas de|sans)\s*formulaire/i, except: /accueil|page|devis en ligne|réservation|haut/i, check: 'form', label: 'dit qu’il n’y a pas de formulaire, alors qu’un formulaire est présent' },
  { re: /non sécurisé|pas sécurisé|pas de cadenas|sans https/i, except: /formulaire|donnée|serveur|protection|en-tête|cookie|mot de passe|paiement|wordpress|extension|logiciel|version|mixte|ressource|script|faille|rgpd|confidentialit/i, check: 'https', label: 'dit que le site n’est pas sécurisé, alors qu’il est en HTTPS' },
  { re: /\b(aucune|pas de|sans)\s*description\b/i, except: /image|photo|visuel|\balt\b|bouton|lien|pages?\s+(de|des|du)|autres? pages?|services?|contact/i, check: 'description', label: 'dit qu’il n’y a pas de description, alors qu’elle existe' },
];
const splitSentences = (t: string) => t.split(/(?<=[.!?…])\s+|\n/).map((x) => x.trim()).filter(Boolean);
function okMap(b: Bulletin): Record<string, boolean> {
  const by = (label: string) => (b.checks ?? []).find((c) => c.label === label);
  const form = by('Formulaire ou e-mail de contact');
  return {
    reviews: by('Avis clients visibles')?.status === 'ok',
    phone: by('Téléphone visible et cliquable')?.status === 'ok',
    form: form?.status === 'ok',
    https: by('Connexion sécurisée (cadenas)')?.status === 'ok',
    description: by('Description dans les résultats Google')?.status === 'ok' && (b.pagesDetail ?? []).every((p) => p.description),
  };
}
/* La phrase contredit-elle une vérification réussie ? Renvoie la règle en cause. */
function contradiction(b: Bulletin, sentence: string, ok = okMap(b)) {
  return CONTRADICTIONS.find((k) => ok[k.check] && k.re.test(sentence) && !k.except.test(sentence));
}
/* Plutôt que bloquer tout le bulletin, on retire les phrases fautives de l'IA (et la priorité si son titre est faux).
   Renvoie les phrases retirées, pour prévenir Marc. */
export function scrubContradictions(b: Bulletin): string[] {
  const ok = okMap(b); const removed: string[] = [];
  const clean = (t: string) => splitSentences(t).filter((x) => { const bad = contradiction(b, x, ok); if (bad) removed.push(x); return !bad; }).join(' ');
  b.essentiel = clean(b.essentiel);
  if (b.impression) b.impression = clean(b.impression);
  b.constats = b.constats.filter((c) => { const bad = contradiction(b, c.reponse, ok); if (bad) removed.push(`${c.question} ${c.reponse}`); return !bad; });
  b.priorities = b.priorities.filter((p) => { const bad = contradiction(b, p.title, ok); if (bad) removed.push(p.title); return !bad; }).map((p) => ({ ...p, text: clean(p.text) }));
  b.positives = b.positives.filter((x) => { const bad = contradiction(b, x, ok); if (bad) removed.push(x); return !bad; });
  return removed;
}

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

  /* Synthèse, questions et priorités contre les vérifications réussies (phrase par phrase). */
  const ok = okMap(b);
  for (const k of new Set(splitSentences(aiText).map((t) => contradiction(b, t, ok)).filter(Boolean))) errors.push(`Le texte ${k!.label}.`);

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
