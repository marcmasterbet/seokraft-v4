# SEOKRAFT — Refonte 2026 · V1 Accueil

Première version de la **page d'accueil uniquement**, basée sur le brief maître. Next.js App Router, TypeScript, CSS natif. Pas d'assets générés par IA. La photo originale fournie est dans `public/images/`.

## Démarrer

```bash
npm install
npm run dev
```

Ouvrir http://localhost:3000.

## GitHub + Vercel

1. Créer un dépôt GitHub vide, puis y déposer **le contenu du dossier** (package.json à la racine).
2. Dans Vercel : Add New Project → Import Git Repository → Framework Next.js → Deploy.
3. Pour rendre le formulaire opérationnel : créer une clé API Resend, vérifier votre domaine expéditeur, puis renseigner dans Vercel les variables `RESEND_API_KEY`, `CONTACT_TO_EMAIL` et `CONTACT_FROM_EMAIL`. Copier `.env.example` en `.env.local` pour le développement local. **Sans ces variables, le formulaire signale clairement qu'il n'est pas configuré ; aucun faux succès n'est affiché.**

## Ce qui est inclus

- Hero éditorial et photographie N&B d'origine
- Portfolio interactif REMUS / GENESYS / LOCA DIRECT
- Scènes éditoriales, capacités, présentation, tarifs, FAQ
- Contact façon rédaction d'e-mail + écran de confirmation après envoi réel
- Responsive mobile/tablette, menu mobile, navigation non flottante
- Metadata, robots, sitemap, canonical, Open Graph
- Prise en charge `prefers-reduced-motion`

## Important avant mise en production sur seokraft.fr

- Les visuels des projets sont des **compositions graphiques CSS**, et **non des captures authentiques** des sites. Remplacer par des captures réelles approuvées.
- Réintégrer les pages et textes juridiques existants (mentions légales, politique de confidentialité, CGV si nécessaire), les liens en pied de page et les informations légales correctes.
- Réintégrer Search Console (fichier de vérification), Analytics et toute conversion encore utilisée. Ne pas remplacer les fichiers existants sans contrôle.
- Vérifier l'adresse e-mail de contact et les URL des projets.
- Préparer le favicon et l'identité graphique définitifs.
- Tester le formulaire avec Resend, vérifier la délivrabilité et ajouter des mesures anti-spam/rate-limit avant exposition publique.
- Faire les tests visuels sur appareils réels et audit accessibilité/performance.

La homepage est une V1 à valider. **Aucune page secondaire n'a été construite.**
