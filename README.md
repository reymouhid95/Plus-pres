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

## 6. Tests

```bash
pnpm typecheck   # TypeScript strict
pnpm test        # tests unitaires (Vitest + Testing Library)
pnpm test:e2e    # build puis tests end-to-end (Playwright)
pnpm test:watch  # Vitest en mode watch
```

### Base de test locale (e2e)

Les e2e ne touchent jamais à Neon : ils utilisent une base Postgres dédiée,
décrite dans `.env.test` (port **5433**).

```bash
docker run -d --name plus-pres-test-db \
  -e POSTGRES_USER=pluspres -e POSTGRES_PASSWORD=pluspres \
  -e POSTGRES_DB=pluspres_test \
  -p 5433:5432 -v plus-pres-test-pg:/var/lib/postgresql \
  postgres:18

DOTENV_CONFIG_PATH=.env.test npx prisma migrate deploy
DOTENV_CONFIG_PATH=.env.test npx prisma db seed
```

Avant chaque suite, `e2e/global-setup.ts` rejoue `migrate deploy`, purge les
parties/rounds laissés par la précédente exécution (`e2e/reset-db.ts`) puis
relance le seed. Le serveur de test tourne sur le port **3100**.

### CI

`.github/workflows/ci.yml` enchaîne le job `quality` (typecheck, Vitest, build)
puis le job `e2e` (service Postgres 16, migrations, Playwright, rapport en
artefact en cas d'échec). Aucun secret requis : la base de test est provisionnée
par le workflow.

## Prochaines étapes (v2 — voir PLAN.md pour le suivi détaillé)

1. **Tests + CI** — fait (Vitest, Playwright, GitHub Actions)
2. **Temps réel + minuteur** — fait : flux SSE (`/api/sessions/[id]/stream`,
   `maxDuration = 60`, reconnexion automatique) avec polling 2,5 s en secours,
   minuteur 60/45/30 s par niveau (`Round.startedAt` / `expiresAt`),
   expiration résolue côté serveur (`src/lib/expiry.ts`)
3. **Historique & statistiques** — fait : `/history` (taux pondéré, courbe 14 jours,
   répartition par niveau, points de friction), `/game/[id]/review`, carte de
   résultat exportable en PNG, bloc « Votre évolution » sur le dashboard,
   agrégats SQL via `src/lib/history.ts` + logique pure dans `src/lib/stats.ts`
4. **Cadrage Duo + machine d'état (Phase A)** — fait : modèles `Duo`/`DuoMember`
   (le code d'invitation vit sur le duo), `User` invité (`email`/`passwordHash`
   nullables, `isGuest`), gardes centralisées (`src/lib/duo.ts`,
   `src/lib/session-state.ts`), contrat client inchangé.
   ⚠️ Migration `20260926120000_duo_model` **destructive** (`hostId`/`partnerId`/
   `code` retirés) : à appliquer sur Neon via `prisma migrate deploy`
5. **Lien d'invitation + auth progressive (Phase B)** — fait : `/join/[CODE]`
   (pseudo invité sans compte, cas membre connecté / déjà-membre / duo complet),
   provider next-auth `guest`, `POST /api/auth/upgrade` (même `user.id`),
   lobby §11 (joueurs, toast « X vient de rejoindre », bouton Commencer, statut
   session `lobby` + route `start`), landing §7.1 (CTA « Commencer une expérience
   à deux »)
6. **Boucle cœur (Phase C)** — fait : reveal « Vous avez choisi différemment »
   (neutre), réactions rapides, openers de conversation + motivations, score
   masqué en jeu, bilan « Vous avez découvert », sessions de 6 cartes (2 par
   palier, fin auto), rematch même duo/même code. Migration **additive**
   `20260926140000_reactions_discussions` à appliquer sur Neon
7. **Devine ma réponse (Phase D)** — fait : chaque manche = prédire puis répondre
   (verrouillage serveur), reveal « Bien deviné / Raté », 2ᵉ métrique Connaissance
   mutuelle, bilan complété (Bien deviné, Surprises). Migration **additive**
   `20260926160000_predictions` à appliquer sur Neon
8. **Types de questions & modes (Phase E — suite)** — fait : 6 types de questions
   (single, multiple, scale 1-5, ranking drag-drop, open, prediction) via
   `QuestionRenderer` unifié ; 4 modes §12 (Se découvrir, Devine ma réponse,
   Rigoler, Connexion) mappés sur les catégories ; 66 questions seed avec types
   variés. Migration additive `20260927000002_question_types` à appliquer sur Neon
9. **Contenu éditable (Phase E — admin)** — fait : `Question.active`, `User.role`,
   CRUD + import/export JSON/CSV via `/admin/questions`, 66 questions
   catégorisées (Se découvrir, Rigoler, Connexion, Devine ma réponse).
   Migrations additives `20260927000000_editable_content` +
   `20260927000001_question_created_at` + `20260927000002_question_types` à appliquer sur Neon
10. **Moments & Histoire (Phase F)** — fait : modèles `Moment`, `Challenge`, `DailyDiscovery`,
   API CRUD, écran découverte du jour (fin session), sauvegarde moments avec photo/texte,
   admin questions (CRUD + import/export). Migrations additives prêtes pour Neon.
   ⚠️ 1 e2e instable (`results.spec.ts` — matched count 3/4).
11. **Beta & MVP (§36, §38, §39, §40, §44)** — **FAIT** : rate limiting, analytics (§38), critères acceptation §44 (checklist `ACCEPTANCE_CRITERIA.md`), CI complète. ⚠️ 1 e2e instable (`results.spec.ts`) non bloquant.
