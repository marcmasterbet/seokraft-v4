import { FooterIdentity } from './SocialLinks';

export default function SiteFooter() {
 return <footer className="footer"><FooterIdentity/><div><span>Création et refonte de sites internet · Solutions web · SEO & GEO</span><span>© {new Date().getFullYear()} SEOKRAFT — Marc Bretzner</span></div><nav className="footer-legal" aria-label="Liens utiles"><a href="/creation-site-internet/strasbourg">Création de site à Strasbourg</a><a href="/blog">Blog</a><a href="/mentions-legales">Mentions légales</a><a href="/politique-de-confidentialite">Confidentialité</a><a href="/cgv">CGV</a></nav></footer>;
}
