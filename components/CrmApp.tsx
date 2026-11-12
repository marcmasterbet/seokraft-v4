'use client';
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, Copy, Check, Plus, Upload, Trash2, ExternalLink, LogOut, Search, FileText } from 'lucide-react';
import {
  STAGES, STAGE_LABEL, SOURCE_LABEL, nextAction, isDue, relanceMail, questionnaireMail, frDate, hostOf,
  type Prospect, type Stage,
} from './crmTypes';

/* CRM privé de SEOKRAFT : prospects, relances J+3 / J+7, documents, questionnaires. */
type Tab = 'tous' | 'jour' | Stage;
const fmtScore = (n: number | null) => (n === null ? '–' : String(n).replace('.', ','));
const scoreTone = (n: number | null) => (n === null ? '' : n < 10 ? 'is-bad' : n < 14 ? 'is-warn' : 'is-ok');
const dt = (iso: string) => new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' });

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const r = await fetch(url, { ...init, headers: init?.body instanceof FormData ? init?.headers : { 'Content-Type': 'application/json', ...(init?.headers || {}) } });
  const d = await r.json().catch(() => ({}));
  if (r.status === 401) throw Object.assign(new Error('Non autorisé'), { auth: true });
  if (!r.ok) throw new Error((d as { error?: string }).error || 'Erreur');
  return d as T;
}

/* Lecture d'un fichier CSV (Excel : « Enregistrer sous » → CSV). */
function parseCsv(raw: string) {
  const text = raw.replace(/^\uFEFF/, "");
  const first = text.split(/\r?\n/)[0] || '';
  const sep = (first.match(/;/g) || []).length >= (first.match(/,/g) || []).length ? (first.includes('\t') ? '\t' : ';') : ',';
  const rows: string[][] = [];
  let cur: string[] = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') q = false; else cell += c; continue; }
    if (c === '"') q = true; else if (c === sep) { cur.push(cell); cell = ''; } else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; cur.push(cell); rows.push(cur); cur = []; cell = ''; } else cell += c;
  }
  if (cell || cur.length) { cur.push(cell); rows.push(cur); }
  const head = (rows.shift() || []).map((h) => h.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''));
  const col = (...names: string[]) => head.findIndex((h) => names.some((n) => h === n || h.startsWith(n)));
  const m = { company: col('entreprise', 'societe'), website: col('site'), phone: col('telephone', 'tel'), email: col('e-mail', 'email', 'mail'), city: col('ville', 'commune'), trade: col('metier', 'activite'), priority: col('priorite'), notes: col('problemes', 'notes', 'remarques', 'presence') , gnote: col('note google'), avis: col('nb avis') };
  return rows.filter((r) => r.some((c) => c.trim())).map((r) => {
    const g = (i: number) => (i >= 0 ? (r[i] || '').trim() : '');
    const extra = [g(m.notes), g(m.gnote) && `Google ${g(m.gnote)}/5${g(m.avis) ? ` (${g(m.avis)} avis)` : ''}`].filter(Boolean).join(' · ');
    return { company: g(m.company), website: g(m.website).replace(/^(aucun.*|—|-)$/i, ''), phone: g(m.phone), email: g(m.email), city: g(m.city), trade: g(m.trade), priority: g(m.priority), notes: extra };
  }).filter((r) => r.company);
}

function CopyButton({ text, label = 'Copier' }: { text: string; label?: string }) {
  const [ok, setOk] = useState(false);
  return <button type="button" className="crm-btn crm-btn-line" onClick={async () => { try { await navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1800); } catch {} }}>{ok ? <Check size={15} /> : <Copy size={15} />}{ok ? 'Copié' : label}</button>;
}

