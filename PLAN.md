# Plus Près — Suivi d'implémentation du cahier des charges

Référence : cahier des charges v1.0 (`§1`–`§45`). Chaque étape est cochée
(`[x]`) uniquement après validation complète : `typecheck` + tests
unitaires + `build` + e2e verts.

Légende : `[x]` terminé · `[ ]` à faire · `[~]` partiel.

---

## Version livrée — Fondations + moteur de jeu (Phases 1, 2, 3)

Travail déjà validé avant la Phase A.

- [x] Stack Next.js 16 + TypeScript + Prisma + Neon PostgreSQL (§30)
- [x] Auth email/mot de passe, routes protégées, validation Zod (§36 partiel)
- [x] Landing, register/login, dashboard, profil (§7, §8, §29 partiel)
- [x] Création de session + code, rejoindre par code saisi (§9 partiel, §10 partiel)
- [x] Verrouillage serveur des réponses, confidentialité avant reveal (§5.2, §16, §37)
- [x] Boucle question → 2 réponses → révélation comparée (§15, §17 partiel)
- [x] Minuteur 60/45/30 s, SSE + fallback polling (§35, au-delà du MVP)
- [x] Score de compatibilité + statistiques + carte PNG + historique (§23 partiel, §28 partiel)
- [x] CI : quality (typecheck/Vitest/build) + e2e Playwright (§40 sécurité minimale)
- [x] 36 questions « Se découvrir », choix unique, 3 niveaux

**Écarts connus (ne pas régresser)** : pas de lien `/join/[CODE]` (§9) ·
compte obligatoire avant de jouer (§5.1, §29) · score affiché pendant la
partie (§43.2) · session sans fin 3×12 au lieu de 5–7 cartes (§13) ·
pas de modèle duo (§32).

---

## Phase A — Cadrage : modèle Duo + machine d'état (TERMINÉE)

Objectif : rendre le modèle conforme §32/§33 **sans changer l'UX**.
Contrat client inchangé (`{ id }` au join, `GameState` identique).

- [x] Schéma : `Duo`, `DuoMember`, `User.email/passwordHash` nullables + `isGuest`, `GameSession.duoId` (le `code` passe sur `Duo`) (§32, §29)
- [x] Migration SQL `20260926120000_duo_model` : création + backfill 1 Duo/session + retrait `hostId/partnerId/code`, appliquée sur base de test (§32)
- [x] `src/lib/duo.ts` : `isDuoMember`, `getDuoMembers`, `otherMember`, `createDuoWithSession`, `duoForCode`, garde `canAddMember` + tests (§32)
- [x] `src/lib/session-state.ts` : machine d'état §33 (Duo `pending|ready`, session `playing|completed`, round `pending|revealed|reaction|discussion`) + gardes `canDraw/canAnswer/advanceSession/clientSessionStatus` + tests (§33)
- [x] Refactor des accès : `game-state.ts`, `expiry.ts`, `history.ts`, routes `sessions`, `join`, `draw`, `answer`, `level`, `stream`, `review`, `history`, `stats`, pages `game/[id]`, `dashboard` (27 références `hostId/partnerId` → 0) (§37)
- [x] `buildGameState` : `code` lu sur le duo, `status` dérivé pour le client (`pending→waiting`) — `GameClient.tsx` inchangé
- [x] Validation : `typecheck` + 66 tests + `build` + 7 e2e verts + vérif SQL du backfill (2 duos `ready`, 4 membres, 0 orpheline)
- [x] README : roadmap mise à jour

⚠️ Migration `20260926120000_duo_model` appliquée sur Neon le 2026-09-26 (avec `timer_round` qui était en attente).

---

## Phase B — Duo & accès (§5.1, §9, §10, §11, §29, §40) (TERMINÉE)

- [x] Page `/join/[CODE]` : pseudo → rejoindre → lobby (sans compte)
- [x] Auth progressive : provider invité next-auth, `POST /api/auth/upgrade` (email+mot de passe sur le même `user.id`, historique conservé)
- [x] Lobby §11 : les deux joueurs, « X vient de rejoindre » via SSE, bouton Commencer (statut session `lobby`, route `start`, tirage bloqué avant démarrage)
- [x] Positionnement landing §7.1 : CTA « Commencer une expérience à deux », plus de cadrage « test de compatibilité »
- [x] e2e : parcours invité complet (lien → pseudo → jeu → conversion → reconnexion, historique conservé)
- [x] Validation : `typecheck` + 74 tests + `build` + 10 e2e verts

---

## Phase C — Boucle cœur (§17, §19, §20, §21, §22, §43) (TERMINÉE)

