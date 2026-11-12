/* Filtre anti-spam des formulaires (contact et audit gratuit).
   Un envoi repéré comme spam reçoit la même réponse qu'un envoi normal (le robot ne sait pas qu'il est bloqué),
   mais aucun e-mail n'est envoyé à Marc.
   Pour bloquer un nouveau domaine sans toucher au code : variable Vercel SPAM_BLOCKLIST, domaines séparés par des virgules. */

const BLOCKED = ['probox.my.id', 'unpartage.online'];
/* Domaines gratuits très utilisés par les robots pour leurs adresses jetables. */
const SUSPICIOUS_EMAIL = /\.my\.id$|\.(tk|ml|ga|cf|gq)$/i;
const OWN = /(^|\.)seokraft\.fr$/i;

const domainOf = (v: string) => { try { return new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`).hostname.toLowerCase().replace(/^www\./, ''); } catch { return ''; } };
const matches = (host: string, list: string[]) => list.some((d) => host === d || host.endsWith(`.${d}`));

export function spamReason(fields: { email: string; message?: string; name?: string; url?: string }): string | null {
  const list = [...BLOCKED, ...(process.env.SPAM_BLOCKLIST || '').split(',').map((d) => d.trim().toLowerCase().replace(/^www\./, '')).filter(Boolean)];
  const emailHost = (fields.email.split('@')[1] || '').toLowerCase();
  if (matches(emailHost, list)) return `adresse e-mail bloquée (${emailHost})`;
  if (SUSPICIOUS_EMAIL.test(emailHost)) return `adresse e-mail jetable (${emailHost})`;
  const text = `${fields.name || ''} ${fields.message || ''}`;
  const links = text.match(/https?:\/\/[^\s<>"')]+|\b[a-z0-9-]+\.(?:online|site|xyz|top|click|link|shop|store|live|icu|buzz)\b[^\s]*/gi) || [];
  for (const l of links) {
    const host = domainOf(l);
    if (!host || OWN.test(host)) continue;
    if (matches(host, list)) return `lien bloqué (${host})`;
    /* Signature des robots : un lien vers un site tiers dont l'adresse contient « seokraft » (page piège personnalisée). */
    if (/seokraft/i.test(l)) return `lien piège personnalisé (${host})`;
  }
  if (fields.url && matches(domainOf(fields.url), list)) return `site bloqué (${domainOf(fields.url)})`;
  return null;
}
