import type { MetadataRoute } from 'next';
import { articles } from '../components/articles';
export default function sitemap(): MetadataRoute.Sitemap {
 const base = 'https://www.seokraft.fr';
 const pages = ['/', '/creation-site-internet/strasbourg', '/seo/strasbourg', '/tarifs', '/realisations', '/a-propos', '/rendez-vous', '/blog', ...articles.map(a => '/blog/' + a.slug)];
 return pages.map((path) => ({url: base + path, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: path === '/' ? 1 : path === '/creation-site-internet/strasbourg' ? 0.9 : path.startsWith('/blog/') ? 0.7 : 0.8}));
}