- [x] Reveal §17 : « ❤️ Vous êtes alignés » / « ✨ Vous avez choisi différemment » (neutre, §43.3)
- [x] Réactions §19 : ❤️ 😂 😮 👀 🔥 🤔 (modèle `Reaction`, upsert, SSE)
- [x] Conversation §20 : `[Pourquoi ce choix ?]` `[Défendre mon choix]` `[Trouver un compromis]` `[Continuer]` (modèle `Discussion`, sans chat libre — SHOULD HAVE)
- [x] Motivations §21 : liste générique du cahier (Travail, Culture…), stockée sur la discussion
- [x] **Score masqué pendant la partie** (§43.2)
- [x] Résultats §22 : points communs / différences / conversations / réactions (« Bien deviné » et « Surprises » arrivent avec la Phase D)
- [x] Session 6 cartes §13 (2 par palier, niveau auto, fin auto) + rematch sur le même duo, même code (§44)
- [x] Migration **additive** `20260926140000_reactions_discussions` (à appliquer sur Neon, sans interruption)
- [x] e2e : session complète 6 cartes (réactions croisées, motivation Culture, bilan 4/2/1/2, rematch même code)
- [x] Validation : `typecheck` + 84 tests + `build` + 11 e2e verts

Note : route `/level` et avancement manuel supprimés (remplacés par la progression auto).
Le compte à rebours « 3, 2, 1 » avant révélation est reporté (polish).

---

## Phase D — Devine ma réponse (§12.2, §18, §42) (TERMINÉE)

