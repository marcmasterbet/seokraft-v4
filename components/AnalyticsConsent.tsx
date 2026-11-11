'use client';
import {useEffect,useState} from 'react';

/* Consentement par finalité (recommandation CNIL) :
   - stats : mesure d'audience Google Analytics 4 ;
   - pub   : mesure des campagnes Meta (Facebook, Instagram) et LinkedIn.
   Les outils publicitaires ne sont proposés que si leurs identifiants sont configurés dans Vercel :
   NEXT_PUBLIC_META_PIXEL_ID, NEXT_PUBLIC_LINKEDIN_PARTNER_ID, NEXT_PUBLIC_LINKEDIN_CONVERSION_AUDIT.
   Le choix est conservé 6 mois, puis redemandé. */
const GA_ID='G-T84TCFNZWS', KEY='seokraft_consent_v2';
const META_ID=process.env.NEXT_PUBLIC_META_PIXEL_ID||'';
const LI_ID=process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID||'';
const LI_CONV_AUDIT=process.env.NEXT_PUBLIC_LINKEDIN_CONVERSION_AUDIT||'';
const HAS_ADS=Boolean(META_ID||LI_ID);
const MAX_AGE=1000*60*60*24*182;

type Consent={stats:boolean;pub:boolean};
declare global {interface Window {
 dataLayer?:unknown[];gtag?:(...args:unknown[])=>void;
 fbq?:((...args:unknown[])=>void)&{queue?:unknown[];loaded?:boolean;version?:string;push?:unknown;callMethod?:(...a:unknown[])=>void};_fbq?:unknown;
 lintrk?:((...args:unknown[])=>void)&{q?:unknown[]};_linkedin_partner_id?:string;_linkedin_data_partner_ids?:string[];
}}

function readConsent():Consent|null{try{const raw=localStorage.getItem(KEY);if(!raw)return null;
 const d=JSON.parse(raw) as {stats?:unknown;pub?:unknown;t?:unknown};
 if(typeof d.stats==='boolean'&&typeof d.pub==='boolean'&&typeof d.t==='number'&&Date.now()-d.t<MAX_AGE)return {stats:d.stats,pub:d.pub};
 localStorage.removeItem(KEY);return null}catch{try{localStorage.removeItem(KEY)}catch{}return null}}

function addScript(id:string,src:string){if(document.getElementById(id))return;const s=document.createElement('script');s.id=id;s.async=true;s.src=src;document.head.appendChild(s)}

function startStats(){if(document.getElementById('seokraft-ga4'))return;
 window.dataLayer=window.dataLayer||[];window.gtag=(...args:unknown[])=>{window.dataLayer?.push(args)};
 window.gtag('js',new Date());window.gtag('config',GA_ID,{anonymize_ip:true});
 addScript('seokraft-ga4',`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`)}

function startAds(){
 if(META_ID&&!window.fbq){
  const f=function(...args:unknown[]){const self=f as unknown as {callMethod?:(...a:unknown[])=>void;queue:unknown[]};if(self.callMethod)self.callMethod(...args);else self.queue.push(args)} as unknown as NonNullable<Window['fbq']>;
  f.queue=[];f.loaded=true;f.version='2.0';f.push=f;window.fbq=f;window._fbq=f;
  addScript('seokraft-meta','https://connect.facebook.net/en_US/fbevents.js');
  window.fbq('init',META_ID);window.fbq('track','PageView');
 }
 if(LI_ID&&!window.lintrk){
  window._linkedin_partner_id=LI_ID;window._linkedin_data_partner_ids=[LI_ID];
  const l=function(...args:unknown[]){(l as unknown as {q:unknown[]}).q.push(args)} as unknown as NonNullable<Window['lintrk']>;l.q=[];window.lintrk=l;
  addScript('seokraft-linkedin','https://snap.licdn.com/li.lms-analytics/insight.min.js');
 }
}

export function trackSeokraftConversion(event:'contact_submit'|'audit_request'){
 const c=readConsent();if(!c)return;
 if(c.stats)window.gtag?.('event',event);
 if(c.pub){
  window.fbq?.('track',event==='audit_request'?'Lead':'Contact');
  if(event==='audit_request'&&LI_CONV_AUDIT)window.lintrk?.('track',{conversion_id:Number(LI_CONV_AUDIT)});
 }
}

export default function AnalyticsConsent(){
 const [open,setOpen]=useState(false);const [custom,setCustom]=useState(false);
 const [stats,setStats]=useState(false);const [pub,setPub]=useState(false);
 useEffect(()=>{const c=readConsent();
  if(c){setStats(c.stats);setPub(c.pub);if(c.stats)startStats();if(c.pub&&HAS_ADS)startAds();}else setOpen(true);
  const reopen=()=>{const cur=readConsent();setStats(Boolean(cur?.stats));setPub(Boolean(cur?.pub));setCustom(false);setOpen(true)};
  window.addEventListener('seokraft-open-cookie-settings',reopen);return()=>window.removeEventListener('seokraft-open-cookie-settings',reopen)},[]);
 function save(c:Consent){const before=readConsent();
  try{localStorage.setItem(KEY,JSON.stringify({...c,t:Date.now()}))}catch{}
  setOpen(false);if(c.stats)startStats();if(c.pub&&HAS_ADS)startAds();
  // Un outil déjà chargé ne peut pas être « déchargé » : on recharge la page si un accord est retiré.
  if(before&&((before.stats&&!c.stats)||(before.pub&&!c.pub)))window.location.reload()}
 if(!open)return null;
 return <div className="sk-cookie-overlay" role="dialog" aria-modal="true" aria-label="Consentement aux cookies"><div className="sk-cookie-panel">
  <span className="sk-cookie-kicker">VOTRE CONFIDENTIALITÉ</span><h2>Votre choix, vos données.</h2>
  <p>{HAS_ADS
   ?'SEOKRAFT souhaite mesurer la fréquentation du site (Google Analytics) et l’efficacité de ses publicités (Meta et LinkedIn). Rien n’est activé sans votre accord, et vous pouvez refuser sans conséquence sur votre navigation.'
   :'SEOKRAFT souhaite utiliser Google Analytics pour mesurer la fréquentation du site. Les statistiques ne sont activées que si vous les acceptez. Vous pouvez refuser sans conséquence sur votre navigation.'}</p>
  {custom&&<div className="sk-cookie-choices">
   <label><input type="checkbox" checked={stats} onChange={e=>setStats(e.target.checked)}/><span><strong>Mesure d’audience</strong><small>Google Analytics : nombre de visites, pages consultées.</small></span></label>
   {HAS_ADS&&<label><input type="checkbox" checked={pub} onChange={e=>setPub(e.target.checked)}/><span><strong>Mesure publicitaire</strong><small>Meta (Facebook, Instagram) et LinkedIn : savoir si une publicité a conduit à une demande.</small></span></label>}
  </div>}
  <div className="sk-cookie-actions">
   <button type="button" className="sk-cookie-decline" onClick={()=>save({stats:false,pub:false})}>Tout refuser</button>
   {custom
    ?<button type="button" className="sk-cookie-accept" onClick={()=>save({stats,pub:HAS_ADS&&pub})}>Enregistrer mes choix</button>
    :<button type="button" className="sk-cookie-accept" onClick={()=>save({stats:true,pub:HAS_ADS})}>Tout accepter</button>}
  </div>
  <div className="sk-cookie-links">{!custom&&<button type="button" className="sk-cookie-custom" onClick={()=>setCustom(true)}>Personnaliser</button>}<a href="/politique-de-confidentialite">En savoir plus sur les cookies</a></div>
 </div></div>}
