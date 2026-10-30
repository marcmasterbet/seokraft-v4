import Brand from '../../components/Brand';
import SiteFooter from '../../components/SiteFooter';
import CalBooking from '../../components/CalBooking';
import Link from 'next/link';
export const metadata={title:'Réserver un appel gratuit de 20 minutes | SEOKRAFT',description:'Réservez un appel gratuit et sans engagement de 20 minutes avec Marc Bretzner (SEOKRAFT) pour parler de votre projet de site internet ou de référencement.',alternates:{canonical:'/rendez-vous'}};
export default function Page(){return <><header className="booking-header"><Brand/><Link href="/">Retour au site ↗</Link></header><main className="booking-page"><div className="booking-intro"><span className="eyebrow"><span className="eyebrow-dot"/> UN PREMIER ÉCHANGE, SANS ENGAGEMENT</span><h1>Parlons de votre<br/><em>prochain projet.</em></h1><p>Création de site internet, refonte ou visibilité sur Google : réservez un appel téléphonique gratuit de 20 minutes pour faire le point sur votre projet.</p><div className="booking-details"><span>20 MINUTES</span><span>GRATUIT</span><span>PAR TÉLÉPHONE</span></div></div><CalBooking/></main><SiteFooter/></>}
