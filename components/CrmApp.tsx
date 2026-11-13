'use client';
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, Copy, Check, Plus, Upload, Trash2, ExternalLink, LogOut, Search, FileText, List, Columns3, Rows3, LayoutGrid, Archive, Undo2 } from 'lucide-react';
import {
  STAGES, STAGE_LABEL, SOURCE_LABEL, ACTIVE, isClient, clientActions, reviewMail, emptyClient, nextAction, isDue, relanceMail, questionnaireMail, frDate, hostOf,
  type Prospect, type Stage, type ClientInfo,
} from './crmTypes';

/* CRM privé de SEOKRAFT : prospects, relances J+3 / J+7, documents, questionnaires. */
type Tab = 'tous' | 'jour' | Stage;
type View = 'liste' | 'tableau';
type Space = 'prospects' | 'clients';
const PSTAGES = STAGES.filter((x) => x.id !== 'client');
type Density = 'cartes' | 'lignes';
const pref = <T extends string>(k: string, d: T): T => { try { return (localStorage.getItem(k) as T) || d; } catch { return d; } };
const setPref = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch {} };
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
  const m = { company: col('entreprise', 'societe'), website: col('site'), phone: col('telephone', 'tel'), email: col('e-mail', 'email', 'mail'), city: col('ville', 'commune'), trade: col('metier', 'activite'), priority: col('priorite'), notes: col('problemes', 'notes', 'remarques', 'presence') , gnote: col('note google'), avis: col('nb avis'), address: col('adresse'), siret: col('siret') };
  return rows.filter((r) => r.some((c) => c.trim())).map((r) => {
    const g = (i: number) => (i >= 0 ? (r[i] || '').trim() : '');
    const google = g(m.gnote) ? `${g(m.gnote).replace('.', ',')}/5${g(m.avis) ? ` (${g(m.avis)} avis)` : ''}` : '';
    return { company: g(m.company), website: g(m.website).replace(/^(aucun.*|—|-)$/i, ''), phone: g(m.phone), email: g(m.email), city: g(m.city), trade: g(m.trade), priority: g(m.priority), notes: g(m.notes), google, address: g(m.address), siret: g(m.siret) };
  }).filter((r) => r.company);
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  const empty = children === '' || children === null || children === undefined || children === false;
  return <><dt>{label}</dt><dd className={empty ? 'crm-empty-val' : ''}>{empty ? 'à compléter' : children}</dd></>;
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
  const [space, setSpace] = useState<Space>('prospects');
  const [view, setView] = useState<View>('liste');
  const [density, setDensity] = useState<Density>('cartes');
  const [dragOver, setDragOver] = useState<Stage | null>(null);
  useEffect(() => { setView(pref<View>('crm_view', 'liste')); setSpace(pref<Space>('crm_space', 'prospects')); setDensity(pref<Density>('crm_density', 'cartes')); }, []);
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

  const prospects = useMemo(() => list.filter((p) => !isClient(p)), [list]);
  const clients = useMemo(() => list.filter(isClient), [list]);
  const active = useMemo(() => prospects.filter(ACTIVE), [prospects]);
  const today = useMemo(() => prospects.filter((p) => isDue(nextAction(p))), [prospects]);
  const clientToday = useMemo(() => clients.filter((p) => clientActions(p).some((a) => new Date(a.due).getTime() <= Date.now())), [clients]);
  const counts = useMemo(() => Object.fromEntries(STAGES.map((s) => [s.id, list.filter((p) => p.stage === s.id).length])) as Record<Stage, number>, [list]);
  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (space === 'clients' ? clients : prospects)
      .filter((p) => space === 'clients' || view === 'tableau' || (tab === 'tous' ? ACTIVE(p) : tab === 'jour' ? isDue(nextAction(p)) : p.stage === tab))
      .filter((p) => !needle || [p.company, p.contactName, p.email, p.website, p.city, p.trade, p.phone].some((v) => v.toLowerCase().includes(needle)))
      .sort((a, b) => {
        const da = nextAction(a)?.due, db = nextAction(b)?.due;
        const ua = isDue(nextAction(a)) ? 0 : 1, ub = isDue(nextAction(b)) ? 0 : 1;
        const pr = (x: Prospect) => ({ haute: 0, moyenne: 1, basse: 2 } as Record<string, number>)[x.priority.toLowerCase()] ?? 3;
        return ua - ub || (da && db ? da.localeCompare(db) : da ? -1 : db ? 1 : 0) || pr(a) - pr(b) || b.updatedAt.localeCompare(a.updatedAt);
      });
  }, [list, tab, q, view, space, clients, prospects]);
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

  return <main className={`crm crm-view-${space === 'clients' ? 'liste' : view}${current || creating ? ' crm-has-sel' : ''}`}>
    <header className="crm-top">
      <p className="crm-logo">SEOKRAFT<i>.</i><small>CRM</small></p>
      <label className="crm-search"><Search size={16} aria-hidden="true" /><span className="sr-only">Rechercher</span><input placeholder="Rechercher une entreprise, un e-mail, un site…" value={q} onChange={(e) => setQ(e.target.value)} /></label>
      <div className="crm-seg crm-space" role="group" aria-label="Espace">
        <button type="button" className={space === 'prospects' ? 'on' : ''} aria-pressed={space === 'prospects'} onClick={() => { setSpace('prospects'); setPref('crm_space', 'prospects'); setSel(null); }}>Prospects<em>{active.length}</em></button>
        <button type="button" className={space === 'clients' ? 'on' : ''} aria-pressed={space === 'clients'} onClick={() => { setSpace('clients'); setPref('crm_space', 'clients'); setSel(null); }}>Clients<em>{clients.length}</em>{clientToday.length > 0 && <i className="crm-dot" title="Rappels du jour" />}</button>
      </div>
      {space === 'prospects' && <div className="crm-seg" role="group" aria-label="Affichage">
        <button type="button" className={view === 'liste' ? 'on' : ''} aria-pressed={view === 'liste'} onClick={() => { setView('liste'); setPref('crm_view', 'liste'); }}><List size={15} />Liste</button>
        <button type="button" className={view === 'tableau' ? 'on' : ''} aria-pressed={view === 'tableau'} onClick={() => { setView('tableau'); setPref('crm_view', 'tableau'); }}><Columns3 size={15} />Tableau</button>
      </div>}
      {space === 'prospects' && view === 'tableau' && <div className="crm-seg" role="group" aria-label="Taille des fiches">
        <button type="button" className={density === 'cartes' ? 'on' : ''} aria-pressed={density === 'cartes'} title="Cartes" onClick={() => { setDensity('cartes'); setPref('crm_density', 'cartes'); }}><LayoutGrid size={15} />Cartes</button>
        <button type="button" className={density === 'lignes' ? 'on' : ''} aria-pressed={density === 'lignes'} title="Lignes compactes" onClick={() => { setDensity('lignes'); setPref('crm_density', 'lignes'); }}><Rows3 size={15} />Lignes</button>
      </div>}
      <div className="crm-top-act">
        {space === 'prospects' && <input ref={importRef} type="file" accept=".csv,text/csv" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) importCsv(f); e.target.value = ''; }} />}
        {space === 'prospects' && <button className="crm-btn crm-btn-line" type="button" onClick={() => importRef.current?.click()}><Upload size={15} />Importer (CSV)</button>}
        <button className="crm-btn" type="button" onClick={() => { setCreating(true); setSel(null); }}><Plus size={15} />{space === 'clients' ? 'Nouveau client' : 'Nouveau prospect'}</button>
        <button className="crm-icon" type="button" title="Se déconnecter" onClick={async () => { await fetch('/api/crm/login', { method: 'DELETE' }); setLogged(false); }}><LogOut size={18} /><span className="sr-only">Se déconnecter</span></button>
      </div>
    </header>

    <div className="crm-wrap">
      <section className="crm-list" aria-label="Prospects">
        {space === 'clients' && clientToday.length > 0 && <div className="crm-today"><b>{clientToday.length} rappel{clientToday.length > 1 ? 's' : ''} client aujourd’hui</b><span>Facture de maintenance, recommandation LinkedIn, fin d’engagement ou domaine : cliquez sur « Fait » une fois l’action faite.</span></div>}
        {space === 'prospects' && today.length > 0 && <button type="button" className="crm-today" onClick={() => { setTab('jour'); setView('liste'); }}><b>{today.length} action{today.length > 1 ? 's' : ''} à faire aujourd’hui</b><span>Relances et réponses en attente, le mail est prêt dans chaque fiche.</span></button>}
        {info && <p className="crm-info">{info}</p>}
        {error && !current && <p className="crm-error" role="alert">{error}</p>}
        {space === 'prospects' && view === 'liste' && <div className="crm-tabs" role="tablist">
          {([['tous', 'Tous', active.length], ['jour', 'Aujourd’hui', today.length], ...PSTAGES.map((s) => [s.id, s.label, counts[s.id]])] as [Tab, string, number][]).map(([id, label, n]) =>
            <button key={id} role="tab" aria-selected={tab === id} className={`${tab === id ? 'on' : ''}${id === 'cote' ? ' crm-tab-cote' : ''}`} onClick={() => setTab(id)}>{label}<em>{n}</em></button>)}
        </div>}
        {space === 'clients' ? <ClientTable items={shown} sel={sel} onSel={(id) => { setSel(id); setCreating(false); }} onDone={(id, what) => act(id, { action: 'clientDone', what })} /> : view === 'tableau' ? <div className={`crm-board crm-board-${density}`}>
          {PSTAGES.map((st) => { const items = shown.filter((p) => p.stage === st.id); return <section key={st.id} className={`crm-col crm-col-${st.id}${dragOver === st.id ? ' over' : ''}`} aria-label={st.label}
            onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; if (dragOver !== st.id) setDragOver(st.id); }}
            onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(null); }}
            onDrop={(e) => { e.preventDefault(); setDragOver(null); const id = e.dataTransfer.getData('text/plain'); const p = list.find((x) => x.id === id); if (p && p.stage !== st.id) { setList((l) => l.map((x) => (x.id === id ? { ...x, stage: st.id } : x))); act(id, { action: 'stage', stage: st.id }); } }}>
            <h3>{st.label}<em>{items.length}</em></h3>
            <div className="crm-col-body">{items.map((p) => { const a = nextAction(p); const due = isDue(a); return <div role="button" tabIndex={0} key={p.id} draggable className={`crm-card${p.id === sel ? ' sel' : ''}`}
              onDragStart={(e) => { e.dataTransfer.setData('text/plain', p.id); e.dataTransfer.effectAllowed = 'move'; }} onClick={() => { setSel(p.id); setCreating(false); }}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSel(p.id); setCreating(false); } }}>
              <b>{p.company || hostOf(p.website) || p.email || 'Sans nom'}</b>
              <small>{[hostOf(p.website), p.trade].filter(Boolean).join(' · ') || p.email || 'Pas de site'}</small>
              <span className="crm-card-foot"><span className={`crm-score ${scoreTone(p.score)}`}>{fmtScore(p.score)}</span><span className={due ? 'crm-due' : 'crm-next'}>{a ? (a.due ? `${a.label.replace(/ \((audit|devis)\)/, '')}${due ? '' : ` · ${frDate(a.due)}`}` : p.priority || '') : p.priority}</span></span>
            </div>; })}{items.length === 0 && <p className="crm-col-empty">{st.id === 'cote' ? 'Glissez ici les prospects peu importants ou réfractaires.' : 'Glissez une fiche ici'}</p>}</div>
          </section>; })}
        </div> : shown.length === 0 ? <p className="crm-empty">{list.length ? 'Aucun prospect ici.' : 'Aucun prospect pour l’instant. Les demandes d’audit, les messages de contact et les questionnaires arriveront ici automatiquement, ou importez votre liste.'}</p> :
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
        {creating ? <NewProspect asClient={space === 'clients'} onClose={() => setCreating(false)} onCreated={(p) => { upd(p); setCreating(false); setSel(p.id); }} />
          : current ? <Fiche key={current.id} p={current} busy={busy} error={error} act={act} onBack={() => setSel(null)} onDeleted={() => { setList((l) => l.filter((x) => x.id !== current.id)); setSel(null); }} onUpdated={upd} />
          : <div className="crm-placeholder"><FileText size={28} aria-hidden="true" /><p>Choisissez un prospect pour voir sa fiche.</p></div>}
      </aside>
    </div>
  </main>;
}

