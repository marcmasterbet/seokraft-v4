'use client';
import { useEffect, useState, type FormEvent } from 'react';
import { NOTE_LABELS, buildBulletinMail, fmt20, type Bulletin } from './auditTypes';

/* Outil privé de Marc : lance un audit, crée le bulletin en ligne et prépare le mail au prospect. */
const KEY_STORE = 'seokraft_audit_key';

export default function AuditTool() {
  const [key, setKey] = useState('');
  const [logged, setLogged] = useState(false);
  const [url, setUrl] = useState('');
  const [firstName, setFirstName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [b, setB] = useState<(Bulletin & { aiError?: string; speedError?: boolean; crmId?: string }) | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try { const k = sessionStorage.getItem(KEY_STORE); if (k) { setKey(k); setLogged(true); } } catch {}
    const q = new URLSearchParams(window.location.search);
    if (q.get('url')) setUrl(q.get('url') || '');
    if (q.get('prenom')) setFirstName(q.get('prenom') || '');
  }, []);

  async function run(e: FormEvent) {
    e.preventDefault(); setError(''); setB(null); setCopied(false); setBusy(true);
    try {
      const r = await fetch('/api/outil-audit', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-audit-key': key }, body: JSON.stringify({ url, prenom: firstName }) });
      const d = await r.json().catch(() => ({}));
      if (r.status === 401) { setLogged(false); try { sessionStorage.removeItem(KEY_STORE); } catch {} throw new Error('Mot de passe incorrect.'); }
      if (!r.ok) throw new Error(d.error || 'Analyse impossible.');
      setB(d as Bulletin & { aiError?: string; speedError?: boolean; crmId?: string });
    } catch (err) { setError(err instanceof Error ? err.message : 'Erreur.'); }
    finally { setBusy(false); }
  }

  function login(e: FormEvent) { e.preventDefault(); try { sessionStorage.setItem(KEY_STORE, key); } catch {} setLogged(true); }

  if (!logged) return <main className="at at-login"><form onSubmit={login}><h1>Outil d’audit<span>.</span></h1><p>Accès réservé.</p><label>Mot de passe<input type="password" value={key} onChange={(e) => setKey(e.target.value)} required autoComplete="current-password" /></label><button className="button button-olive" type="submit">Entrer</button></form></main>;

  const link = b ? `/bulletin/${b.id}` : '';
  const mail = b ? buildBulletinMail(b, firstName) : '';
  return <main className="at">
    <section className="at-panel">
      <h1>Outil d’audit<span>.</span></h1>
      <form className="at-form" onSubmit={run}>
        <label>Adresse du site<input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="monentreprise.fr" required /></label>
        <label>Prénom du contact <small>(pour le mail)</small><input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Facultatif" /></label>
        <span />
        <button className="button button-olive" type="submit" disabled={busy}>{busy ? 'Analyse en cours…' : 'Lancer l’audit'}</button>
      </form>
      {busy && <p className="at-busy" role="status">Analyse du site, mesures Google et audit SEO : environ 1 à 2 minutes…</p>}
      {error && <p className="form-error" role="alert">{error}</p>}
      {b && <div className="at-actions">
        <p className="at-result"><strong>{b.host} : {fmt20(b.global)}/20</strong> — {b.verdict}<br />{NOTE_LABELS.map((n) => `${n.label} ${fmt20(b.notes[n.id] ?? null)}`).join(' · ')}{b.cap && <><br />{b.cap}</>}{!b.ai && <><br /><em className="at-alert">IA indisponible ({b.aiError || 'erreur'}) : référencement non évalué. Corriger puis relancer avant d’envoyer.</em></>}{b.speedError && <><br /><em className="at-alert">Mesure de vitesse Google indisponible : ajouter PSI_API_KEY dans Vercel.</em></>}</p>
        <a className="button button-olive" href={link} target="_blank" rel="noopener noreferrer">Ouvrir le bulletin (relire, télécharger le PDF)</a>{b.crmId && <a className="button button-dark" href={`/crm?p=${b.crmId}`} target="_blank" rel="noopener noreferrer">Voir la fiche dans le CRM</a>}
        <div className="at-mail"><div className="at-mail-head"><strong>Mail au prospect</strong><button type="button" onClick={() => { navigator.clipboard?.writeText(mail).then(() => setCopied(true)); }}>{copied ? 'Copié ✓' : 'Copier'}</button></div><textarea readOnly rows={18} value={mail} /></div>
      </div>}
    </section>
  </main>;
}
