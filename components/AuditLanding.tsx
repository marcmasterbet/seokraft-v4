'use client';
import { useEffect, useState, type FormEvent } from 'react';
import Image from 'next/image';
import { ArrowRight, ArrowUpRight, Check, Smartphone, Search, Phone, ShieldCheck, Mail, Plus } from 'lucide-react';
import { trackSeokraftConversion } from './AnalyticsConsent';
import Score20 from './Score20';

/* Landing page « Votre site sur 20 » : un seul objectif, demander son audit gratuit. */
const STEPS = ['Lecture de votre page d’accueil', 'Mesure de la vitesse par Google', 'Analyse de vos textes', 'Préparation de votre bulletin', 'Relecture par Marc avant envoi'];

function hostOf(v: string) { try { return new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`).hostname.replace(/^www\./, ''); } catch { return ''; } }

function AuditForm({ id }: { id: string }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (step !== 3) return;
    const t = setInterval(() => setProgress((p) => Math.min(p + 1, STEPS.length - 1)), 2600);
    return () => clearInterval(t);
  }, [step]);

  function next(e: FormEvent) {
    e.preventDefault(); setError('');
    const h = hostOf(url.trim());
    if (!h || !h.includes('.')) { setError('Tapez l’adresse complète de votre site, par exemple : monentreprise.fr'); return; }
    setStep(2);
  }
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setError('');
    const f = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const r = await fetch('/api/audit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...f, url }) });
      if (!r.ok) { const d = await r.json().catch(() => ({})); throw new Error(d.error === 'Trop de demandes' ? 'Plusieurs demandes ont été envoyées en peu de temps. Merci de réessayer dans quelques minutes.' : 'Merci de vérifier votre prénom et votre adresse e-mail.'); }
      trackSeokraftConversion('audit_request'); setStep(3);
    } catch (err) { setError(err instanceof Error ? err.message : 'Une erreur est survenue. Merci de réessayer.'); }
    finally { setBusy(false); }
  }

  if (step === 3) return <div className="lp-card lp-done" role="status" aria-live="polite">
    <span className="lp-kicker">ADRESSE REÇUE : {hostOf(url).toUpperCase()}</span>
    <h2>Votre audit est en cours.</h2>
    <p>Vous pouvez fermer cette page : votre bulletin vous sera envoyé par e-mail <strong>sous 24 heures</strong>, après relecture.</p>
    <ul className="lp-progress">{STEPS.map((s, i) => <li key={s} className={i < progress ? 'is-done' : i === progress ? 'is-current' : ''}><span aria-hidden="true">{i < progress ? <Check size={14} /> : null}</span>{s}</li>)}</ul>
    <p className="lp-small">Pensez à regarder vos courriers indésirables si rien n’arrive : l’e-mail viendra de <strong>contact@seokraft.fr</strong>.</p>
  </div>;

  return <div className="lp-card" id={id}>
    <div className="lp-card-head"><div><span className="lp-kicker">VOTRE AUDIT GRATUIT</span><p className="lp-step">Étape {step} sur 2 : {step === 1 ? 'votre site' : 'où vous l’envoyer'}</p></div><Score20 value="?" size="small" /></div>
    {step === 1 ? <form onSubmit={next} noValidate>
      <label htmlFor={`${id}-url`}>Tapez l’adresse de votre site internet</label>
      <input id={`${id}-url`} type="text" inputMode="url" autoComplete="url" placeholder="monentreprise.fr" value={url} onChange={(e) => setUrl(e.target.value)} required />
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="lp-btn" type="submit">Obtenir ma note sur 20 <ArrowRight size={18} aria-hidden="true" /></button>
    </form> : <form onSubmit={submit}>
      <p className="lp-site">Site : <strong>{hostOf(url)}</strong> <button type="button" onClick={() => setStep(1)}>modifier</button></p>
      <label htmlFor={`${id}-name`}>Votre prénom</label>
      <input id={`${id}-name`} type="text" name="name" autoComplete="given-name" placeholder="Prénom" required />
      <label htmlFor={`${id}-email`}>Votre adresse e-mail</label>
      <input id={`${id}-email`} type="email" name="email" autoComplete="email" placeholder="vous@entreprise.fr" required />
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="honey" aria-hidden="true" />
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="lp-btn" type="submit" disabled={busy}>{busy ? 'Envoi…' : 'Lancer mon audit gratuit'} <ArrowRight size={18} aria-hidden="true" /></button>
      <p className="lp-small">Pas de téléphone, pas de compte à créer. Votre e-mail sert uniquement à vous envoyer votre bulletin. <a href="/politique-de-confidentialite">Confidentialité</a></p>
    </form>}
  </div>;
}

const FAQ: [string, string][] = [
  ['C’est vraiment gratuit ?', 'Oui. Aucun paiement, aucun engagement. Le bulletin vous appartient : vous pouvez corriger les points vous-même, les confier à quelqu’un d’autre ou me demander de l’aide.'],
  ['Qui fait l’audit ?', 'Des outils analysent votre page d’accueil, dont la mesure officielle de Google, et l’intelligence artificielle aide à lire vos textes. Puis je relis chaque bulletin moi-même avant de vous l’envoyer.'],
  ['Mon site va-t-il être modifié ?', 'Non. L’analyse lit votre site comme le ferait un visiteur. Rien n’est modifié, aucun formulaire n’est envoyé.'],
  ['Que devient mon adresse e-mail ?', 'Elle sert à vous envoyer votre bulletin, puis éventuellement à vous demander s’il vous a été utile. Elle n’est jamais vendue ni cédée, et vous pouvez demander sa suppression à tout moment.'],
  ['Et refaire mon site, ça coûte combien ?', 'Un site vitrine sur mesure commence à 1 990 € TTC, avec une estimation en ligne selon le nombre de pages. Mais rien ne vous oblige à refaire votre site : souvent, quelques corrections suffisent.'],
];

export default function AuditLanding() {
  const [open, setOpen] = useState<number | null>(null);
  return <div className="lp">
    <header className="lp-top"><a href="/" className="al-logo" title="SEOKRAFT, studio web à Strasbourg"><span className="al-wm">SEOKRAFT<span>.</span></span><span className="al-ls">STUDIO WEB INDÉPENDANT</span></a></header>
    <main>
      <section className="lp-hero">
        <div className="lp-hero-copy">
          <span className="eyebrow"><span className="eyebrow-dot" /> AUDIT GRATUIT · STRASBOURG &amp; ALSACE</span>
          <h1>Votre site, <span className="nowrap">noté sur <Score20 value="20" size="small" /></span></h1>
          <p className="lp-sub">Gratuit, clair, <em>relu par un humain.</em></p>
          <p className="lp-lead">Tapez l’adresse de votre site : vous recevez par e-mail sa note sur 20 et les points à corriger en premier, expliqués sans jargon.</p>
        </div>
        <div className="lp-hero-form"><AuditForm id="audit-haut" /></div>
        <ul className="lp-ticks lp-hero-ticks"><li><Check size={18} aria-hidden="true" />Gratuit et sans engagement</li><li><Check size={18} aria-hidden="true" />Expliqué sans mot technique</li><li><Check size={18} aria-hidden="true" />Le bulletin est à vous, quoi que vous décidiez</li></ul>
        <div className="lp-me lp-hero-me"><div className="lp-me-photo"><Image src="/images/marc-portrait-rond.webp" alt="Marc Bretzner, fondateur de SEOKRAFT" fill sizes="80px" style={{ objectFit: 'cover' }} /></div><p><strong>Marc Bretzner, SEOKRAFT</strong>Studio web indépendant à Strasbourg, 15 ans de développement. Je relis chaque bulletin avant de vous l’envoyer.</p></div>
      </section>

      <section className="lp-how">
        <span className="eyebrow">COMMENT ÇA SE PASSE</span>
        <h2>De l’adresse de votre site <em>à votre note.</em></h2>
        <div className="lp-how-grid">
          <article><h3>Vous tapez l’adresse de votre site</h3><p>Puis votre prénom et votre e-mail. C’est tout : pas de téléphone, pas de compte à créer.</p></article>
          <article><h3>Votre site est analysé comme un client le voit</h3><p>Votre page d’accueil est lue sur téléphone, mesurée par Google et passée au crible. Rien n’est modifié.</p>
            <ul className="lp-ticks lp-ticks-icons"><li><Smartphone size={18} aria-hidden="true" />Sur téléphone</li><li><Search size={18} aria-hidden="true" />Sur Google</li><li><Phone size={18} aria-hidden="true" />Pour vous joindre</li><li><ShieldCheck size={18} aria-hidden="true" />Ce qui rassure</li></ul></article>
          <article><h3>Votre bulletin arrive par e-mail</h3><p>Une note sur 20, ce qui va bien, et les points à corriger en premier. Sous 24 heures, après relecture.</p></article>
        </div>
      </section>

      <section className="lp-sample">
        <div className="lp-sample-copy">
          <span className="eyebrow">À QUOI RESSEMBLE LE BULLETIN</span>
          <h2>Clair, concret, <em>lisible sur téléphone.</em></h2>
          <p>Le bulletin se consulte en ligne et se télécharge en PDF. Voici un exemple, réalisé sur un site fictif.</p>
          <a className="lp-link" href="/bulletin/exemple" target="_blank" rel="noopener noreferrer">Voir l’exemple complet <ArrowUpRight size={17} aria-hidden="true" /></a>
        </div>
        <div className="lp-sample-card" aria-label="Extrait d’un bulletin d’exemple">
          <span className="lp-stamp">Exemple fictif</span>
          <span className="lp-kicker">BULLETIN DU SITE</span>
          <p className="lp-sample-host">menuiserie-exemple.fr</p>
          <div className="lp-sample-score"><Score20 value="11" size="small" /><p>Peut mieux faire, surtout sur téléphone</p></div>
          <ol>
            <li><strong>Le site met plus de 7 secondes à s’afficher sur téléphone.</strong><em>Beaucoup de visiteurs partent avant.</em></li>
            <li><strong>Le numéro n’est pas cliquable.</strong><em>Il faut le recopier pour appeler.</em></li>
            <li><strong>Google n’a pas de résumé du site.</strong><em>Il en invente un à votre place.</em></li>
          </ol>
        </div>
      </section>

      <section className="lp-trust">
        <span className="eyebrow">QUI EST DERRIÈRE</span>
        <h2>Un studio web local, <em>des clients qui le disent.</em></h2>
        <blockquote>« Il a pris le temps de m’alerter spontanément d’un problème sur mon site internet, ce qui nous a permis de le corriger rapidement. »<cite>Itclean Propreté</cite></blockquote>
        <blockquote>« Il a su donner vie à notre projet avec beaucoup de professionnalisme, de créativité et un vrai souci du détail. »<cite>Séverine Kayser, REMUS SYSTEMS</cite></blockquote>
      </section>

      <section className="lp-faq">
        <h2>Vos questions</h2>
        {FAQ.map(([q, a], i) => <div className="lp-faq-item" key={q}><button type="button" aria-expanded={open === i} aria-controls={`lp-faq-${i}`} onClick={() => setOpen(open === i ? null : i)}>{q}<Plus size={20} aria-hidden="true" /></button><div id={`lp-faq-${i}`} hidden={open !== i}><p>{a}</p></div></div>)}
      </section>

      <section className="lp-final">
        <h2>Et votre site, <em>il aurait combien&nbsp;?</em></h2>
        <p>Quelques secondes pour le demander, et les points à corriger en premier.</p>
        <AuditForm id="audit-bas" />
        <p className="lp-small"><Mail size={14} aria-hidden="true" /> Une question ? <a href="mailto:contact@seokraft.fr">contact@seokraft.fr</a></p>
      </section>
    </main>
    <footer className="al-foot"><a href="/">seokraft.fr</a><a href="/mentions-legales">Mentions légales</a><a href="/politique-de-confidentialite">Confidentialité</a><button type="button" className="al-cookie" onClick={() => window.dispatchEvent(new Event('seokraft-open-cookie-settings'))}>Cookies</button></footer>
  </div>;
}
