import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomBytes, createHmac, timingSafeEqual } from 'node:crypto';
import { emptyProspect, hostOf, type Prospect, type Event, type Source, type Stage } from '../components/crmTypes';

/* Stockage du CRM dans Vercel Blob (ou dans .data/crm en local).
   Chaque modification écrit une NOUVELLE version (jamais d'écrasement : pas de souci de cache),
   puis supprime les anciennes. Les adresses contiennent un suffixe aléatoire : impossibles à deviner. */

const LOCAL = path.join(process.cwd(), '.data');
const useBlob = () => !!process.env.BLOB_READ_WRITE_TOKEN;
const validId = (id: string) => /^[a-f0-9]{16}$/.test(id);

type Item = { pathname: string; url: string };
async function listPrefix(prefix: string): Promise<Item[]> {
  if (useBlob()) {
    const { list } = await import('@vercel/blob');
    const out: Item[] = [];
    let cursor: string | undefined;
    do {
      const r = await list({ prefix, limit: 1000, cursor });
      out.push(...r.blobs.map((b) => ({ pathname: b.pathname, url: b.url })));
      cursor = r.hasMore ? r.cursor : undefined;
    } while (cursor);
    return out;
  }
  const walk = async (dir: string): Promise<Item[]> => {
    let entries: import('node:fs').Dirent[] = [];
    try { entries = await fs.readdir(dir, { withFileTypes: true }); } catch { return []; }
    const res: Item[] = [];
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) res.push(...(await walk(full)));
      else { const rel = path.relative(LOCAL, full).split(path.sep).join('/'); res.push({ pathname: rel, url: `file://${full}` }); }
    }
    return res;
  };
  const base = path.join(LOCAL, prefix);
  return (await walk(base.endsWith('/') ? base : path.dirname(base))).filter((i) => i.pathname.startsWith(prefix));
}
async function readJson<T>(item: Item): Promise<T | null> {
  try {
    if (item.url.startsWith('file://')) return JSON.parse(await fs.readFile(item.url.slice(7), 'utf8'));
    const r = await fetch(item.url, { cache: 'no-store' });
    return r.ok ? ((await r.json()) as T) : null;
  } catch { return null; }
}
async function writeFile(pathname: string, body: string | Buffer, contentType: string): Promise<string> {
  if (useBlob()) {
    const { put } = await import('@vercel/blob');
    const r = await put(pathname, body, { access: 'public', addRandomSuffix: false, contentType });
    return r.url;
  }
  const full = path.join(LOCAL, pathname);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, body);
  return `/api/crm/file?p=${encodeURIComponent(pathname)}`;
}
async function remove(items: Item[]) {
  if (!items.length) return;
  if (useBlob()) { const { del } = await import('@vercel/blob'); await del(items.map((i) => i.url)).catch(() => {}); return; }
  await Promise.all(items.map((i) => fs.rm(i.url.slice(7), { force: true })));
}
const stamp = () => `${Date.now().toString().padStart(15, '0')}-${randomBytes(12).toString('hex')}`;

/* Dernière version d'un document versionné. */
async function latest<T>(prefix: string): Promise<{ data: T; items: Item[] } | null> {
  const items = (await listPrefix(prefix)).filter((i) => i.pathname.endsWith('.json')).sort((a, b) => a.pathname.localeCompare(b.pathname));
  if (!items.length) return null;
  const data = await readJson<T>(items[items.length - 1]);
  return data ? { data, items } : null;
}
async function saveVersioned(prefix: string, data: unknown, old: Item[] = []) {
  await writeFile(`${prefix}${stamp()}.json`, JSON.stringify(data), 'application/json');
  await remove(old);
}

