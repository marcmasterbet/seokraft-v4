'use client';
import {useEffect,useState} from 'react';
const ID='G-T84TCFNZWS', KEY='seokraft_analytics_consent_v1';
declare global {interface Window {dataLayer?:unknown[];gtag?:(...args:unknown[])=>void}}
function start(){if(document.getElementById('seokraft-ga4'))return;
window.dataLayer=window.dataLayer||[];window.gtag=(...args:unknown[])=>{window.dataLayer?.push(args)};
window.gtag('js',new Date());window.gtag('config',ID,{anonymize_ip:true});
const s=document.createElement('script');s.id='seokraft-ga4';s.async=true;s.src=`https://www.googletagmanager.com/gtag/js?id=${ID}`;document.head.appendChild(s)}
export function trackSeokraftConversion(event:'contact_submit'|'audit_request'){try{if(localStorage.getItem(KEY)==='accepted')window.gtag?.('event',event)}catch{}}
export default function AnalyticsConsent(){const [choice,setChoice]=useState<string|null>('loading');
useEffect(()=>{try{const v=localStorage.getItem(KEY);setChoice(v==='accepted'||v==='refused'?v:null);if(v==='accepted')start()}catch{setChoice(null)}
const reopen=()=>setChoice(null);window.addEventListener('seokraft-open-cookie-settings',reopen);return()=>window.removeEventListener('seokraft-open-cookie-settings',reopen)},[]);
function save(v:'accepted'|'refused'){try{localStorage.setItem(KEY,v)}catch{}setChoice(v);if(v==='accepted')start();else if(document.getElementById('seokraft-ga4'))window.location.reload()}
if(choice!==null)return null;
return <div className="sk-cookie-overlay" role="dialog" aria-modal="true" aria-label="Consentement aux cookies"><div className="sk-cookie-panel">
<span className="sk-cookie-kicker">VOTRE CONFIDENTIALITÉ</span><h2>Votre choix, vos données.</h2>
<p>SEOKRAFT souhaite utiliser Google Analytics pour mesurer la fréquentation du site. Les statistiques ne sont activées que si vous les acceptez. Vous pouvez refuser sans conséquence sur votre navigation.</p>
<div className="sk-cookie-actions"><button type="button" className="sk-cookie-decline" onClick={()=>save('refused')}>Tout refuser</button><button type="button" className="sk-cookie-accept" onClick={()=>save('accepted')}>Tout accepter</button></div>
<a href="/politique-de-confidentialite">En savoir plus sur les cookies</a></div></div>}
