'use client';
import { useEffect, useState, type FormEvent } from 'react';
import { buildProspectMail, buildBulletinMail, fmt20, type Bulletin } from './auditTypes';
type Result = Bulletin & { speedError?: boolean; speedNoKey?: boolean; crmId?: string };

/* Outil privé de Marc : une adresse, un clic, l'audit est publié et rangé dans le CRM (sans IA, sans coût). */
const KEY_STORE = 'seokraft_audit_key';

export default function AuditTool() {
  const [key, setKey] = useState('');
  const [logged, setLogged] = useState(false);
  const [url, setUrl] = useState('');
  const [firstName, setFirstName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [b, setB] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);
  const [kind, setKind] = useState<'demande' | 'prospection'>('prospection');

  useEffect(() => {
    try { const k = sessionStorage.getItem(KEY_STORE); if (k) { setKey(k); setLogged(true); } } catch {}
    const q = new URLSearchParams(window.location.search);
    if (q.get('url')) { setUrl(q.get('url') || ''); setKind('demande'); }
    if (q.get('prenom')) setFirstName(q.get('prenom') || '');
  }, []);

  async function run(e: FormEvent) {
    e.preventDefault(); setError(''); setB(null); setCopied(false); setBusy(true);
    try {
      const r = await fetch('/api/outil-audit', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-audit-key': key }, body: JSON.stringify({ url, prenom: firstName }) });
      const d = await r.json().catch(() => ({}));
      if (r.status === 401) { setLogged(false); try { sessionStorage.removeItem(KEY_STORE); } catch {} throw new Error('Mot de passe incorrect.'); }
      if (!r.ok) throw new Error(d.error || 'Analyse impossible.');
      setB(d as Result);
    } catch (err) { setError(err instanceof Error ? err.message : 'Erreur.'); }
    finally { setBusy(false); }
  }

  function login(e: FormEvent) { e.preventDefault(); try { sessionStorage.setItem(KEY_STORE, key); } catch {} setLogged(true); }

  if (!logged) return <main className="at at-login"><form onSubmit={login}><h1>Outil d’audit<span>.</span></h1><p>Accès réservé.</p><label>Mot de passe<input type="password" value={key} onChange={(e) => setKey(e.target.value)} required autoComplete="current-password" /></label><button className="button button-olive" type="submit">Entrer</button></form></main>;

  const link = b ? `/bulletin/${b.id}` : '';
  const mail = b ? (kind === 'prospection' ? buildProspectMail : buildBulletinMail)(b, firstName) : '';
  const top = b?.facts ? b.facts.problems.map((id) => b.facts!.points.find((p) => p.id === id)!).filter(Boolean) : [];
  return <main className="at">
    <section className="at-panel">
      <h1>Outil d’audit<span>.</span></h1>
      <form className="at-form" onSubmit={run}>
        <label>Adresse du site<input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="monentreprise.fr" required /></label>
        <label>Prénom du contact <small>(pour le mail)</small><input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Facultatif" /></label>
        <span />
        <button className="button button-olive" type="submit" disabled={busy}>{busy ? 'Audit en cours…' : 'Lancer l’audit'}</button>
      </form>
      {busy && <p className="at-busy" role="status">Lecture du site et mesure de vitesse par Google : environ 1 minute…</p>}
      {error && <p className="form-error" role="alert">{error}</p>}
      {b && <div className="at-actions">
        <p className="at-result"><strong>{b.host} : {fmt20(b.global)}/20</strong> — {b.verdict}
          {top.map((p, i) => <span key={p.id}><br />{i + 1}. {p.title}</span>)}
          {b.speedError && <><br /><em className="at-alert">{b.speedNoKey ? 'Mesure de vitesse Google indisponible : ajouter PSI_API_KEY dans Vercel.' : 'Google n’a pas répondu à temps pour la mesure de vitesse : relance l’audit dans quelques minutes avant de l’envoyer.'}</em></>}
        </p>
        <a className="button button-olive" href={link} target="_blank" rel="noopener noreferrer">Ouvrir l’audit (relire, télécharger le PDF)</a>{b.crmId && <a className="button button-dark" href={`/crm?p=${b.crmId}`} target="_blank" rel="noopener noreferrer">Voir la fiche dans le CRM</a>}
        <div className="at-mail"><div className="at-mail-head"><strong>Mail au prospect</strong><span className="at-kind"><button type="button" className={kind === 'prospection' ? 'on' : ''} onClick={() => { setKind('prospection'); setCopied(false); }}>Prospection</button><button type="button" className={kind === 'demande' ? 'on' : ''} onClick={() => { setKind('demande'); setCopied(false); }}>Il a demandé l’audit</button></span><button type="button" onClick={() => { navigator.clipboard?.writeText(mail).then(() => setCopied(true)); }}>{copied ? 'Copié ✓' : 'Copier'}</button></div><textarea readOnly rows={18} value={mail} /></div>
      </div>}
    </section>
  </main>;
}
