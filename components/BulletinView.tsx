import Image from 'next/image';
import { ArrowUpRight, Check, X, AlertTriangle, Smartphone, Monitor, Search, PenLine, MessageCircle, Gauge, ShieldCheck } from 'lucide-react';
import PrintButton from './PrintButton';
import Score20 from './Score20';
import { NOTE_LABELS, LEVEL_LABEL, fmt20, rateMetric, METRIC_GOAL, type Bulletin, type BulletinCheck, type NoteId, type Speed } from './auditTypes';

/* Bulletin d'audit SEOKRAFT : page en ligne (téléphone d'abord) et PDF via l'impression. */
const ICONS: Record<NoteId | 'technique', typeof Monitor> = { vitesse: Gauge, securite: ShieldCheck, technique: Monitor, google: Search, textes: PenLine, contact: MessageCircle };
const LEGACY = { id: 'technique' as const, label: 'Technique du site', hint: 'Vitesse, téléphone, sécurité, conformité' };

/* Couleur d'une note : rouge si elle fait perdre des clients, orange si moyenne, vert si bonne. */
const tone = (v: number | null | undefined) => (v === null || v === undefined ? '' : v < 10 ? 'is-bad' : v < 14 ? 'is-warn' : 'is-ok');
function gaugeClass(v: number | null) { return v === null ? '' : v >= 90 ? 'g-ok' : v >= 50 ? 'g-warn' : 'g-bad'; }
const STATUS_ICON = { ok: Check, warn: AlertTriangle, bad: X };
const STATUS_TEXT = { ok: 'Correct', warn: 'À améliorer', bad: 'Grave' };

function CheckList({ items }: { items: BulletinCheck[] }) {
  return <ul className="bv-checks">{items.map((c, i) => { const I = STATUS_ICON[c.status]; return <li key={i} className={`bv-ck-${c.status}`}>
    <span className="bv-ck-ico" title={STATUS_TEXT[c.status]}><I size={15} aria-hidden="true" /><span className="sr-only">{STATUS_TEXT[c.status]} : </span></span>
    <div><p className="bv-ck-label">{c.label}</p><p className="bv-ck-detail">{c.detail}</p>{c.advice && <p className="bv-ck-advice">{c.advice}</p>}</div>
  </li>; })}</ul>;
}

function SpeedCard({ m, icon: Icon, title }: { m: Speed; icon: typeof Monitor; title: string }) {
  const p = m.performance;
  return <div className={`bv-speed ${gaugeClass(p)}`}>
    <p className="bv-speed-head"><Icon size={18} aria-hidden="true" />{title}</p>
    <p className="bv-speed-score"><b>{p ?? '–'}</b>/100</p>
    <p className="bv-speed-word">{p === null ? 'Mesure indisponible' : p >= 90 ? 'Rapide' : p >= 50 ? 'Moyen : des visiteurs partent' : 'Lent : beaucoup de visiteurs partent'}</p>
    <table className="bv-table"><tbody>
      {([['fcp', 'Premier affichage', 'quand quelque chose apparaît', m.fcp], ['lcp', 'Contenu principal', 'quand l’essentiel est visible', m.lcp], ['cls', 'Page qui bouge', 'décalages pendant le chargement', m.cls]] as const).map(([k, label, hint, v]) => {
        const r = rateMetric(k, v, m.strategy);
        const goal = k === 'lcp' ? METRIC_GOAL.lcp(m.strategy === 'desktop') : METRIC_GOAL[k];
        return <tr key={k}><th>{label}<small>{hint} · {goal}</small></th><td>{v}{r && <span className={`bv-rate bv-rate-${r.status}`}>{r.word}</span>}</td></tr>;
      })}
    </tbody></table>
  </div>;
}