export default function CrmApp() {
  const [logged, setLogged] = useState<boolean | null>(null);
  const [pw, setPw] = useState('');
  const [list, setList] = useState<Prospect[]>([]);
  const [tab, setTab] = useState<Tab>('tous');
  const [q, setQ] = useState('');
  const [sel, setSel] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [creating, setCreating] = useState(false);
  const [info, setInfo] = useState('');
  const importRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try { const d = await api<{ prospects: Prospect[] }>('/api/crm/prospects'); setList(d.prospects); setLogged(true); }
    catch (e) { if ((e as { auth?: boolean }).auth) setLogged(false); else setError((e as Error).message); }
  }, []);
  useEffect(() => { load(); const p = new URLSearchParams(location.search).get('p'); if (p) setSel(p); }, [load]);
  useEffect(() => { const u = new URL(location.href); if (sel) u.searchParams.set('p', sel); else u.searchParams.delete('p'); history.replaceState(null, '', u); }, [sel]);

  const upd = (p: Prospect) => setList((l) => [p, ...l.filter((x) => x.id !== p.id)]);
  async function act(id: string, body: Record<string, unknown>) {
    setBusy(true); setError('');
    try { const d = await api<{ prospect: Prospect }>(`/api/crm/prospects/${id}`, { method: 'PATCH', body: JSON.stringify(body) }); upd(d.prospect); }
    catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }

  async function login(e: FormEvent) {
    e.preventDefault(); setError('');
    try { await api('/api/crm/login', { method: 'POST', body: JSON.stringify({ password: pw }) }); setPw(''); await load(); }
    catch (err) { setError((err as Error).message === 'Non autorisé' ? 'Mot de passe incorrect' : (err as Error).message); }
  }

  async function importCsv(file: File) {
    setInfo('Import en cours…'); setError('');
    try {
      const rows = parseCsv(await file.text());
      if (!rows.length) throw new Error('Aucune ligne lisible : il faut une colonne « Entreprise ».');
      const d = await api<{ created: number; updated: number }>('/api/crm/prospects', { method: 'PUT', body: JSON.stringify({ rows }) });
      setInfo(`${d.created} prospect(s) ajouté(s), ${d.updated} déjà présent(s) complété(s).`);
      await load();
    } catch (e) { setInfo(''); setError((e as Error).message); }
  }

  const today = useMemo(() => list.filter((p) => isDue(nextAction(p))), [list]);
  const counts = useMemo(() => Object.fromEntries(STAGES.map((s) => [s.id, list.filter((p) => p.stage === s.id).length])) as Record<Stage, number>, [list]);
  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return list
      .filter((p) => tab === 'tous' || (tab === 'jour' ? isDue(nextAction(p)) : p.stage === tab))
      .filter((p) => !needle || [p.company, p.contactName, p.email, p.website, p.city, p.trade, p.phone].some((v) => v.toLowerCase().includes(needle)))
      .sort((a, b) => {
        const da = nextAction(a)?.due, db = nextAction(b)?.due;
        const ua = isDue(nextAction(a)) ? 0 : 1, ub = isDue(nextAction(b)) ? 0 : 1;
        const pr = (x: Prospect) => ({ haute: 0, moyenne: 1, basse: 2 } as Record<string, number>)[x.priority.toLowerCase()] ?? 3;
        return ua - ub || (da && db ? da.localeCompare(db) : da ? -1 : db ? 1 : 0) || pr(a) - pr(b) || b.updatedAt.localeCompare(a.updatedAt);
      });
  }, [list, tab, q]);
  const current = list.find((p) => p.id === sel) || null;

  if (logged === null) return <main className="crm crm-center"><p>Chargement…</p></main>;
  if (!logged) return <main className="crm crm-center">
    <form className="crm-login" onSubmit={login}>
      <p className="crm-logo">SEOKRAFT<i>.</i><small>CRM</small></p>
      <label>Mot de passe<input type="password" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus /></label>
      {error && <p className="crm-error" role="alert">{error}</p>}
      <button className="crm-btn" type="submit">Entrer</button>
      <p className="crm-muted">Même mot de passe que l’outil d’audit.</p>
    </form>
  </main>;

  return <main className={`crm${current ? ' crm-has-sel' : ''}`}>
    <header className="crm-top">
      <p className="crm-logo">SEOKRAFT<i>.</i><small>CRM</small></p>
      <label className="crm-search"><Search size={16} aria-hidden="true" /><span className="sr-only">Rechercher</span><input placeholder="Rechercher une entreprise, un e-mail, un site…" value={q} onChange={(e) => setQ(e.target.value)} /></label>
      <div className="crm-top-act">
        <input ref={importRef} type="file" accept=".csv,text/csv" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) importCsv(f); e.target.value = ''; }} />
        <button className="crm-btn crm-btn-line" type="button" onClick={() => importRef.current?.click()}><Upload size={15} />Importer (CSV)</button>
        <button className="crm-btn" type="button" onClick={() => { setCreating(true); setSel(null); }}><Plus size={15} />Nouveau prospect</button>
        <button className="crm-icon" type="button" title="Se déconnecter" onClick={async () => { await fetch('/api/crm/login', { method: 'DELETE' }); setLogged(false); }}><LogOut size={18} /><span className="sr-only">Se déconnecter</span></button>
      </div>
    </header>

    <div className="crm-wrap">
      <section className="crm-list" aria-label="Prospects">
        {today.length > 0 && <button type="button" className="crm-today" onClick={() => setTab('jour')}><b>{today.length} action{today.length > 1 ? 's' : ''} à faire aujourd’hui</b><span>Relances et réponses en attente, le mail est prêt dans chaque fiche.</span></button>}
        {info && <p className="crm-info">{info}</p>}
        {error && !current && <p className="crm-error" role="alert">{error}</p>}
        <div className="crm-tabs" role="tablist">
          {([['tous', 'Tous', list.length], ['jour', 'Aujourd’hui', today.length], ...STAGES.map((s) => [s.id, s.label, counts[s.id]])] as [Tab, string, number][]).map(([id, label, n]) =>
            <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>{label}<em>{n}</em></button>)}
        </div>
        {shown.length === 0 ? <p className="crm-empty">{list.length ? 'Aucun prospect ici.' : 'Aucun prospect pour l’instant. Les demandes d’audit, les messages de contact et les questionnaires arriveront ici automatiquement, ou importez votre liste.'}</p> :
        <div className="crm-rows">
          <div className="crm-row crm-row-head" aria-hidden="true"><span>Entreprise</span><span>Origine</span><span>Note</span><span>Étape</span><span>Prochaine action</span></div>
          {shown.map((p) => { const a = nextAction(p); const due = isDue(a); return <button type="button" key={p.id} className={`crm-row${p.id === sel ? ' sel' : ''}`} onClick={() => { setSel(p.id); setCreating(false); }}>
            <span className="crm-co"><b>{p.company || hostOf(p.website) || p.email || 'Sans nom'}</b><small>{[hostOf(p.website), p.city, p.trade].filter(Boolean).join(' · ') || p.email}</small></span>
            <span><i className={`crm-src crm-src-${p.source}`}>{SOURCE_LABEL[p.source]}</i></span>
            <span className={`crm-score ${scoreTone(p.score)}`}>{fmtScore(p.score)}</span>
            <span className="crm-stage">{STAGE_LABEL[p.stage]}{p.priority ? <small> · {p.priority}</small> : null}</span>
            <span className={due ? 'crm-due' : 'crm-next'}>{a ? `${a.label}${a.due ? ` · ${due ? (new Date(a.due).toDateString() === new Date().toDateString() ? 'aujourd’hui' : `depuis le ${frDate(a.due)}`) : frDate(a.due)}` : ''}` : '—'}</span>
          </button>; })}
        </div>}
      </section>

      <aside className="crm-side">
        {creating ? <NewProspect onClose={() => setCreating(false)} onCreated={(p) => { upd(p); setCreating(false); setSel(p.id); }} />
          : current ? <Fiche key={current.id} p={current} busy={busy} error={error} act={act} onBack={() => setSel(null)} onDeleted={() => { setList((l) => l.filter((x) => x.id !== current.id)); setSel(null); }} onUpdated={upd} />
          : <div className="crm-placeholder"><FileText size={28} aria-hidden="true" /><p>Choisissez un prospect pour voir sa fiche.</p></div>}
      </aside>
    </div>
  </main>;
}

