import type { MetadataRoute } from 'next';
export default function sitemap(): MetadataRoute.Sitemap {
 const base = 'https://www.seokraft.fr';
 const pages = ['/', '/creation-site-internet/strasbourg', '/seo/strasbourg', '/a-propos', '/rendez-vous', '/blog', '/blog/prix-site-internet', '/blog/geo', '/blog/seo-vs-geo', '/blog/etre-visible-chatgpt', '/blog/futur-recherche-ia'];
 return pages.map((path) => ({url: base + path, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: path === '/' ? 1 : path === '/creation-site-internet/strasbourg' ? 0.9 : path.startsWith('/blog/') ? 0.7 : 0.8}));
}
