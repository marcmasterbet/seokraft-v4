import { FooterIdentity } from './SocialLinks';
import CookieSettingsButton from './CookieSettingsButton';

export default function SiteFooter() {
 return <footer className="footer"><FooterIdentity/><div><span>© {new Date().getFullYear()} SEOKRAFT — Marc Bretzner</span></div><nav className="footer-legal" aria-label="Liens utiles"><a href="/creation-site-internet/strasbourg">Création de site à Strasbourg</a><a href="/blog">Blog</a><a href="/mentions-legales">Mentions légales</a><a href="/politique-de-confidentialite">Confidentialité</a><a href="/cgv">CGV</a><CookieSettingsButton/></nav></footer>;
}
