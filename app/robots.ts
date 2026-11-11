import type { MetadataRoute } from 'next';
export default function robots(): MetadataRoute.Robots {return {rules:{userAgent:'*',allow:'/',disallow:['/outil-audit','/api/']},sitemap:'https://www.seokraft.fr/sitemap.xml'}}
