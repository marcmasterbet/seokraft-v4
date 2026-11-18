import { ArrowRight, Check, X, AlertTriangle } from 'lucide-react';
import PrintButton from './PrintButton';
import { fmt20, type Bulletin } from './auditTypes';
import type { FactPoint } from './factAudit';

/* Audit « par les faits » : une page courte, lisible en une minute, qui mène au rendez-vous.
   Ordre en entonnoir : le besoin du client → le verdict → les 3 causes → ce qui va bien → l'action. */
const STATUS = { ok: { I: Check, t: 'Correct' }, warn: { I: AlertTriangle, t: 'À améliorer' }, bad: { I: X, t: 'À corriger' } } as const;

export default function FactView({ b, sample = false }: { b: Bulletin; sample?: boolean }) {
  const r = b.facts!;
  const date = new Date(b.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const top = r.problems.map((id) => r.points.find((p) => p.id === id)).filter((p): p is FactPoint => !!p);
  const nOk = r.points.filter((p) => p.status === 'ok').length;
  const tone = b.global >= 14 ? 'is-ok' : b.global >= 10 ? 'is-warn' : 'is-bad';
  const order = [...r.points].sort((a, b2) => (a.status === b2.status ? b2.rank - a.rank : a.status === 'bad' ? -1 : b2.status === 'bad' ? 1 : a.status === 'warn' ? -1 : 1));
  return <main className="fv">
    <header className="fv-top"><a href="/" className="al-logo" title="SEOKRAFT, création de sites internet à Strasbourg"><span className="al-wm">SEOKRAFT<span>.</span></span></a><span>{sample ? 'Exemple fictif' : `Audit gratuit · ${date}`}</span></header>

    <h1>Vos clients vous cherchent sur Google. <em>Encore faut-il qu’ils vous trouvent.</em></h1>
    <p className="fv-lead">J’ai passé votre site <strong>{b.host}</strong> au crible : {r.points.length} points qui décident si un visiteur vous trouve, vous fait confiance… et décroche son téléphone.</p>

    <div className={`fv-score ${tone}`}><p className="fv-note"><b>{fmt20(b.global)}</b><small>/20</small></p><div><p className="fv-verdict">{r.verdictTitle}</p><p className="fv-sub">{r.verdictSub}</p></div></div>

    {top.length > 0 && <section className="fv-problems">
      <h2>{top.length > 1 ? `Les ${top.length} points qui vous coûtent des clients` : 'Le point qui vous coûte des clients'}</h2>
      {top.map((p, i) => <article key={p.id} className={`fv-pb fv-${p.status}`}>
        <span className="fv-n" aria-hidden="true">{i + 1}</span>
        <div><h3>{p.title}</h3><p>{p.text}</p><p className="fv-proof">{p.proof}</p></div>
      </article>)}
    </section>}

    {r.strengths.length > 0 && <section className="fv-good">
      <h2>Votre site a déjà de vraies forces</h2>
      <ul>{r.strengths.map((s) => <li key={s}><Check size={17} aria-hidden="true" />{s}</li>)}</ul>
      {r.baseLine && <p>{r.baseLine}</p>}
    </section>}

    <details className="fv-detail">
      <summary><span>{r.points.length} points vérifiés · {nOk} correct{nOk > 1 ? 's' : ''} · {r.points.length - nOk} à revoir</span><b>Voir le détail</b></summary>
      <ul>{order.map((p) => { const S = STATUS[p.status]; return <li key={p.id} className={`fv-${p.status}`}>
        <span className="fv-ico" title={S.t}><S.I size={14} aria-hidden="true" /><span className="sr-only">{S.t} : </span></span>
        <div><p className="fv-dl">{p.label}</p><p className="fv-dd">{p.status === 'ok' ? (p.strength ?? 'Correct.') : `${p.title}. ${p.proof}`}</p></div>
      </li>; })}</ul>
    </details>

    <section className="fv-cta">
      <h2>{top.length ? 'En 20 minutes, je vous montre comment récupérer ces clients.' : 'En 20 minutes, je vous montre comment aller chercher plus de clients.'}</h2>
      <p>{top.length ? 'Au téléphone. Je vous explique quoi corriger, dans quel ordre et en combien de temps. Vous repartez avec un plan clair, que vous travailliez avec moi ou non.'
        : 'Au téléphone. Votre site est solide : la suite, c’est de gagner des places sur Google. Je vous montre par où commencer, que vous travailliez avec moi ou non.'}</p>
      <a className="fv-btn" href="/rendez-vous">Oui, je réserve mes 20 minutes offertes <ArrowRight size={18} aria-hidden="true" /></a>
      <p className="fv-reass">Gratuit · Sans engagement · Ou répondez simplement à mon e-mail</p>
    </section>

    <footer className="fv-sig">
      <p><strong>Marc Bretzner</strong>, développeur web indépendant près de Strasbourg. Je crée et j’améliore des sites qui apportent des clients. · SEOKRAFT</p>
      <div className="no-print"><PrintButton name={`Audit-SEOKRAFT-${b.host}`} /></div>
      <p className="fv-note-small">Audit réalisé automatiquement à partir de vérifications sur votre site et de la mesure officielle de vitesse de Google (PageSpeed), le {date}. Il porte sur votre site internet, pas sur votre fiche Google ni sur votre réputation.</p>
    </footer>
  </main>;
}