function NewProspect({ onClose, onCreated, asClient = false }: { onClose: () => void; onCreated: (p: Prospect) => void; asClient?: boolean }) {
  const [f, setF] = useState({ company: '', contactName: '', email: '', phone: '', website: '', address: '', city: '', trade: '', siret: '' });
  const [err, setErr] = useState('');
  return <form className="crm-fiche" onSubmit={async (e) => { e.preventDefault(); try {
    let p = (await api<{ prospect: Prospect }>('/api/crm/prospects', { method: 'POST', body: JSON.stringify(f) })).prospect;
    if (asClient) p = (await api<{ prospect: Prospect }>(`/api/crm/prospects/${p.id}`, { method: 'PATCH', body: JSON.stringify({ action: 'stage', stage: 'client' }) })).prospect;
    onCreated(p);
  } catch (x) { setErr((x as Error).message); } }}>
    <button type="button" className="crm-back" onClick={onClose}><ArrowLeft size={16} />Retour</button>
    <p className="crm-eye">{asClient ? 'NOUVEAU CLIENT' : 'NOUVEAU PROSPECT'}</p>
    <div className="crm-fields">{([['company', 'Entreprise'], ['contactName', 'Contact (prénom nom)'], ['email', 'E-mail'], ['phone', 'Téléphone'], ['website', 'Site internet'], ['address', 'Adresse'], ['city', 'Ville'], ['trade', 'Métier'], ['siret', 'SIRET']] as [keyof typeof f, string][]).map(([k, l]) =>
      <label key={k}>{l}<input value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></label>)}</div>
    {err && <p className="crm-error" role="alert">{err}</p>}
    <button className="crm-btn" type="submit">Créer la fiche</button>
  </form>;
}

