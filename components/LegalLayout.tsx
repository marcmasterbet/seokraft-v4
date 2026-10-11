import Link from 'next/link';
import Brand from './Brand';
export default function LegalLayout({title,children}:{title:string;children:React.ReactNode}){
 return <main className="legal-page"><header className="legal-page-header"><Brand/><Link href="/" className="legal-back">Retour à l’accueil</Link></header><article className="legal-content"><h1>{title}</h1>{children}<nav className="legal-links" aria-label="Documents juridiques"><Link href="/mentions-legales">Mentions légales</Link><Link href="/politique-de-confidentialite">Confidentialité</Link><Link href="/cgv">CGV</Link><Link href="/">Accueil</Link></nav></article></main>
}
