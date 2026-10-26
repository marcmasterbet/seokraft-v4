export const LINKEDIN_URL = 'https://www.linkedin.com/in/marc-bretzner-d%C3%A9veloppeur-web';

export function LinkedInGlyph({ size = 18 }: { size?: number }) {
 return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45z"/></svg>;
}

export default function SocialLinks({ className = '' }: { className?: string }) {
 return <div className={`social-links ${className}`}>
  <a className="social-link" href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer me" aria-label="Profil LinkedIn de Marc Bretzner" title="LinkedIn"><LinkedInGlyph/></a>
 </div>;
}

/* Bloc portrait + nom + réseaux (pied de page). Pour changer la photo, remplacer `src`. */
export function FooterIdentity() {
 return <div className="footer-identity">
  <div className="footer-identity-row">
   <span className="footer-portrait"><img src="/images/marc-portrait-rond.webp" alt="Marc Bretzner, fondateur de SEOKRAFT" width={72} height={72} loading="lazy"/></span>
   <span className="footer-identity-text"><strong>MARC BRETZNER</strong><em>créateur de sites internet</em></span>
  </div>
  <SocialLinks/>
 </div>;
}