function Fiche({ p, busy, error, act, onBack, onDeleted, onUpdated }: { p: Prospect; busy: boolean; error: string; act: (id: string, b: Record<string, unknown>) => Promise<void>; onBack: () => void; onDeleted: () => void; onUpdated: (p: Prospect) => void }) {
  const [edit, setEdit] = useState(false);
  const [f, setF] = useState({ company: p.company, contactName: p.contactName, email: p.email, phone: p.phone, website: p.website, address: p.address || '', city: p.city, trade: p.trade, siret: p.siret || '', priority: p.priority, google: p.google || '', distance: p.distance || '', bulletinId: p.bulletinId, score: p.score === null ? '' : String(p.score) });
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
  const STEPS = STAGES.filter((s) => s.id !== 'perdu' && s.id !== 'cote');
  const stepIdx = STEPS.findIndex((s) => s.id === p.stage);

  async function upload(file: File) {
    setUpErr('');
    const fd = new FormData(); fd.append('file', file);
    try { onUpdated((await api<{ prospect: Prospect }>(`/api/crm/prospects/${p.id}/doc`, { method: 'POST', body: fd })).prospect); }
    catch (e) { setUpErr((e as Error).message); }
  }

  return <div className="crm-fiche">
    <button type="button" className="crm-back" onClick={onBack}><ArrowLeft size={16} />Fermer la fiche</button>
    <p className="crm-eye">{isClient(p) ? 'FICHE CLIENT' : `FICHE PROSPECT · ${SOURCE_LABEL[p.source].toUpperCase()}`}</p>
    <h2>{p.company || hostOf(p.website) || p.email || 'Sans nom'}</h2>
    {!edit ? <>
      <div className="crm-box"><h3>COORDONNÉES <button type="button" className="crm-link" onClick={() => setEdit(true)}>Modifier</button></h3>
        <dl className="crm-dl">
          <Row label="Entreprise">{p.company}</Row>
          <Row label="Contact">{p.contactName}</Row>
          <Row label="E-mail">{p.email && <a href={`mailto:${p.email}`}>{p.email}</a>}</Row>
          <Row label="Téléphone">{p.phone && <a href={`tel:${p.phone.replace(/\s/g, '')}`}>{p.phone}</a>}</Row>
          <Row label="Site internet">{p.website && <a href={/^https?:/.test(p.website) ? p.website : `https://${p.website}`} target="_blank" rel="noopener noreferrer">{hostOf(p.website) || p.website} <ExternalLink size={12} /></a>}</Row>
          <Row label="Adresse">{p.address}</Row>
          <Row label="Ville">{[p.city, p.distance && `à ${p.distance}`].filter(Boolean).join(' · ')}</Row>
          <Row label="Métier">{p.trade}</Row>
          <Row label="SIRET">{p.siret}</Row>
        </dl>
      </div>
      {!isClient(p) && <div className="crm-box"><h3>SUIVI</h3>
        <dl className="crm-dl">
          <Row label="Étape">{STAGE_LABEL[p.stage]}</Row>
          <Row label="Priorité">{p.priority}</Row>
          <Row label="Origine">{SOURCE_LABEL[p.source]}</Row>
          <Row label="Note de l’audit">{p.score !== null ? <>{fmtScore(p.score)}/20{p.bulletinId && <> · <a href={`/bulletin/${p.bulletinId}`} target="_blank" rel="noopener noreferrer">voir le bulletin</a></>}</> : ''}</Row>
          <Row label="Avis Google">{p.google}</Row>
          <Row label="Créé le">{frDate(p.createdAt)}</Row>
        </dl>
      </div>}
    </> : <form className="crm-fields" onSubmit={async (e) => { e.preventDefault(); await act(p.id, { action: 'update', fields: f }); setEdit(false); }}>
      {([['company', 'Entreprise'], ['contactName', 'Contact'], ['email', 'E-mail'], ['phone', 'Téléphone'], ['website', 'Site internet'], ['address', 'Adresse'], ['city', 'Ville'], ['trade', 'Métier'], ['siret', 'SIRET'], ['priority', 'Priorité'], ['google', 'Avis Google'], ['distance', 'Distance'], ['bulletinId', 'Identifiant du bulletin'], ['score', 'Note /20']] as [keyof typeof f, string][]).map(([k, l]) =>
        <label key={k}>{l}<input value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></label>)}
      <div className="crm-act"><button className="crm-btn" type="submit" disabled={busy}>Enregistrer</button><button className="crm-btn crm-btn-line" type="button" onClick={() => setEdit(false)}>Annuler</button></div>
    </form>}

    {isClient(p) ? <ClientPart p={p} busy={busy} act={act} /> : <>
    <div className="crm-steps" aria-label={`Étape : ${STAGE_LABEL[p.stage]}`}>{STEPS.map((s, i) => <i key={s.id} className={p.stage !== 'perdu' && p.stage !== 'cote' && i <= stepIdx ? 'd' : ''} title={s.label} />)}</div>
    <label className="crm-stage-sel">Étape<select value={p.stage} disabled={busy} onChange={(e) => act(p.id, { action: 'stage', stage: e.target.value })}>{STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</select></label>
    <div className="crm-act">{p.stage === 'cote'
      ? <button className="crm-btn crm-btn-line" type="button" disabled={busy} onClick={() => act(p.id, { action: 'stage', stage: 'a_contacter' })}><Undo2 size={15} />Remettre en prospection</button>
      : <button className="crm-btn crm-btn-line" type="button" disabled={busy} onClick={() => act(p.id, { action: 'stage', stage: 'cote' })}><Archive size={15} />Mettre de côté (basse priorité)</button>}</div>
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
      {['rdv', 'devis'].includes(p.stage) && <button className="crm-btn" type="button" disabled={busy} onClick={() => act(p.id, { action: 'stage', stage: 'client' })}>Il a signé : passer en client</button>}
    </div>
    </>}
    {error && isClient(p) && <p className="crm-error" role="alert">{error}</p>}
    {showQm && !isClient(p) && <div className="crm-box"><h3>QUESTIONNAIRE À ENVOYER</h3><p className="crm-mail-head">Objet : {qm.subject}</p><pre className="crm-mail">{qm.body}</pre><div className="crm-act"><CopyButton text={`${qm.subject}\n\n${qm.body}`} label="Copier le mail" />{p.email && <a className="crm-btn crm-btn-line" href={`mailto:${p.email}?subject=${encodeURIComponent(qm.subject)}&body=${encodeURIComponent(qm.body)}`}>Ouvrir dans ma messagerie</a>}</div></div>}

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


/* ===================== Espace Clients ===================== */
const fdate = (v: string) => (v ? new Date(`${v}T12:00:00Z`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/Paris' }) : '');

function ClientTable({ items, sel, onSel, onDone }: { items: Prospect[]; sel: string | null; onSel: (id: string) => void; onDone: (id: string, what: string) => void }) {
  if (!items.length) return <p className="crm-empty">Aucun client pour l’instant. Ajoutez vos clients avec « Nouveau client », ou passez un prospect en « Client » quand il signe.</p>;
  return <div className="crm-rows crm-clients">
    <div className="crm-row crm-row-head" aria-hidden="true"><span>Client</span><span>Mise en ligne</span><span>Maintenance</span><span>Hébergement</span><span>Prochain rappel</span></div>
    {items.map((p) => { const c = p.client; const a = clientActions(p)[0]; const due = a && new Date(a.due).getTime() <= Date.now(); return <div role="button" tabIndex={0} key={p.id} className={`crm-row${p.id === sel ? ' sel' : ''}`} onClick={() => onSel(p.id)} onKeyDown={(e) => { if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onSel(p.id); } }}>
      <span className="crm-co"><b>{p.company || hostOf(p.website) || 'Sans nom'}</b><small>{[hostOf(p.website), c?.project].filter(Boolean).join(' · ') || 'à compléter'}</small></span>
      <span className="crm-next">{c?.launchDate ? fdate(c.launchDate) : '—'}</span>
      <span>{c?.maintenance ? <i className="crm-src crm-src-audit">Oui · {c.maintenanceAmount || 'mensuelle'}</i> : <i className="crm-src">Non</i>}</span>
      <span className="crm-next">{c?.hostedBy === 'moi' ? `Par moi${c.host ? ` · ${c.host}` : ''}` : c?.hostedBy === 'client' ? `Par le client${c.host ? ` · ${c.host}` : ''}` : '—'}</span>
      <span className={`crm-remind-cell ${due ? 'crm-due' : 'crm-next'}`}>{a ? `${a.label.split(' : ')[0].split(' (')[0]} · ${frDate(a.due)}` : '—'}
        {a && due && <button type="button" className="crm-done-btn" title={a.done} onClick={(e) => { e.stopPropagation(); onDone(p.id, a.what); }}><Check size={14} />Fait</button>}</span>
    </div>; })}
  </div>;
}

function ClientPart({ p, busy, act }: { p: Prospect; busy: boolean; act: (id: string, b: Record<string, unknown>) => Promise<void> }) {
  const c: ClientInfo = { ...emptyClient(), ...(p.client || {}) };
  const [edit, setEdit] = useState(!p.client?.project && !p.client?.launchDate);
  const [f, setF] = useState(c);
  const actions = clientActions(p);
  const rm = reviewMail(p);
  const end = c.maintenance && c.maintenanceStart ? (() => { const d = new Date(`${c.maintenanceStart}T12:00:00Z`); d.setUTCMonth(d.getUTCMonth() + 12); return d.toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' }); })() : '';
  return <>
    {actions.length > 0 && <div className="crm-box"><h3>RAPPELS</h3>
      {actions.map((a) => { const due = new Date(a.due).getTime() <= Date.now(); return <div key={a.what} className={`crm-remind${due ? ' due' : ''}`}>
        <p><b>{a.label}</b><br /><span>{due ? 'à faire maintenant' : `le ${frDate(a.due)}`}</span></p>
        {a.what === 'avis' && <CopyButton text={`${rm.subject}\n\n${rm.body}`} label="Copier le mail de demande" />}
        <button className={`crm-btn${due ? '' : ' crm-btn-line'}`} type="button" disabled={busy} onClick={() => act(p.id, { action: 'clientDone', what: a.what })}>{a.done}</button>
      </div>; })}
    </div>}
    {!edit ? <div className="crm-box"><h3>SITE ET CONTRAT <button type="button" className="crm-link" onClick={() => { setF(c); setEdit(true); }}>Modifier</button></h3>
      <dl className="crm-dl">
        <Row label="Projet">{c.project}</Row>
        <Row label="Prix du site">{c.price}</Row>
        <Row label="Mise en ligne">{fdate(c.launchDate)}</Row>
        <Row label="Maintenance">{c.maintenance ? <b className="crm-yes">Oui · {c.maintenanceAmount || 'mensuelle'}</b> : (p.client ? <b className="crm-no">Non</b> : '')}</Row>
        {c.maintenance && <Row label="Depuis le">{fdate(c.maintenanceStart)}</Row>}
        {c.maintenance && <Row label="Facture chaque mois le">{c.invoiceDay ? `${c.invoiceDay}${c.invoiceDay === 1 ? 'er' : ''} du mois` : ''}</Row>}
        {c.maintenance && <Row label="Fin d’engagement">{end}</Row>}
        <Row label="Hébergé par">{c.hostedBy === 'moi' ? 'Moi (SEOKRAFT)' : c.hostedBy === 'client' ? 'Le client' : ''}</Row>
        <Row label="Hébergeur">{c.host}</Row>
        <Row label="Domaine à renouveler">{fdate(c.domainRenewal)}</Row>
      </dl>
    </div> : <form className="crm-box crm-fields" onSubmit={async (e) => { e.preventDefault(); await act(p.id, { action: 'client', fields: f }); setEdit(false); }}>
      <h3 style={{ gridColumn: '1/-1' }}>SITE ET CONTRAT</h3>
      <label>Projet<select value={f.project} onChange={(e) => setF({ ...f, project: e.target.value })}><option value="">—</option><option>Création</option><option>Refonte</option><option>Autre</option></select></label>
      <label>Prix du site<input placeholder="1 990 € TTC" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} /></label>
      <label>Mise en ligne<input type="date" value={f.launchDate} onChange={(e) => setF({ ...f, launchDate: e.target.value })} /></label>
      <label>Maintenance<select value={f.maintenance ? 'oui' : 'non'} onChange={(e) => setF({ ...f, maintenance: e.target.value === 'oui' })}><option value="non">Non</option><option value="oui">Oui</option></select></label>
      {f.maintenance && <>
        <label>Montant<input value={f.maintenanceAmount} onChange={(e) => setF({ ...f, maintenanceAmount: e.target.value })} /></label>
        <label>Début de la maintenance<input type="date" value={f.maintenanceStart} onChange={(e) => setF({ ...f, maintenanceStart: e.target.value })} /></label>
        <label>Refaire la facture le (jour du mois)<input type="number" min={1} max={28} placeholder="1" value={f.invoiceDay || ''} onChange={(e) => setF({ ...f, invoiceDay: Number(e.target.value) })} /></label>
      </>}
      <label>Hébergé par<select value={f.hostedBy} onChange={(e) => setF({ ...f, hostedBy: e.target.value as ClientInfo['hostedBy'] })}><option value="">—</option><option value="moi">Moi (SEOKRAFT)</option><option value="client">Le client</option></select></label>
      <label>Hébergeur<input placeholder="Vercel, Hostinger, OVH…" value={f.host} onChange={(e) => setF({ ...f, host: e.target.value })} /></label>
      <label>Domaine à renouveler le<input type="date" value={f.domainRenewal} onChange={(e) => setF({ ...f, domainRenewal: e.target.value })} /></label>
      <div className="crm-act"><button className="crm-btn" type="submit" disabled={busy}>Enregistrer</button>{p.client?.project && <button className="crm-btn crm-btn-line" type="button" onClick={() => setEdit(false)}>Annuler</button>}</div>
    </form>}
  </>;
}
