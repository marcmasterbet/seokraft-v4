'use client';
import { useEffect, useState, type FormEvent } from 'react';
import { NOTE_LABELS, buildProspectMail, buildBulletinMail, fmt20, type Bulletin } from './auditTypes';
type Result = Bulletin & { aiError?: string; speedError?: boolean; speedNoKey?: boolean; scrubbed?: string[]; crmId?: string; warnings?: string[] };

/* Outil privé de Marc. Deux façons de faire un audit :
   - avec le projet Claude (recommandé, sans IA payante) : 1. mesurer le site, 2. importer la réponse du projet ;
   - audit automatique (IA payante, ancien fonctionnement). */
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
  const [mode, setMode] = useState<'projet' | 'auto'>('projet');
  const [measures, setMeasures] = useState('');
  const [mCopied, setMCopied] = useState(false);
  const [answer, setAnswer] = useState('');

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
      setB(d as Result);
    } catch (err) { setError(err instanceof Error ? err.message : 'Erreur.'); }
    finally { setBusy(false); }
  }

  async function call(path: string, body: object) {
    const r = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-audit-key': key }, body: JSON.stringify(body) });
    const d = await r.json().catch(() => ({}));
    if (r.status === 401) { setLogged(false); try { sessionStorage.removeItem(KEY_STORE); } catch {} throw new Error('Mot de passe incorrect.'); }
    if (!r.ok) throw new Error(d.error || 'Erreur.');
    return d;
  }
  async function measure(e: FormEvent) {
    e.preventDefault(); setError(''); setB(null); setMeasures(''); setMCopied(false); setBusy(true);
    try { const d = await call('/api/outil-audit/mesurer', { url }); setMeasures(d.text); setUrl(d.url); }
    catch (err) { setError(err instanceof Error ? err.message : 'Erreur.'); }
    finally { setBusy(false); }
  }
  async function publish(e: FormEvent) {
    e.preventDefault(); setError(''); setB(null); setCopied(false); setBusy(true);
    try { setB(await call('/api/outil-audit/importer', { audit: answer, prenom: firstName }) as Result); }
    catch (err) { setError(err instanceof Error ? err.message : 'Erreur.'); }
    finally { setBusy(false); }
  }

  function login(e: FormEvent) { e.preventDefault(); try { sessionStorage.setItem(KEY_STORE, key); } catch {} setLogged(true); }

  if (!logged) return <main className="at at-login"><form onSubmit={login}><h1>Outil d’audit<span>.</span></h1><p>Accès réservé.</p><label>Mot de passe<input type="password" value={key} onChange={(e) => setKey(e.target.value)} required autoComplete="current-password" /></label><button className="button button-olive" type="submit">Entrer</button></form></main>;

  const link = b ? `/bulletin/${b.id}` : '';
  const mail = b ? (kind === 'prospection' ? buildProspectMail : buildBulletinMail)(b, firstName) : '';
  return <main className="at">
    <section className="at-panel">
      <h1>Outil d’audit<span>.</span></h1>
      <div className="at-modes" role="tablist">
        <button type="button" role="tab" aria-selected={mode === 'projet'} className={mode === 'projet' ? 'on' : ''} onClick={() => { setMode('projet'); setB(null); setError(''); }}>Avec le projet Claude <small>recommandé, sans IA payante</small></button>
        <button type="button" role="tab" aria-selected={mode === 'auto'} className={mode === 'auto' ? 'on' : ''} onClick={() => { setMode('auto'); setB(null); setError(''); }}>Audit automatique <small>IA payante</small></button>
      </div>
      {mode === 'auto' ? <>
      <form className="at-form" onSubmit={run}>
        <label>Adresse du site<input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="monentreprise.fr" required /></label>
        <label>Prénom du contact <small>(pour le mail)</small><input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Facultatif" /></label>
        <span />
        <button className="button button-olive" type="submit" disabled={busy}>{busy ? 'Analyse en cours…' : 'Lancer l’audit'}</button>
      </form>
      {busy && <p className="at-busy" role="status">Analyse du site, mesures Google et audit SEO : environ 1 à 2 minutes…</p>}
      </> : <>
      <div className="at-step">
        <h2><span>1</span>Mesurer le site</h2>
        <form className="at-form" onSubmit={measure}>
          <label>Adresse du site<input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="monentreprise.fr" required /></label>
          <label>Prénom du contact <small>(pour le mail)</small><input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Facultatif" /></label>
          <span />
          <button className="button button-olive" type="submit" disabled={busy}>{busy && !answer ? 'Mesure en cours…' : 'Mesurer'}</button>
        </form>
        {busy && !measures && <p className="at-busy" role="status">Lecture du site et mesures Google (téléphone et ordinateur) : environ 1 minute…</p>}
        {measures && <div className="at-mail"><div className="at-mail-head"><strong>Mesures à coller dans le projet « Audits SEOKRAFT »</strong><button type="button" onClick={() => { navigator.clipboard?.writeText(`Audit de ${url}\n\n${measures}`).then(() => setMCopied(true)); }}>{mCopied ? 'Copié ✓' : 'Copier les mesures'}</button></div><textarea readOnly rows={10} value={`Audit de ${url}\n\n${measures}`} /><p className="at-hint">Dans le projet Claude : colle ces mesures, ajoute si possible une capture de l’accueil, puis envoie. Copie ensuite toute sa réponse.</p></div>}
      </div>
      <div className="at-step">
        <h2><span>2</span>Publier l’audit</h2>
        <form onSubmit={publish} className="at-import">
          <label>Réponse du projet Claude <small>(colle toute la réponse, ou seulement le bloc JSON)</small><textarea rows={8} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder='{ "format": "seokraft-audit-1", … }' required /></label>
          <button className="button button-olive" type="submit" disabled={busy}>{busy && answer ? 'Contrôle et publication…' : 'Contrôler et publier l’audit'}</button>
        </form>
      </div>
      </>}
      {error && <p className="form-error" role="alert">{error}</p>}
      {b && <div className="at-actions">
        <p className="at-result"><strong>{b.host} : {fmt20(b.global)}/20</strong> — {b.verdict}<br />{NOTE_LABELS.map((n) => `${n.label} ${fmt20(b.notes[n.id] ?? null)}`).join(' · ')}{b.cap && <><br />{b.cap}</>}{b.warnings?.map((w) => <span key={w}><br /><em className="at-alert">{w}</em></span>)}{!b.ai && <><br /><em className="at-alert">IA indisponible ({b.aiError || 'erreur'}) : référencement non évalué. Corriger puis relancer avant d’envoyer.</em></>}{b.checks?.some((c) => c.label === 'Mentions légales' && c.status === 'bad') && <><br /><em className="at-alert">Mentions légales non trouvées : vérifie le bas de son site avant d’envoyer (si elles existent, ne pas envoyer cet audit et me prévenir).</em></>}{!!b.scrubbed?.length && <><br /><em className="at-alert">Phrase(s) de l’IA retirée(s) car contraire(s) aux vérifications : {b.scrubbed.map((x) => `« ${x} »`).join(' ; ')}. Relis l’audit.</em></>}{b.speedError && <><br /><em className="at-alert">{b.speedNoKey ? 'Mesure de vitesse Google indisponible : ajouter PSI_API_KEY dans Vercel.' : 'Google n’a pas répondu à temps pour la mesure de vitesse : la note Vitesse est estimée sans elle. Relance l’audit dans quelques minutes avant de l’envoyer.'}</em></>}</p>
        <a className="button button-olive" href={link} target="_blank" rel="noopener noreferrer">Ouvrir l’audit (relire, télécharger le PDF)</a>{b.crmId && <a className="button button-dark" href={`/crm?p=${b.crmId}`} target="_blank" rel="noopener noreferrer">Voir la fiche dans le CRM</a>}
        <div className="at-mail"><div className="at-mail-head"><strong>Mail au prospect</strong><span className="at-kind"><button type="button" className={kind === 'prospection' ? 'on' : ''} onClick={() => { setKind('prospection'); setCopied(false); }}>Prospection</button><button type="button" className={kind === 'demande' ? 'on' : ''} onClick={() => { setKind('demande'); setCopied(false); }}>Il a demandé l’audit</button></span><button type="button" onClick={() => { navigator.clipboard?.writeText(mail).then(() => setCopied(true)); }}>{copied ? 'Copié ✓' : 'Copier'}</button></div><textarea readOnly rows={18} value={mail} /></div>
      </div>}
    </section>
  </main>;
}
