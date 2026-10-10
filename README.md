# SEOKRAFT — Refonte 2026 V2 (reconstruction neuve)

Projet Next.js App Router / TypeScript / CSS natif. **Aucun fichier de code repris de la V1**. Seule la photographie originale fournie a été réutilisée.

## Déploiement GitHub → Vercel

1. Envoyer **le contenu de ce dossier** à la racine du dépôt GitHub (app, components, public, package.json…).
2. Vercel : **Framework Preset = Next.js**, Root Directory vide, Build/Output/Install Command = paramètres par défaut.
3. Redéployer et consulter les Build Logs en cas d'échec.
4. Ne pas connecter le domaine public `seokraft.fr` tant que la V2 et les redirections SEO ne sont pas validées.

## Développement

```bash
npm install
npm run dev
npm run build
```

## Contact

Le formulaire appelle `/api/contact`. Pour activer les envois, renseigner dans Vercel `RESEND_API_KEY`, `CONTACT_FROM_EMAIL` (adresse sur domaine vérifié dans Resend) et `CONTACT_TO_EMAIL`. Tant que ces variables ne sont pas définies, le formulaire affiche une erreur explicite **sans fausse confirmation d'envoi**.

## SEO et prépublication

- Balises title, description, canonical, Open Graph, robots et sitemap fournis pour la future URL publique.
- **Attention :** canonical et sitemap pointent vers `https://www.seokraft.fr` : modifier uniquement si le domaine définitif est différent.
- Avant mise en ligne : réintégrer Search Console, Analytics, informations légales, pages services, vraies captures des réalisations, liens vérifiés, plan de redirections des anciennes URL et données structurées pertinentes.
- Sur un domaine de préproduction, utiliser la protection Vercel ou une règle `noindex` adaptée pour éviter une indexation prématurée.
- Les présentations de projets sont des **compositions typographiques CSS**, pas des captures des sites.
- Les prix présentés reprennent le brief maître et sont à vérifier avant publication (conditions et périmètre contractuel).

## Accessibilité et responsive

Conception responsive desktop/tablette/mobile, contraste, navigation clavier, `prefers-reduced-motion`, boutons et formulaire étiquetés.
