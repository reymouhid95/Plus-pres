export type SeedQuestion = {
  level: number;
  text: string;
  options: string[];
  category?: string;
  active?: boolean;
  type?: "single" | "multiple" | "scale" | "ranking" | "open" | "prediction";
  scaleMin?: number;
  scaleMax?: number;
};

export const questions: SeedQuestion[] = [
  // Niveau 1 — Se découvrir (12 questions) — toutes en mode prédiction pour le test
  { level: 1, category: "Se découvrir", type: "prediction", text: "Soirée idéale ?", options: ["Netflix sous la couette", "Sortie entre amis", "Balade en amoureux", "Rester à ne rien faire"] },
  { level: 1, category: "Se découvrir", type: "prediction", text: "Ton plat sénégalais préféré ?", options: ["Thiéboudienne", "Yassa", "Mafé", "Autre"] },
  { level: 1, category: "Se découvrir", type: "prediction", text: "Le matin, tu es plutôt ?", options: ["Debout dès le réveil", "Snooze x5", "Café obligatoire", "Silence total"] },
  { level: 1, category: "Se découvrir", type: "prediction", text: "Un voyage de rêve ?", options: ["Plage isolée", "Grande ville animée", "Randonnée nature", "Road trip"] },
  { level: 1, category: "Se découvrir", type: "prediction", text: "Ton genre de film préféré ?", options: ["Comédie", "Action", "Romance", "Documentaire"] },
  { level: 1, category: "Se découvrir", type: "prediction", text: "Ton snack de minuit ?", options: ["Sucré", "Salé", "Fruits", "Je ne mange pas la nuit"] },
  { level: 1, category: "Se découvrir", type: "prediction", text: "Musique pour un trajet en voiture ?", options: ["Afrobeat", "R&B", "Silence / podcast", "Ça dépend de l'humeur"] },
  { level: 1, category: "Se découvrir", type: "prediction", text: "Ton animal de compagnie idéal ?", options: ["Chat", "Chien", "Aucun", "Un truc exotique"] },
  { level: 1, category: "Se découvrir", type: "prediction", text: "Le week-end, tu préfères ?", options: ["Sortir", "Rester à la maison", "Un mix des deux", "Travailler sur un projet perso"] },
  { level: 1, category: "Se découvrir", type: "prediction", text: "Ton style vestimentaire ?", options: ["Décontracté", "Soigné", "Streetwear", "Ça dépend du jour"] },
  { level: 1, category: "Se découvrir", type: "prediction", text: "Réseau social que tu utilises le plus ?", options: ["Instagram", "TikTok", "WhatsApp", "Aucun vraiment"] },
  { level: 1, category: "Se découvrir", type: "prediction", text: "Ta boisson du moment ?", options: ["Café", "Thé/bissap", "Jus naturel", "Eau, simplement"] },

  // Niveau 1 — Rigoler (6 questions) — 3 single, 3 multiple
  { level: 1, category: "Rigoler", text: "Si tu étais un légume, tu serais ?", options: ["Une patate douce", "Un piment fort", "Un avocat (gros noyau)", "Une carotte (croquante)"] },
  { level: 1, category: "Rigoler", type: "multiple", text: "Quels super-pouvoirs inutiles voudrais-tu ?", options: ["Faire apparaître des snacks", "Ne jamais avoir besoin de dormir", "Comprendre les bébés", "Téléporter les chaussettes perdues"] },
  { level: 1, category: "Rigoler", text: "Ton talent secret complètement inutile ?", options: ["Imiter les bruits d'animaux", "Retenir des paroles de pubs", "Plier le linge en 2 secondes", "Gagner à Pierre-Feuille-Ciseaux"] },
  { level: 1, category: "Rigoler", type: "multiple", text: "Qui serait le plus susceptible de... ?", options: ["Rire à un enterrement", "S'endormir au cinéma", "Commander le dessert pour deux", "Oublier son anniversaire"] },
  { level: 1, category: "Rigoler", text: "Le pire cadeau que tu as reçu ?", options: ["Un truc bizarre", "Un truc déjà vu", "Rien (j'aime tout)", "De l'argent (c'est pas un cadeau)"] },
  { level: 1, category: "Rigoler", type: "scale", scaleMin: 1, scaleMax: 5, text: "Si notre vie était un film, à quel point serait-ce une comédie ?", options: ["Pas du tout", "Un peu", "Moyennement", "Beaucoup", "Énormément"] },

  // Niveau 2 — Se découvrir (12 questions)
  { level: 2, category: "Se découvrir", text: "Quand on se dispute, tu préfères ?", options: ["En parler tout de suite", "Prendre du recul d'abord", "Écrire ce que je ressens", "Un câlin avant de discuter"] },
  { level: 2, category: "Se découvrir", text: "Ce qui te fait te sentir aimé(e) ?", options: ["Les mots doux", "Les gestes/cadeaux", "Le temps passé ensemble", "Le contact physique"] },
  { level: 2, category: "Se découvrir", text: "Une soirée en couple parfaite ressemble à ?", options: ["Cuisiner ensemble", "Sortie surprise", "Discussion profonde", "Jeux/rires"] },
  { level: 2, category: "Se découvrir", text: "Comment tu gères le stress de l'autre ?", options: ["J'écoute sans juger", "Je propose des solutions", "Je distrais", "Je donne de l'espace"] },
  { level: 2, category: "Se découvrir", text: "La fréquence de messages dans une journée idéale ?", options: ["Toute la journée", "Quelques fois", "Le matin et le soir", "Peu importe, la qualité compte"] },
  { level: 2, category: "Se découvrir", text: "Ce qui compte le plus au quotidien ?", options: ["La confiance", "La communication", "Le respect", "Le temps de qualité"] },
  { level: 2, category: "Se découvrir", text: "Face à une erreur de l'autre, tu ?", options: ["Pardonnes vite", "As besoin d'en parler d'abord", "Attends des excuses claires", "Passes à autre chose sans en reparler"] },
  { level: 2, category: "Se découvrir", text: "Ton love language principal ?", options: ["Paroles valorisantes", "Moments partagés", "Cadeaux", "Toucher physique"] },
  { level: 2, category: "Se découvrir", text: "Rencontrer la famille/les amis de l'autre, tu ?", options: ["As hâte", "Es un peu nerveux(se)", "Préfères y aller doucement", "Ça dépend du contexte"] },
  { level: 2, category: "Se découvrir", text: "Une habitude à deux que tu voudrais créer ?", options: ["Un rituel du soir", "Une sortie mensuelle", "Un projet commun", "Un jeu ou une activité régulière"] },
  { level: 2, category: "Se découvrir", text: "Ce que tu apprécies le plus dans notre duo ?", options: ["On se fait rire", "On se comprend vite", "On se soutient", "On est complémentaires"] },
  { level: 2, category: "Se découvrir", type: "ranking", text: "Classe ces priorités de couple (1 = top)", options: ["Confiance", "Communication", "Respect", "Temps de qualité"] },

  // Niveau 2 — Rigoler (6 questions) — single, multiple, scale, open
  { level: 2, category: "Rigoler", text: "Qui serait le plus susceptible de s'endormir au cinéma ?", options: ["Toi", "L'autre", "Les deux au bout de 10 min", "Personne, on regarde tout"] },
  { level: 2, category: "Rigoler", type: "multiple", text: "Ce qui te fait rire aux larmes ?", options: ["Les blagues nulles", "Les situations gênantes", "Les imitations", "Les vidéos d'animaux"] },
  { level: 2, category: "Rigoler", text: "Si tu devais imiter l'autre en une phrase ?", options: ["\"Ça va, c'est pas grave\"", "\"T'as vu l'heure ?\"", "\"J'ai faim\"", "\"On fait quoi ce soir ?\""] },
  { level: 2, category: "Rigoler", type: "scale", scaleMin: 1, scaleMax: 5, text: "Le surnom bizarre que tu lui donnerais (1=normal, 5=très bizarre) ?", options: ["Pas bizarre", "Un peu", "Moyen", "Bizarre", "Très bizarre"] },
  { level: 2, category: "Rigoler", type: "open", text: "Le truc le plus bizarre que tu as googlé récemment ?", options: [] },
  { level: 2, category: "Rigoler", type: "multiple", text: "Qui gagne à \"qui s'excuse en premier\" ?", options: ["Toi", "L'autre", "Match nul", "On s'excuse en même temps"] },

  // Niveau 3 — Connexion (12 questions)
  { level: 3, category: "Connexion", text: "Dans 5 ans, tu te vois plutôt ?", options: ["Installé(e) avec une famille", "Concentré(e) sur ma carrière", "En pleine évolution personnelle", "Je ne planifie pas trop loin"] },
  { level: 3, category: "Connexion", text: "Ce qui compte le plus dans une vie de couple réussie ?", options: ["La stabilité", "La croissance mutuelle", "La complicité au quotidien", "L'indépendance de chacun"] },
  { level: 3, category: "Connexion", text: "Face à une grande décision de vie, tu préfères ?", options: ["Décider ensemble étape par étape", "Que chacun décide pour soi puis on ajuste", "Suivre ton instinct puis en parler", "Prendre le temps d'y réfléchir seul(e) d'abord"] },
  { level: 3, category: "Connexion", text: "Ta plus grande peur en amour ?", options: ["Être abandonné(e)", "Perdre mon indépendance", "Ne pas être compris(e)", "Que ça devienne routinier"] },
  { level: 3, category: "Connexion", text: "Ce que tu attends le plus de moi dans les moments difficiles ?", options: ["Être écouté(e) sans jugement", "Être rassuré(e)", "Avoir de l'espace", "Sentir une présence, même en silence"] },
  { level: 3, category: "Connexion", text: "Ta définition de l'amour au quotidien ?", options: ["Des petites attentions", "Une présence constante", "Grandir ensemble", "Se choisir chaque jour"] },
  { level: 3, category: "Connexion", text: "Comment tu envisages l'argent en couple ?", options: ["Tout en commun", "Chacun garde son indépendance", "Un mix selon les dépenses", "On en parlera le moment venu"] },
  { level: 3, category: "Connexion", text: "Ce qui te ferait te sentir vraiment en sécurité avec quelqu'un ?", options: ["La transparence totale", "La constance dans le temps", "Des actes plus que des mots", "Le respect de mon rythme"] },
  { level: 3, category: "Connexion", text: "Une valeur non négociable pour toi en couple ?", options: ["L'honnêteté", "Le respect mutuel", "La loyauté", "La liberté individuelle"] },
  { level: 3, category: "Connexion", text: "Ce que tu espères qu'on construira ensemble ?", options: ["Un foyer stable", "Des projets communs", "Une complicité durable", "Des souvenirs, avant tout"] },
  { level: 3, category: "Connexion", text: "Comment tu réagis face à un silence prolongé de l'autre ?", options: ["Je m'inquiète vite", "Je respecte l'espace", "Je demande ce qui se passe", "Je laisse venir naturellement"] },
  { level: 3, category: "Connexion", type: "ranking", text: "Classe ces piliers de couple (1 = essentiel)", options: ["Honnêteté", "Respect", "Liberté", "Complicité"] },

  // Niveau 3 — Devine ma réponse (12 questions — mode prédiction)
  { level: 3, category: "Devine ma réponse", type: "prediction", text: "Si je pouvais téléporter quelque part maintenant, ce serait ?", options: ["Dakar", "Paris", "Montréal", "Tokyo"] },
  { level: 3, category: "Devine ma réponse", type: "prediction", text: "Le premier mot qui me vient à l'esprit pour \"avenir\" ?", options: ["Excitant", "Incertain", "Projets", "Famille"] },
  { level: 3, category: "Devine ma réponse", type: "prediction", text: "Ce que je ferais si je gagnais à la loterie ?", options: ["Acheter une maison", "Voyager partout", "Investir / créer", "Aider mes proches"] },
  { level: 3, category: "Devine ma réponse", type: "prediction", text: "Mon souvenir d'enfance le plus marquant ?", options: ["Une fête de famille", "L'école / les amis", "Un voyage", "Un moment simple"] },
  { level: 3, category: "Devine ma réponse", type: "prediction", text: "La qualité que je cherche chez un ami ?", options: ["La loyauté", "L'humour", "L'écoute", "L'authenticité"] },
  { level: 3, category: "Devine ma réponse", type: "prediction", text: "Ce que je changerais dans ma vie si je le pouvais ?", options: ["Rien", "Mon travail", "Où j'habite", "Ma confiance en moi"] },
  { level: 3, category: "Devine ma réponse", type: "prediction", text: "Ma plus grande fierté personnelle ?", options: ["Mon parcours", "Mes relations", "Ce que j'ai surmonté", "Ce que j'apprends encore"] },
  { level: 3, category: "Devine ma réponse", type: "prediction", text: "Le compliment qui me touche le plus ?", options: ["Tu es inspirant(e)", "Tu es drôle", "Tu es fiable", "Tu es toi"] },
  { level: 3, category: "Devine ma réponse", type: "prediction", text: "Ce que je n'ai jamais osé dire à voix haute ?", options: ["J'ai peur de l'échec", "J'aime être seul(e) parfois", "Je doute souvent", "Rien, je dis tout"] },
  { level: 3, category: "Devine ma réponse", type: "prediction", text: "Si je pouvais revivre un jour parfait, ce serait ?", options: ["Un jour d'enfance", "Notre première rencontre", "Une réussite récente", "Un jour simple avec vous"] },
  { level: 3, category: "Devine ma réponse", type: "prediction", text: "Ce que je veux qu'on retienne de nous ?", options: ["Qu'on s'aimait fort", "Qu'on a grandi ensemble", "Qu'on s'est fait rire", "Qu'on était vrais"] },
  { level: 3, category: "Devine ma réponse", type: "prediction", text: "Ma définition du bonheur à deux ?", options: ["Se comprendre sans parler", "Grandir sans se perdre", "Partager les hauts et les bas", "Se choisir, encore et encore"] },

  // Niveau 3 — Rigoler (6 questions) — single, multiple, scale, open
  { level: 3, category: "Rigoler", text: "Qui serait le plus susceptible de commander le dessert... pour deux ?", options: ["Toi", "L'autre", "Les deux", "Personne, on partage"] },
  { level: 3, category: "Rigoler", type: "multiple", text: "Les moments les plus gênants qu'on a partagés ?", options: ["Un silence radio", "Une chute", "Un malentendu drôle", "On n'en a pas (encore)"] },
  { level: 3, category: "Rigoler", type: "scale", scaleMin: 1, scaleMax: 5, text: "Si on échangeait nos vies 24h, à quel point en profiterais-tu ?", options: ["Pas du tout", "Un peu", "Moyennement", "Beaucoup", "À fond"] },
  { level: 3, category: "Rigoler", type: "open", text: "Notre chanson (même si on n'en a pas) serait ?", options: [] },
  { level: 3, category: "Rigoler", text: "Le surnom que l'autre te donne quand il/elle est agacé(e) ?", options: ["Mon cœur", "Chéri(e)", "Ton prénom complet", "Rien, il/elle soupire"] },
  { level: 3, category: "Rigoler", type: "ranking", text: "Dans 20 ans, on sera (1 = le plus probable) ?", options: ["Ces vieux qui se chamaillent", "Ces vieux qui dansent", "Ces vieux qui voyagent", "Ces vieux qui rigolent encore"] },
];