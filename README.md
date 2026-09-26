# Plus Près — jeu de couple avec score de compatibilité

Next.js 16 (App Router, Turbopack) + Prisma 7 + Neon Postgres + NextAuth (credentials).

## Fonctionnement

- Deux comptes utilisateurs, profils paramétrables (nom, avatar emoji, bio, date de naissance)
- Le premier joueur crée une partie → reçoit un code à 6 caractères
- Le second rejoint avec ce code → la partie passe en "active"
- Les joueurs alternent : celui dont c'est le tour "tire une carte" (une question à choix multiples selon le niveau en cours)
- Les deux répondent **indépendamment** (l'app ne montre jamais la réponse de l'autre avant que les deux aient répondu)
- Une fois les deux réponses reçues, la manche est "révélée" : alignés ou non
- Le score de compatibilité est recalculé en direct (pondéré : niveau 3 compte plus que niveau 1)
- 3 niveaux : Découverte, Complicité, Connexion, avec passage manuel au niveau suivant
- Écran de fin avec score global et détail par niveau

## Prérequis

- Node.js **≥ 22.12** (`node -v`)
- [pnpm](https://pnpm.io) ≥ 10 (`corepack enable` pour activer la version figée par `packageManager`)

## 1. Installer les dépendances

```bash
pnpm install
```

`postinstall` exécute automatiquement `prisma generate`, qui écrit le client dans `src/generated/prisma/` (gitignoré).

## 2. Configurer Neon

1. Créez un projet sur [neon.tech](https://neon.tech) (ou utilisez votre connecteur Neon existant)
2. Copiez `.env.example` vers `.env` et remplissez `DATABASE_URL` (URL pooled) et `DIRECT_URL` (URL directe) depuis le dashboard Neon
3. Générez un secret NextAuth : `openssl rand -base64 32` → collez-le dans `NEXTAUTH_SECRET`

## 3. Créer les tables et les questions

```bash
pnpm prisma migrate dev --name init
pnpm prisma db seed
```

`prisma.config.ts` utilise `DIRECT_URL` pour les migrations (le pooler Neon n'en accepte pas) ; le client se connecte via `DATABASE_URL`.

## 4. Lancer en local

```bash
pnpm dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

Autres scripts : `pnpm build`, `pnpm start`, `pnpm typecheck`.

## 5. Déployer sur Vercel

1. Poussez le projet sur un repo GitHub
2. Importez-le sur [vercel.com](https://vercel.com) en sélectionnant **Node.js 22** (Node 20 n'est plus supporté par Prisma 7 et nanoid 6)
3. Ajoutez les variables d'environnement (`DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` = votre URL Vercel)
4. Déployez — Vercel exécute `prisma generate` automatiquement via `postinstall`
5. Lancez `pnpm prisma migrate deploy` (via Vercel CLI ou un script de build) puis `pnpm prisma db seed` une fois, pour peupler les questions en production

## Prochaines étapes suggérées (voir le cahier des charges v2)

- Remplacer le polling (2,5s) par du temps réel (Pusher, Ably, ou WebSocket via un serveur dédié)
- Mode gage si un joueur veut passer une question
- Historique complet des manches consultable après la partie
- Mode PWA installable
- Questions personnalisées ajoutées par le couple lui-même