/* ===================== Prospects ===================== */
export async function getProspect(id: string): Promise<Prospect | null> {
  if (!validId(id)) return null;
  return (await latest<Prospect>(`crm/p/${id}/`))?.data ?? null;
}
export async function listProspects(): Promise<Prospect[]> {
  const items = (await listPrefix('crm/p/')).filter((i) => i.pathname.endsWith('.json'));
  const byId = new Map<string, Item>();
  for (const i of items) { const id = i.pathname.split('/')[2]; const cur = byId.get(id); if (!cur || i.pathname > cur.pathname) byId.set(id, i); }
  const all: Prospect[] = [];
  const queue = [...byId.values()];
  await Promise.all(Array.from({ length: 12 }, async () => { for (let it = queue.shift(); it; it = queue.shift()) { const p = await readJson<Prospect>(it); if (p) all.push(p); } }));
  return all.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
export async function saveProspect(p: Prospect): Promise<Prospect> {
  if (!validId(p.id)) throw new Error('Identifiant invalide');
  const prev = await listPrefix(`crm/p/${p.id}/`);
  p.updatedAt = new Date().toISOString();
  if (p.history.length > 300) p.history = p.history.slice(-300);
  await saveVersioned(`crm/p/${p.id}/`, p, prev.filter((i) => i.pathname.endsWith('.json')));
  return p;
}
export async function deleteProspect(id: string) {
  if (!validId(id)) return;
  await remove([...(await listPrefix(`crm/p/${id}/`)), ...(await listPrefix(`crm/docs/${id}/`))]);
}
export const newId = () => randomBytes(8).toString('hex');
export const event = (text: string, kind: Event['kind'] = 'auto'): Event => ({ at: new Date().toISOString(), text: text.slice(0, 2000), kind });

/* Crée ou complète la fiche d'un prospect, retrouvé par son identifiant, son e-mail ou son site. */
export async function upsertProspect(match: { id?: string; email?: string; website?: string }, fill: Partial<Prospect> & { source: Source }, change: (p: Prospect, created: boolean) => void): Promise<Prospect> {
  const email = (match.email || '').trim().toLowerCase();
  const host = hostOf(match.website || '');
  let p = match.id && validId(match.id) ? await getProspect(match.id) : null;
  if (!p && (email || host)) {
    const all = await listProspects();
    p = all.find((x) => (email && x.email.toLowerCase() === email) || (host && hostOf(x.website) === host)) ?? null;
  }
  const created = !p;
  if (!p) { p = emptyProspect(newId()); p.source = fill.source; }
  for (const [k, v] of Object.entries(fill)) {
    if (k === 'source') continue;
    const key = k as keyof Prospect;
    if (v !== undefined && v !== null && v !== '' && !(p[key] as unknown)) (p as Record<string, unknown>)[key] = v;
  }
  change(p, created);
  return saveProspect(p);
}
/* Avance d'étape sans jamais reculer (une nouvelle demande ne fait pas repasser un client en « à contacter »). */
const ORDER: Stage[] = ['a_contacter', 'audit_demande', 'audit_envoye', 'relance', 'rdv', 'devis', 'client'];
export function advance(p: Prospect, to: Stage) { if (p.stage === 'perdu' || ORDER.indexOf(to) > ORDER.indexOf(p.stage)) p.stage = to; }

/* Pièces jointes (PDF). */
export async function saveDoc(id: string, name: string, data: Buffer, contentType: string) {
  const safe = name.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w.-]+/g, '-').slice(-80) || 'document.pdf';
  return writeFile(`crm/docs/${id}/${randomBytes(12).toString('hex')}-${safe}`, data, contentType);
}
export async function removeDoc(id: string, url: string) {
  const items = await listPrefix(`crm/docs/${id}/`);
  await remove(items.filter((i) => i.url === url || url.includes(encodeURIComponent(i.pathname))));
}
export async function readLocalFile(pathname: string): Promise<Buffer | null> {
  if (useBlob() || !/^crm\/docs\/[a-f0-9]{16}\/[\w.-]+$/.test(pathname)) return null;
  try { return await fs.readFile(path.join(LOCAL, pathname)); } catch { return null; }
}

/* ===================== Brouillons du questionnaire ===================== */
const validDraft = (id: string) => /^[a-z0-9]{8,40}$/i.test(id);
export async function getDraft(id: string): Promise<unknown | null> {
  if (!validDraft(id)) return null;
  return (await latest<unknown>(`crm/q/${id}/`))?.data ?? null;
}
export async function saveDraft(id: string, data: unknown) {
  if (!validDraft(id)) throw new Error('Brouillon invalide');
  await saveVersioned(`crm/q/${id}/`, data, (await listPrefix(`crm/q/${id}/`)).filter((i) => i.pathname.endsWith('.json')));
}

/* ===================== Accès privé ===================== */
const secret = () => process.env.CRM_PASSWORD || process.env.AUDIT_TOOL_PASSWORD || '';
export const sessionToken = () => createHmac('sha256', secret()).update('seokraft-crm-v1').digest('hex');
export function checkPassword(given: string) {
  const s = secret();
  if (!s || given.length !== s.length) return false;
  return timingSafeEqual(Buffer.from(given), Buffer.from(s));
}
export function authorised(request: Request) {
  if (!secret()) return false;
  const c = (request.headers.get('cookie') || '').match(/(?:^|;\s*)sk_crm=([a-f0-9]{64})/);
  return !!c && timingSafeEqual(Buffer.from(c[1]), Buffer.from(sessionToken()));
}

/* Envoi d'un mail via Resend (mêmes réglages que le formulaire de contact). */
export async function sendMail(opts: { to: string; subject: string; text: string; replyTo?: string }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!key || !from) return false;
  if (process.env.AUDIT_DEBUG === '1') console.log('CRM-MAIL', opts.to, opts.subject, '\n' + opts.text);
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [opts.to], subject: opts.subject, text: opts.text, ...(opts.replyTo ? { reply_to: opts.replyTo } : {}) }),
    signal: AbortSignal.timeout(10000),
  }).catch(() => null);
  return !!r?.ok;
}