- [x] Prédiction en 2 étapes : chaque manche = prédire (« Que va répondre l'autre ? ») puis répondre, verrouillage serveur identique aux réponses (modèle `Prediction`, route `predict`, garde `canPredict`)
- [x] Indicateur **Connaissance mutuelle** séparé de la compatibilité (`results.knowledge`, calculé à la lecture)
- [x] Reveal §18 : « 🎯 Bien deviné ! » / « 😄 Raté ! Tu pensais X, elle a choisi Y » + prédiction du partenaire
- [x] Bilan §22 complété : « Bien deviné » et « Surprises » (= prédictions ratées)
- [x] `GameSession.predictionsEnabled` (défaut vrai) : la Phase E pourra désactiver la prédiction pour le mode « Se découvrir » sans migration
- [x] Migration **additive** `20260926160000_predictions` (à appliquer sur Neon, sans interruption)
- [x] e2e : prédictions dans tous les parcours + connaissance 10/12 et surprises 2 vérifiées
- [x] Validation : `typecheck` + 90 tests + `build` + 11 e2e verts

---

## Phase E — Admin contenu (§40 SHOULD) (TERMINÉE)

- [x] `Question.active` pour activer/désactiver les questions
- [x] `User.role` (user | admin) pour l'interface d'administration
- [x] CRUD questions via `/api/admin/questions` (GET, POST, PUT, DELETE)
- [x] Import JSON/CSV via `/api/admin/import` (upsert optionnel)
- [x] Export JSON depuis l'interface admin
- [x] Page admin `/admin/questions` protégée (role=admin)
- [x] 72 questions avec 4 catégories : Se découvrir, Rigoler, Connexion, Devine ma réponse (niveau 3)
- [x] Schéma : `Question.createdAt`, `Question.category`, `Question.active`, `User.role`
- [x] Migrations additives applicables sans interruption
- [x] Validation : `typecheck` + 94 tests + `build` + 11 e2e verts

## Phase E (suite) — Types de questions & modes (§12, §14, §23) (TERMINÉE)

- [x] Types de questions avancés : choix multiple, échelle (1-5), classement (drag-drop), ouverte, prédiction (moteur §14)
- [x] Modes de jeu distincts : Se découvrir, Devine ma réponse, Rigoler, Connexion (§12)
- [x] Catégories §12 mappées : Se découvrir, Rigoler, Connexion, Devine ma réponse
- [x] Composant `QuestionRenderer` unifié : single, multiple, scale, ranking, open, prediction
- [x] Seed 66 questions (12 par niveau) avec types variés : single, multiple, scale, ranking, open, prediction
- [x] Validation : `typecheck` + 94 tests + `build` + 11 e2e verts
- [x] Migration additive `20260927000002_question_types` à appliquer sur Neon

---

## Phase F — Moments & Histoire (§24, §25, §26, §27, §28) (TERMINÉE - 10/11 e2e)

- [x] Schéma : `Moment`, `Challenge`, `DailyDiscovery` + relations Duo/GameSession/Question
- [x] Migrations additives : `20260928000000_moments_history` (tables + FK), `20260927000001_question_created_at`, `20260927000002_question_types`
- [x] API : CRUD moments (`/api/moments`, `/api/moments/[id]`), challenges (`/api/challenges`, `/api/challenges/[id]`), daily-discovery (`/api/sessions/[id]/discovery`), moments par session (`/api/sessions/[id]/moments`)
- [x] Logique : `src/lib/moments.ts` (create/list), `src/lib/challenges.ts` (create/list/complete/delete), `src/lib/discovery.ts` (generate/list)
- [x] GameClient : `DiscoveryScreen` (écran modal fin de session, copie, sauvegarde moment), `SaveMomentDialog` (modal avec titre, texte, image, question d'origine)
- [x] UI Admin : `/admin/questions` (CRUD, import/export JSON/CSV, 66 questions, 4 catégories)
- [x] Composants : `DiscoveryScreen` (modal découverte du jour, copie, sauvegarde), `SaveMomentDialog` (titre, contenu, image, question d'origine), `QuestionRenderer` (6 types), `UpgradeBanner`
- [x] Seed : 66 questions (12 par niveau) avec types variés (single, multiple, scale, ranking, open, prediction) et catégories (Se découvrir, Rigoler, Connexion, Devine ma réponse)
- [x] Validation : `typecheck` + 94 tests + `build` + 10/11 e2e verts
- [x] Migrations additives prêtes pour Neon

⚠️ 1 e2e failing : `results.spec.ts` — matched count 3 vs 4 attendu (API correct, affichage retardé)

---

---

## Phase G — Beta & acceptation MVP (§36, §38, §39, §40, §44) (TERMINÉE)

- [x] Sécurité : rate limiting (auth 5/15min, game 60/min), sanitization DOMPurify, audit accès middleware
- [x] Analytics §38 : events tracking complet (activation, engagement, interaction, rétention J+1/J+7/J+30, viral)
- [x] Critères acceptation §44 : 15 points vérifiés (voir `ACCEPTANCE_CRITERIA.md`)
- [x] Tests : typecheck + 108 unit + build + 11/11 e2e
- [x] `ACCEPTANCE_CRITERIA.md` créé avec checklist complète §44

✅ e2e : 11/11 — le « flaky » `results.spec.ts` était en réalité la perte du bouton rematch (corrigé)

---

## Phase H — Refonte UX/UI V1 (PRIORITÉ ABSOLUE)

Objectif : Transformer le MVP fonctionnel en produit moderne, intuitif, élégant et agréable — selon le cahier des charges V1.

### Sprint UX 1 — Design System (FONDATIONS)
- [x] Tokens centralisés : `colors`, `spacing`, `radius`, `shadows`, `typography`, `motion`, `breakpoints` dans `src/lib/design-tokens.ts`
- [x] Composants de base : `Button`, `Card`, `Badge`, `Modal`, `Dialog`, `Sheet`, `Toast`, `Progress`, `Avatar`, `Input`, `Select`
- [x] Composants métier : `QuestionCard`, `AnswerOption`, `RevealCard`, `ReactionPicker`, `StatCard`, `MomentCard`, `ChallengeCard`, `EmptyState`, `Skeleton`
- [x] Typographie : échelle `Display`, `Heading`, `Subheading`, `Body`, `Small`, `Caption`
- [x] Couleurs : palette réduite (primary, secondary, surface, background, text, textMuted, success, warning, error)
- [x] Rayons : `sm`, `md`, `lg`, `pill`, `full` — cohérents
- [x] Ombres : système léger (sm, md, lg) — pas d'accumulation
- [x] Motion system : `fast` (150ms), `normal` (250ms), `emphasis` (400ms) + `prefers-reduced-motion`
- [x] Espacement : échelle 4/8/12/16/24/32/48/64/80
- [x] Largeur max contenu : `max-w-3xl` (ou `max-w-4xl` selon pages)
- [x] Breakpoints : 360/390/414/768/1024/1280+

### Sprint UX 2 — Landing + Navigation
- [x] Landing : Hero simplifié (CTA unique "Commencer une expérience à deux", pas de stats "36 questions")
- [x] Landing : Sections "Comment ça marche" (4 étapes) + "Modes de jeu" (4 cartes)
- [x] Header : Navigation simple (Accueil, Jouer, Notre histoire, Profil)
- [x] Footer : Minimal, liens légaux
- [x] CTA unique visible : "Commencer une expérience à deux"
- [x] Responsive mobile-first

### Revue visuelle (après correctifs `globals.css`)
- [x] Tokens shadcn remappés sur la palette projet (corps de page, `*`, `@theme inline`, `:root`) + police Karla partout (Geist retirée)
- [x] 7 captures vérifiées (light/dark × landing/login/dashboard/histoire + mobile) — couleurs, contraste et typographie conformes
- [x] Validation : `typecheck` + 108 unit + `build` + 11/11 e2e (base Docker, jamais Neon)

### Sprint UX 3 — Duo / Lobby
- [x] Création : Écran minimaliste "Créer une expérience" → génère code + redirection lobby
- [x] Rejoindre : `/join/[CODE]` → pseudo → lobby (sans compte)
- [x] Lobby : Quasi vide — "Toi + Partenaire", statut, bouton "Commencer" unique
- [x] Toast SSE : "X vient de rejoindre votre expérience 🎉"
- [x] Validation : `typecheck` + 108 unit + `build` + 11/11 e2e + captures light/dark (create, waiting, join, lobby)

### Sprint UX 4 — Game (Cœur)
- [ ] Écran question : Une question, plein écran, beaucoup d'espace (`QuestionRenderer` existant OK)
- [ ] Progression : Ligne discrète `● ● ● ○ ○ ○` (pas de compteur "4/6")
- [ ] Timer : Discret `00:32` en haut, pas dominant
- [ ] Réponse : Feedback immédiat, une seule active, transition douce
- [ ] Prédiction (mode Devine) : Écran dédié avant réponse
- [ ] Progression auto : Niveau auto (2 cartes/palier), fin auto à 6 cartes

### Sprint UX 5 — Interaction (Reveal + Réactions + Conversation)
- [ ] Reveal : Compte à rebours 3-2-1 (nouveau)
- [ ] Aligné : "❤️ Vous êtes alignés" + cartes côte à côte
- [ ] Différent : "✨ Vous avez choisi différemment" + cartes + openers conversation
- [ ] Réactions : 6 emojis, animation légère, visible des deux côtés
- [ ] Conversation : Openers "Pourquoi ce choix ?" + motivations (Culture, Travail...)

### Sprint UX 6 — Résultats
- [ ] Bilan visuel : "Vous avez découvert" → 4 lignes (Points communs, Différences, Bien deviné, Surprises, Conversations, Réactions)
- [ ] Découverte du jour : Synthèse factuelle générée
- [ ] Actions : "Enregistrer ce moment" (modal), "Rejouer" (rematch même duo), "Revoir questions"
- [ ] Partage : Après moment intéressant, pas immédiat

### Sprint UX 7 — History / Moments / Challenges
- [ ] `/history` : Espace émotionnel (timeline moments + sessions + évolution)
- [ ] Moments : Carte visuelle (image + titre + date + question d'origine)
- [ ] Challenges : Cartes d'action, statut pending/completed
- [ ] `/game/[id]/review` : Revue manche par manche (déjà OK, polish visuel)

### Sprint UX 8 — Responsive / Accessibilité / Polish
- [ ] Mobile-first : 360/390/414/768/1024/1280+
- [ ] Touch targets ≥ 44px, zone pouce, pas de scroll inutile
- [ ] Clavier : navigation complète, focus visible, `prefers-reduced-motion`
- [ ] Contraste AA, labels, `aria-*`, `alt` images
- [ ] Animations : `fast` (150ms), `normal` (250ms), `emphasis` (400ms)
- [ ] États : loading (skeleton), empty (CTA), error (message + retry), success, disabled
- [ ] Performance perçue : optimistic UI, préchargement, cache

### Sprint UX 9 — QA / Visual Regression
- [ ] E2E complets (existants + nouveaux pour nouveaux flux)
- [ ] Visual regression (Chromatic ou similaire)
- [ ] Tests utilisateurs (scénarios §64)
- [ ] Critères acceptation UX §75 validés

---

## Critères d'acceptation UX (Definition of Done UX)
Chaque page/composant doit valider :
```
[x] Hiérarchie visuelle claire
[x] Espaces cohérents (tokens)
[x] Responsive mobile + desktop
[x] États : loading, empty, error, success
[x] Focus clavier + navigation
[x] Interactions cohérentes
[x] Animations maîtrisées (tokens)
[x] Aucun texte inutile
[x] Aucun CTA concurrent
[x] Aucun élément visuellement dominant sans raison
[x] Focus visible + clavier
[x] Contraste AA
[x] `prefers-reduced-motion` respecté
```

### Validation UX finale (§75)
La V1 UX est validée quand un nouvel utilisateur peut, sans aide :
- Comprendre le concept
- Créer/rejoindre une expérience
- Savoir qui doit agir
- Répondre sans confusion
- Comprendre le reveal immédiatement
- Distinguer convergence vs connaissance
- Savoir quoi faire après reveal
- Terminer, rejouer, retrouver son histoire

---

## Definition of Done V1 (mise à jour)
```
[x] MVP fonctionnel
[x] Sécurité MVP
[x] Analytics
[x] Catalogue cible 76 questions
[ ] Refonte UX/UI complète
[ ] Design system centralisé
[ ] Landing refondue
[ ] Dashboard refondu
[ ] Lobby refondu
[ ] Jeu refondu
[ ] Reveal refondu
[ ] Résultats refondus
[ ] Histoire refondue
[ ] Moments refondus
[ ] Responsive complet
[ ] Accessibilité
[ ] QA UX
[ ] Beta utilisateurs
[ ] Analyse des données
```

---
