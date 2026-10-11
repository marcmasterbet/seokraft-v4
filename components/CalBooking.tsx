'use client';
import {useState} from 'react';
const BOOKING_URL='https://cal.com/marc-bretzner-n3gogo/appel-seokraft';
export default function CalBooking(){
 const [allowed,setAllowed]=useState(false);
 return <div className="cal-booking-shell">
  {allowed ? <iframe title="Calendrier de réservation d’appel SEOKRAFT" src={BOOKING_URL+'?embed=true'} loading="lazy" allow="fullscreen" referrerPolicy="strict-origin-when-cross-origin" className="cal-booking-frame"/> : <div className="cal-booking-permission"><span className="eyebrow">VOTRE RENDEZ-VOUS</span><h2>Choisissez le moment<br/><em>qui vous convient.</em></h2><p>Pour afficher les créneaux disponibles, le calendrier Cal.com doit être chargé. Ce service externe peut traiter des données techniques et utiliser des traceurs selon sa propre politique de confidentialité.</p><button className="button button-olive" onClick={()=>setAllowed(true)}>Afficher les disponibilités <span aria-hidden="true">↗</span></button><p className="cal-booking-small">Vous pouvez également <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer">ouvrir la réservation sur Cal.com</a>.</p></div>}
 </div>
}
