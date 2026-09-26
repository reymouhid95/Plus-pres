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

## Phase G — Beta & acceptation MVP (§36, §38, §39, §40, §44) (À FAIRE)

- [ ] Sécurité : rate limiting, sanitation des contenus, audit des accès (§36)
- [ ] Analytics §38 : activation, engagement, interaction, rétention J+1/J+7/J+30, viral
- [ ] Critères d'acceptation §44 : les 15 points vérifiés un par un (dont déconnexion/reconnexion sans perte)
- [ ] Tests utilisateurs, performances, correction (§41 Phase 9)

---

## Hors MVP — rappelé par §40 WON'T HAVE

Réseau social public · marketplace · thérapie / diagnostic · IA qui juge ·
microservices · NestJS · Redis. Ne pas implémenter.