export default function BulletinView({ b, sample = false }: { b: Bulletin; sample?: boolean }) {
  const date = new Date(b.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const s = b.speed;
  const sd = b.speedDesktop ?? null;
  const labels = b.notes.vitesse === undefined ? [LEGACY, ...NOTE_LABELS.filter((n) => n.id !== 'vitesse' && n.id !== 'securite')] : NOTE_LABELS;
  const checks = b.checks ?? [];
  const group = (g: NoteId) => checks.filter((c) => c.group === g);
  const security = group('securite');
  const speedChecks = group('vitesse');
  const grave = b.priorities.filter((p) => p.level === 'critique').length;
  return <main className="bv">
    <header className="bv-top"><a href="/" className="al-logo" title="SEOKRAFT, studio web à Strasbourg"><span className="al-wm">SEOKRAFT<span>.</span></span><span className="al-ls">STUDIO WEB INDÉPENDANT</span></a>{sample && <span className="bv-sample">Exemple fictif</span>}</header>

    <section className="bv-hero">
      <span className="eyebrow">BULLETIN DE VOTRE SITE</span>
      <p className="bv-host">{b.host}</p>
      <h1>Votre site, <em>vu par vos clients.</em></h1>
      <p className="bv-date">Audit du {date}{b.pages && b.pages.length > 1 ? ` · ${b.pages.length} pages analysées` : ''}{checks.length ? ` · ${checks.length} points vérifiés` : ''}</p>
      {(b.desktopScreenshot || s?.screenshot || sample) && <figure className="bv-shots">
        <div className="bv-browser"><div className="bv-browser-bar"><i /><i /><i /><span>{b.host}</span></div>
          {b.desktopScreenshot ? <img src={b.desktopScreenshot} alt={`Le site ${b.host} sur ordinateur`} /> : <div className="bv-skel" aria-hidden="true"><b /><s /><s /><s className="short" /><span><u /><u /><u /></span></div>}</div>
        <div className="bv-mobile">{s?.screenshot ? <img src={s.screenshot} alt={`Le site ${b.host} sur téléphone`} /> : <div className="bv-skel bv-skel-m" aria-hidden="true"><b /><s /><s className="short" /><u /></div>}</div>
        <figcaption>Votre site tel que le voient vos clients, sur ordinateur et sur téléphone{sample ? ' (exemple fictif)' : ''}</figcaption>
      </figure>}
      <div className={`bv-global ${tone(b.global)}`}><Score20 value={fmt20(b.global)} /><div><span className="eyebrow">NOTE DU SITE</span><p className="bv-verdict">{b.verdict}</p><p className="bv-muted">Note globale de votre site</p></div></div>
      <div className="bv-actions no-print"><a className="button button-olive" href="/rendez-vous">Réserver un appel de 20 minutes <ArrowUpRight size={17} /></a><PrintButton name={`Bulletin-SEOKRAFT-${b.host}`} /></div>
    </section>

    <section className="bv-sec">
      <h2>Vos notes</h2>
      <div className="bv-notes">{labels.map(({ id, label, hint }) => { const Icon = ICONS[id]; const v = (b.notes as Record<string, number | null | undefined>)[id] ?? null; return <div className={`bv-note ${tone(v)}`} key={id}>
        <p className="bv-note-head"><Icon size={18} aria-hidden="true" />{label}</p>
        <p className="bv-note-val"><b>{fmt20(v)}</b>/20</p>
        <div className="bv-bar" aria-hidden="true"><i style={{ width: `${((v ?? 0) / 20) * 100}%` }} /></div>
        <p className="bv-muted">{v === null ? 'Non évaluée pour ce bulletin.' : hint}</p>
      </div>; })}</div>
      <p className="bv-legend" aria-hidden="true"><span className="is-bad">moins de 10 : vous perdez des clients</span><span className="is-warn">10 à 14 : à améliorer</span><span className="is-ok">14 et plus : bien</span></p>
    </section>

    <section className="bv-sec">
      <h2>L’essentiel</h2>
      <p className="bv-lead">{b.essentiel}</p>
      {b.impression && <p className="bv-impression"><strong>Première impression : </strong>{b.impression}</p>}
    </section>

    <section className="bv-sec">
      <h2>{b.priorities.length ? (grave ? 'Ce qui vous fait perdre des clients' : 'Par où commencer') : 'Rien de grave à signaler'}</h2>
      {b.priorities.length ? <div className="bv-prio">{b.priorities.map((p, i) => <article className={`bv-card bv-${p.level}`} key={i}>
        <span className="bv-tag">{p.level === 'critique' ? 'Grave' : LEVEL_LABEL[p.level]}</span>
        <h3>{p.title}</h3>
        <p>{p.text}</p>
      </article>)}</div> : <p className="bv-lead">Votre site fait son travail : il est clair, rapide, sécurisé et facile à contacter. Il reste seulement à le faire vivre (nouvelles réalisations, avis récents).</p>}
    </section>

    {b.constats.length > 0 && <section className="bv-sec">
      <h2>Ce que se demande un client</h2>
      <ol className="bv-questions">{b.constats.map((c, i) => <li key={i}><span className="bv-num">{i + 1}</span><div><p className="bv-q">{c.question}</p><p className="bv-a">{c.reponse}</p></div></li>)}</ol>
    </section>}

    <section className="bv-sec">
      <h2>Vitesse, sur téléphone et sur ordinateur</h2>
      {s && s.performance !== null ? <>
        <div className="bv-speeds"><SpeedCard m={s} icon={Smartphone} title="Sur téléphone" />{sd && sd.performance !== null && <SpeedCard m={sd} icon={Monitor} title="Sur ordinateur" />}</div>
        <p className="bv-muted">Mesures Google PageSpeed sur votre page d’accueil. Au-delà de 3 secondes d’attente, plus de la moitié des visiteurs sur téléphone abandonnent (étude Google, 2016 : 53 % des visites sur mobile abandonnées au-delà de 3 s). <a href={`https://pagespeed.web.dev/analysis?url=${encodeURIComponent(b.url)}`} target="_blank" rel="noopener noreferrer">Refaire le test sur le site de Google</a>.</p>
      </> : !sample && <p className="bv-muted">La mesure Google n’a pas pu être réalisée lors de cet audit. Voici nos propres mesures.</p>}
      {speedChecks.length > 0 && <CheckList items={speedChecks} />}
    </section>

    {security.length > 0 && <section className="bv-sec">
      <h2>Sécurité et conformité</h2>
      <p className="bv-muted bv-intro">Ce que tout visiteur peut constater de l’extérieur. Aucun test intrusif n’a été réalisé.</p>
      <CheckList items={security} />
    </section>}

    {b.pagesDetail && b.pagesDetail.length > 0 && <section className="bv-sec">
      <h2>Page par page</h2>
      <div className="bv-pages">{b.pagesDetail.map((p, i) => <div className="bv-page" key={i}>
        <p className="bv-page-name">{p.label} <span>{p.path}</span></p>
        <p><span className={p.title && p.title.split(/\s+/).length > 2 ? '' : 'is-bad'}>Titre Google : {p.title ? `« ${p.title} »` : 'aucun'}</span></p>
        <p><span className={p.h1 ? '' : 'is-bad'}>Grand titre : {p.h1 ? `« ${p.h1} »` : 'aucun'}</span></p>
        <p><span className={p.description ? '' : 'is-warn'}>Description Google : {p.description ? 'présente' : 'absente'}</span> · <span className={p.words < 250 ? 'is-bad' : p.words < 500 ? 'is-warn' : ''}>{p.words} mots</span></p>
      </div>)}</div>
    </section>}

    {b.positives.length > 0 && <section className="bv-sec">
      <h2>Ce qui va déjà bien</h2>
      <ul className="bv-good">{b.positives.map((p, i) => <li key={i}><Check size={18} aria-hidden="true" />{p}</li>)}</ul>
    </section>}

    <section className="bv-sec bv-cta">
      <div className="bv-who"><div className="bv-photo"><Image src="/images/marc-portrait-rond.webp" alt="Marc Bretzner" fill sizes="96px" loading="eager" style={{ objectFit: 'cover' }} /></div><div><h2>Envie d’en parler&nbsp;?</h2><p>Je vous explique ces résultats et ce que je ferais en premier à votre place. 20 minutes au téléphone, gratuit et sans engagement.</p></div></div>
      <a className="button button-olive" href="/rendez-vous">Réserver mon appel <ArrowUpRight size={17} /></a>
      <p className="bv-sign">Marc Bretzner · SEOKRAFT, studio web à Strasbourg · 06 72 20 91 53 · contact@seokraft.fr</p>
    </section>

    {checks.length > 0 && <section className="bv-sec bv-annex">
      <h2>Le détail, point par point</h2>
      <p className="bv-muted bv-intro">Tous les points vérifiés, classés du plus grave au plus anodin.</p>
      {(['google', 'textes', 'contact'] as NoteId[]).map((g) => group(g).length > 0 && <div key={g} className="bv-annex-group">
        <h3>{NOTE_LABELS.find((n) => n.id === g)?.label}</h3>
        <CheckList items={group(g)} />
      </div>)}
    </section>}

    <details className="bv-method">
      <summary>Méthode et limites</summary>
      <p><strong>Périmètre :</strong> {b.pages && b.pages.length > 1 ? <>{b.pages.length} pages publiques de {b.host} : {b.pages.map((p) => p.label.toLowerCase()).join(', ')}</> : <>la page d’accueil publique de {b.host}</>}, telles qu’un visiteur les voit. Rien n’a été modifié sur votre site.</p>
      <p><strong>Méthode :</strong> {checks.length ? `${checks.length} vérifications automatiques` : 'vérifications automatiques'} (Google, vitesse, sécurité, contact), mesures Google PageSpeed sur téléphone et ordinateur{b.ai ? ', et audit du référencement et des captures assisté par intelligence artificielle, relue par Marc avant envoi' : ''}.</p>
      <p><strong>Limites :</strong> aucun formulaire n’a été envoyé, aucun accès privé n’a été utilisé et aucun test intrusif n’a été mené. Les notes sont indicatives et ne garantissent aucun classement sur Google.</p>
    </details>
    <footer className="al-foot"><a href="/">seokraft.fr</a><a href="/mentions-legales">Mentions légales</a><a href="/politique-de-confidentialite">Confidentialité</a></footer>
  </main>;
}
