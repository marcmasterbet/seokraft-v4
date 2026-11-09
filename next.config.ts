import type { NextConfig } from 'next';

/**
 * Politique de sécurité du contenu (CSP).
 * Seuls les services réellement utilisés sont autorisés :
 * Google Analytics (après consentement), Cal.com (réservation), Vercel (barre de prévisualisation).
 * 'unsafe-inline' reste nécessaire pour les scripts d'hydratation de Next.js sans nonce.
 */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://vercel.live",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.google-analytics.com https://*.googletagmanager.com",
  "font-src 'self'",
  // script.google.com : réception du questionnaire de projet (Google Apps Script → Google Sheets)
  "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://vercel.live https://script.google.com https://script.googleusercontent.com",
  "frame-src https://cal.com https://app.cal.com https://vercel.live",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "manifest-src 'self'",
  'upgrade-insecure-requests',
].join('; ');

const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-site' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=(), browsing-topics=()' },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async rewrites() {
    // Questionnaire de projet : page statique public/questionnaire.html servie sur /questionnaire
    return [{ source: '/questionnaire', destination: '/questionnaire.html' }];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: process.env.NODE_ENV === 'production'
          ? [...securityHeaders, { key: 'Content-Security-Policy', value: csp }]
          : securityHeaders,
      },
      {
        // Questionnaire réservé aux prospects : jamais indexé
        source: '/questionnaire(.*)',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      {
        source: '/fonts/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        // Fiche contact téléchargée depuis la page /carte (QR code de la carte de visite)
        source: '/marc-bretzner.vcf',
        headers: [
          { key: 'Content-Type', value: 'text/vcard; charset=utf-8' },
          { key: 'Content-Disposition', value: 'attachment; filename="Marc-Bretzner-SEOKRAFT.vcf"' },
        ],
      },
    ];
  },
};

export default nextConfig;