function NewProspect({ onClose, onCreated }: { onClose: () => void; onCreated: (p: Prospect) => void }) {
  const [f, setF] = useState({ company: '', contactName: '', email: '', phone: '', website: '', city: '', trade: '' });
  const [err, setErr] = useState('');
  return <form className="crm-fiche" onSubmit={async (e) => { e.preventDefault(); try { onCreated((await api<{ prospect: Prospect }>('/api/crm/prospects', { method: 'POST', body: JSON.stringify(f) })).prospect); } catch (x) { setErr((x as Error).message); } }}>
    <button type="button" className="crm-back" onClick={onClose}><ArrowLeft size={16} />Retour</button>
    <p className="crm-eye">NOUVEAU PROSPECT</p>
    <div className="crm-fields">{([['company', 'Entreprise'], ['contactName', 'Contact (prénom nom)'], ['email', 'E-mail'], ['phone', 'Téléphone'], ['website', 'Site'], ['city', 'Ville'], ['trade', 'Métier']] as [keyof typeof f, string][]).map(([k, l]) =>
      <label key={k}>{l}<input value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></label>)}</div>
    {err && <p className="crm-error" role="alert">{err}</p>}
    <button className="crm-btn" type="submit">Créer la fiche</button>
  </form>;
}

function Fiche({ p, busy, error, act, onBack, onDeleted, onUpdated }: { p: Prospect; busy: boolean; error: string; act: (id: string, b: Record<string, unknown>) => Promise<void>; onBack: () => void; onDeleted: () => void; onUpdated: (p: Prospect) => void }) {
  const [edit, setEdit] = useState(false);
  const [f, setF] = useState({ company: p.company, contactName: p.contactName, email: p.email, phone: p.phone, website: p.website, city: p.city, trade: p.trade, bulletinId: p.bulletinId, score: p.score === null ? '' : String(p.score) });
  const [note, setNote] = useState('');
  const [plan, setPlan] = useState({ label: '', due: '' });
  const [showQ, setShowQ] = useState(false);
  const [showQm, setShowQm] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [upErr, setUpErr] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const a = nextAction(p);
  const relance = a?.kind === 'relance' && a.relanceStep ? relanceMail(p, a.relanceStep) : null;
  const qm = questionnaireMail(p);
  const stepIdx = STAGES.findIndex((s) => s.id === p.stage);

  async function upload(file: File) {
    setUpErr('');
    const fd = new FormData(); fd.append('file', file);
    try { onUpdated((await api<{ prospect: Prospect }>(`/api/crm/prospects/${p.id}/doc`, { method: 'POST', body: fd })).prospect); }
    catch (e) { setUpErr((e as Error).message); }
  }

  return <div className="crm-fiche">
    <button type="button" className="crm-back" onClick={onBack}><ArrowLeft size={16} />Liste</button>
    <p className="crm-eye">FICHE PROSPECT · {SOURCE_LABEL[p.source].toUpperCase()}</p>
    <h2>{p.company || hostOf(p.website) || p.email || 'Sans nom'}</h2>
    {!edit ? <p className="crm-meta">
      {[p.contactName, p.email && <a key="m" href={`mailto:${p.email}`}>{p.email}</a>, p.phone && <a key="t" href={`tel:${p.phone.replace(/\s/g, '')}`}>{p.phone}</a>].filter(Boolean).map((x, i) => <span key={i}>{x}</span>)}
      <br />{p.website && <a href={/^https?:/.test(p.website) ? p.website : `https://${p.website}`} target="_blank" rel="noopener noreferrer">{hostOf(p.website)} <ExternalLink size={12} /></a>}{[p.city, p.trade].filter(Boolean).map((x) => <span key={x}> · {x}</span>)}
      <span> · créé le {frDate(p.createdAt)}</span> <button type="button" className="crm-link" onClick={() => setEdit(true)}>Modifier</button>
    </p> : <form className="crm-fields" onSubmit={async (e) => { e.preventDefault(); await act(p.id, { action: 'update', fields: f }); setEdit(false); }}>
      {([['company', 'Entreprise'], ['contactName', 'Contact'], ['email', 'E-mail'], ['phone', 'Téléphone'], ['website', 'Site'], ['city', 'Ville'], ['trade', 'Métier'], ['bulletinId', 'Identifiant du bulletin'], ['score', 'Note /20']] as [keyof typeof f, string][]).map(([k, l]) =>
        <label key={k}>{l}<input value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></label>)}
      <div className="crm-act"><button className="crm-btn" type="submit" disabled={busy}>Enregistrer</button><button className="crm-btn crm-btn-line" type="button" onClick={() => setEdit(false)}>Annuler</button></div>
    </form>}

    <div className="crm-steps" aria-label={`Étape : ${STAGE_LABEL[p.stage]}`}>{STAGES.filter((s) => s.id !== 'perdu').map((s, i) => <i key={s.id} className={p.stage !== 'perdu' && i <= stepIdx ? 'd' : ''} title={s.label} />)}</div>
    <label className="crm-stage-sel">Étape<select value={p.stage} disabled={busy} onChange={(e) => act(p.id, { action: 'stage', stage: e.target.value })}>{STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</select></label>
    {error && <p className="crm-error" role="alert">{error}</p>}

    {a && <div className={`crm-next-box${isDue(a) ? ' due' : ''}`}>
      <p><b>{a.label}</b>{a.due && <> · {isDue(a) ? 'à faire' : 'prévu'} le {frDate(a.due)}</>}</p>
      {relance && <>
        <p className="crm-mail-head">À : {p.email || 'e-mail inconnu'}<br />Objet : {relance.subject}</p>
        <pre className="crm-mail">{relance.body}</pre>
        <div className="crm-act"><CopyButton text={`${relance.subject}\n\n${relance.body}`} label="Copier le mail" />{p.email && <a className="crm-btn crm-btn-line" href={`mailto:${p.email}?subject=${encodeURIComponent(relance.subject)}&body=${encodeURIComponent(relance.body)}`}>Ouvrir dans ma messagerie</a>}<button className="crm-btn" type="button" disabled={busy} onClick={() => act(p.id, { action: 'relance' })}>Marquer comme relancé</button></div>
      </>}
      {a.kind === 'manuel' && <button className="crm-btn crm-btn-line" type="button" disabled={busy} onClick={() => act(p.id, { action: 'manual', label: '' })}>C’est fait</button>}
    </div>}

    <div className="crm-act">
      {p.bulletinId && ['a_contacter', 'audit_demande'].includes(p.stage) && <button className="crm-btn" type="button" disabled={busy} onClick={() => act(p.id, { action: 'stage', stage: 'audit_envoye' })}>J’ai envoyé l’audit (lance les relances)</button>}
      {!p.bulletinId && p.website && <a className="crm-btn crm-btn-line" href={`/outil-audit?${new URLSearchParams({ url: p.website, prenom: (p.contactName || '').split(' ')[0] })}`} target="_blank" rel="noopener noreferrer">Auditer ce site</a>}
      <button className="crm-btn crm-btn-line" type="button" onClick={() => setShowQm(!showQm)}>Envoyer le questionnaire</button>
    </div>
    {showQm && <div className="crm-box"><h3>QUESTIONNAIRE À ENVOYER</h3><p className="crm-mail-head">Objet : {qm.subject}</p><pre className="crm-mail">{qm.body}</pre><div className="crm-act"><CopyButton text={`${qm.subject}\n\n${qm.body}`} label="Copier le mail" />{p.email && <a className="crm-btn crm-btn-line" href={`mailto:${p.email}?subject=${encodeURIComponent(qm.subject)}&body=${encodeURIComponent(qm.body)}`}>Ouvrir dans ma messagerie</a>}</div></div>}

    <form className="crm-plan" onSubmit={async (e) => { e.preventDefault(); if (!plan.label.trim()) return; await act(p.id, { action: 'manual', ...plan }); setPlan({ label: '', due: '' }); }}>
      <label>Prévoir une action<input placeholder="Ex. : rappeler, appel le 21/11 à 10 h…" value={plan.label} onChange={(e) => setPlan({ ...plan, label: e.target.value })} /></label>
      <label>Date<input type="date" value={plan.due} onChange={(e) => setPlan({ ...plan, due: e.target.value })} /></label>
      <button className="crm-btn crm-btn-line" type="submit" disabled={busy}>Ajouter</button>
    </form>

    <div className="crm-box"><h3>DOCUMENTS</h3>
      {p.bulletinId && <div className="crm-doc"><a href={`/bulletin/${p.bulletinId}`} target="_blank" rel="noopener noreferrer">Bulletin d’audit{p.score !== null ? ` · ${fmtScore(p.score)}/20` : ''}</a><span>en ligne · PDF depuis la page</span></div>}
      {p.docs.map((d) => <div className="crm-doc" key={d.url}><a href={d.url} target="_blank" rel="noopener noreferrer">{d.name}</a><span>{frDate(d.at)} · {Math.round(d.size / 1024)} Ko <button type="button" className="crm-icon" title="Supprimer" onClick={() => act(p.id, { action: 'removeDoc', url: d.url })}><Trash2 size={14} /><span className="sr-only">Supprimer {d.name}</span></button></span></div>)}
      <input ref={fileRef} type="file" accept="application/pdf,image/png,image/jpeg,image/webp" hidden onChange={(e) => { const x = e.target.files?.[0]; if (x) upload(x); e.target.value = ''; }} />
      <button type="button" className="crm-link" onClick={() => fileRef.current?.click()}>+ Ajouter un PDF (devis, bulletin, contrat…)</button>
      {upErr && <p className="crm-error" role="alert">{upErr}</p>}
    </div>

    {p.questionnaire && <div className="crm-box"><h3>QUESTIONNAIRE DE PROJET · REÇU LE {frDate(p.questionnaire.at).toUpperCase()}</h3>
      <pre className={`crm-mail${showQ ? '' : ' crm-clip'}`}>{p.questionnaire.text}</pre>
      <div className="crm-act"><button type="button" className="crm-link" onClick={() => setShowQ(!showQ)}>{showQ ? 'Réduire' : 'Voir toutes les réponses'}</button><CopyButton text={p.questionnaire.text} /></div>
    </div>}

    <div className="crm-box"><h3>HISTORIQUE ET NOTES</h3>
      <form className="crm-note" onSubmit={async (e) => { e.preventDefault(); if (!note.trim()) return; await act(p.id, { action: 'note', text: note }); setNote(''); }}>
        <textarea rows={2} placeholder="Ajouter une note (appel, rendez-vous, remarque…)" value={note} onChange={(e) => setNote(e.target.value)} />
        <button className="crm-btn" type="submit" disabled={busy || !note.trim()}>Noter</button>
      </form>
      <ul className="crm-tl">{[...p.history].reverse().map((h, i) => <li key={i} className={`crm-tl-${h.kind}`}><b>{dt(h.at)}</b> {h.text}</li>)}</ul>
    </div>

    <div className="crm-danger">{confirmDel ? <><span>Supprimer définitivement cette fiche et ses documents ?</span><button className="crm-btn crm-btn-bad" type="button" onClick={async () => { await api(`/api/crm/prospects/${p.id}`, { method: 'DELETE' }); onDeleted(); }}>Oui, supprimer</button><button className="crm-btn crm-btn-line" type="button" onClick={() => setConfirmDel(false)}>Annuler</button></> : <button type="button" className="crm-link crm-link-bad" onClick={() => setConfirmDel(true)}>Supprimer la fiche</button>}</div>
  </div>;
}
