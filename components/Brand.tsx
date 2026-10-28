import Link from 'next/link';

/** Identité unique, partagée entre l'accueil et le diagnostic. */
export default function Brand({home = false}: {home?: boolean}) {
  return (
    <Link href={home ? '#accueil' : '/'} className="brand" aria-label="SEOKRAFT, retour à l’accueil">
      <span className="brand-name">SEOKRAFT<span className="brand-mark">.</span></span>
      <span className="brand-sub">STUDIO WEB INDÉPENDANT</span>
    </Link>
  );
}
