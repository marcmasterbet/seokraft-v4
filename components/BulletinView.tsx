import Image from 'next/image';
import { ArrowUpRight, Check, Smartphone, Monitor, Search, PenLine, MessageCircle } from 'lucide-react';
import PrintButton from './PrintButton';
import Score20 from './Score20';
import { NOTE_LABELS, LEVEL_LABEL, fmt20, type Bulletin } from './auditTypes';

/* Bulletin d'audit SEOKRAFT : page en ligne (téléphone d'abord) et PDF via l'impression. */
const ICONS = { technique: Monitor, google: Search, textes: PenLine, contact: MessageCircle };


function gaugeClass(v: number | null) { return v === null ? '' : v >= 90 ? 'g-ok' : v >= 50 ? 'g-warn' : 'g-bad'; }

export default function BulletinView({ b, sample = false }: { b: Bulletin; sample?: boolean }) {
  const date = new Date(b.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const s = b.speed;
  return <main className="bv">
    <header className="bv-top"><a href="/" className="al-logo" title="SEOKRAFT, studio web à Strasbourg"><span className="al-wm">SEOKRAFT<span>.</span></span><span className="al-ls">STUDIO WEB INDÉPENDANT</span></a>{sample && <span className="bv-sample">Exemple fictif</span>}</header>

    <section className="bv-hero">
      <span className="eyebrow">BULLETIN DE VOTRE SITE</span>
      <p className="bv-host">{b.host}</p>
      <h1>Votre site, <em>vu par vos clients.</em></h1>
      <p className="bv-date">Audit du {date}{b.pages && b.pages.length > 1 ? ` · ${b.pages.length} pages analysées` : ''}</p>
      {(b.desktopScreenshot || s?.screenshot || sample) && <figure className="bv-shots">
        <div className="bv-browser"><div className="bv-browser-bar"><i /><i /><i /><span>{b.host}</span></div>
          {b.desktopScreenshot ? <img src={b.desktopScreenshot} alt={`Le site ${b.host} sur ordinateur`} /> : <div className="bv-skel" aria-hidden="true"><b /><s /><s /><s className="short" /><span><u /><u /><u /></span></div>}</div>
        <div className="bv-mobile">{s?.screenshot ? <img src={s.screenshot} alt={`Le site ${b.host} sur téléphone`} /> : <div className="bv-skel bv-skel-m" aria-hidden="true"><b /><s /><s className="short" /><u /></div>}</div>
        <figcaption>Votre site tel que le voient vos clients, sur ordinateur et sur téléphone{sample ? ' (exemple fictif)' : ''}</figcaption>
      </figure>}
      <div className="bv-global"><Score20 value={fmt20(b.global)} /><div><span className="eyebrow">NOTE DU SITE</span><p className="bv-verdict">{b.verdict}</p><p className="bv-muted">Moyenne des 4 notes ci-dessous</p></div></div>
      <div className="bv-actions no-print"><a className="button button-olive" href="/rendez-vous">Réserver un appel de 20 minutes <ArrowUpRight size={17} /></a><PrintButton name={`Bulletin-SEOKRAFT-${b.host}`} /></div>
    </section>

    <section className="bv-sec">
      <h2>Vos 4 notes</h2>
      <div className="bv-notes">{NOTE_LABELS.map(({ id, label, hint }) => { const Icon = ICONS[id]; const v = b.notes[id]; return <div className="bv-note" key={id}>
        <p className="bv-note-head"><Icon size={18} aria-hidden="true" />{label}</p>
        <p className="bv-note-val"><b>{fmt20(v)}</b>/20</p>
        <div className="bv-bar" aria-hidden="true"><i style={{ width: `${(v / 20) * 100}%` }} /></div>
        <p className="bv-muted">{hint}</p>
      </div>; })}</div>
    </section>

    <section className="bv-sec">
      <h2>L’essentiel</h2>
      <p className="bv-lead">{b.essentiel}</p>
    </section>

    {b.priorities.length > 0 && <section className="bv-sec">
      <h2>Par où commencer</h2>
      <div className="bv-prio">{b.priorities.map((p, i) => <article className={`bv-card bv-${p.level}`} key={i}>
        <span className="bv-tag">{LEVEL_LABEL[p.level]}</span>
        <h3>{p.title}</h3>
        <p>{p.text}</p>
      </article>)}</div>
    </section>}

    {b.constats.length > 0 && <section className="bv-sec">
      <h2>Ce que se demande un client</h2>
      <ol className="bv-questions">{b.constats.map((c, i) => <li key={i}><span className="bv-num">{i + 1}</span><div><p className="bv-q">{c.question}</p><p className="bv-a">{c.reponse}</p></div></li>)}</ol>
    </section>}

    {s && s.performance !== null && <section className="bv-sec">
      <h2>Votre site sur téléphone, mesuré par Google</h2>
      <div className="bv-gauges">{([['Vitesse', s.performance], ['Accessibilité', s.accessibility], ['Bonnes pratiques', s.bestPractices], ['Référencement', s.seo]] as [string, number | null][]).map(([l, v]) => <div key={l} className={gaugeClass(v)}><b>{v ?? '–'}</b><span>{l}</span></div>)}</div>
      <table className="bv-table"><tbody>
        <tr><th>Premier affichage<small>le moment où quelque chose apparaît</small></th><td>{s.fcp}</td></tr>
        <tr><th>Contenu principal visible<small>bon jusqu’à 2,5 s, lent au-delà de 4 s</small></th><td>{s.lcp}</td></tr>
        <tr><th>Stabilité de la page<small>0 = rien ne bouge pendant le chargement</small></th><td>{s.cls}</td></tr>
      </tbody></table>
      <p className="bv-muted"><Smartphone size={14} aria-hidden="true" /> Mesure Google PageSpeed Insights sur votre page d’accueil. <a href={`https://pagespeed.web.dev/analysis?url=${encodeURIComponent(b.url)}`} target="_blank" rel="noopener noreferrer">Refaire le test sur le site de Google</a>.</p>
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

    <details className="bv-method">
      <summary>Méthode et limites</summary>
      <p><strong>Périmètre :</strong> {b.pages && b.pages.length > 1 ? <>{b.pages.length} pages publiques de {b.host} : {b.pages.map((p) => p.label.toLowerCase()).join(', ')}</> : <>la page d’accueil publique de {b.host}</>}, telles qu’un visiteur les voit. Rien n’a été modifié sur votre site.</p>
      <p><strong>Méthode :</strong> vérifications automatiques (Google, téléphone, sécurité, contact), mesure Google PageSpeed{b.ai ? ', et lecture des textes assistée par intelligence artificielle, relue par Marc avant envoi' : ''}.</p>
      <p><strong>Limites :</strong> aucun formulaire n’a été envoyé et aucun accès privé n’a été utilisé. Les notes sont indicatives et ne garantissent aucun classement sur Google.</p>
    </details>
    <footer className="al-foot"><a href="/">seokraft.fr</a><a href="/mentions-legales">Mentions légales</a><a href="/politique-de-confidentialite">Confidentialité</a></footer>
  </main>;
}
