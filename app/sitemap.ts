import type { MetadataRoute } from 'next';
export default function sitemap(): MetadataRoute.Sitemap {
 const base = 'https://www.seokraft.fr';
 const pages = ['/', '/seo/strasbourg/', '/audit', '/rendez-vous', '/blog/geo/', '/blog/seo-vs-geo/', '/blog/etre-visible-chatgpt/', '/blog/futur-recherche-ia/'];
 return pages.map((path) => ({url: base + path, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: path === '/' ? 1 : path.startsWith('/blog/') ? 0.7 : 0.8}));
}
