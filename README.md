# SEOKRAFT — Refonte 2026 — accueil V3 (textes alignés sur mini-audit)

Projet Next.js App Router / TypeScript / CSS natif. Base de la V2.3 conservée, avec réécriture des contenus de l’accueil selon le mini-audit du 4 octobre 2026. La photographie originale fournie a été conservée.

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

## Points à vérifier avant publication

- Le build Next.js n’a pas pu être exécuté dans l’environnement de préparation (installation npm indisponible). Le déploiement Vercel doit confirmer la compilation.
- Contrôler le rendu desktop/tablette/mobile, les vrais liens des réalisations et les offres avant publication.
- Les illustrations des projets sont des compositions éditoriales, **pas des captures réelles** : remplacer par des captures authentiques dès qu’elles sont disponibles.
- Aucune section témoignages n’a été ajoutée.
- Les recommandations de rédaction sont basées sur le mini-audit Jeff Bond du 04/10/2026 (ancienne version du site).


## V3.1 — correction hero
Titre contenu dans la colonne texte, photographie rectangulaire séparée, grille responsive, suppression du libellé redondant sous le CTA. Textes validés inchangés.
