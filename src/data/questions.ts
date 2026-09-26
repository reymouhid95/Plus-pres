export type SeedQuestion = {
  level: number;
  text: string;
  options: string[];
  category?: string;
};

export const questions: SeedQuestion[] = [
  // Niveau 1 — Découverte
  { level: 1, text: "Soirée idéale ?", options: ["Netflix sous la couette", "Sortie entre amis", "Balade en amoureux", "Rester à ne rien faire"] },
  { level: 1, text: "Ton plat sénégalais préféré ?", options: ["Thiéboudienne", "Yassa", "Mafé", "Autre"] },
  { level: 1, text: "Le matin, tu es plutôt ?", options: ["Debout dès le réveil", "Snooze x5", "Café obligatoire", "Silence total"] },
  { level: 1, text: "Un voyage de rêve ?", options: ["Plage isolée", "Grande ville animée", "Randonnée nature", "Road trip"] },
  { level: 1, text: "Ton genre de film préféré ?", options: ["Comédie", "Action", "Romance", "Documentaire"] },
  { level: 1, text: "Ton snack de minuit ?", options: ["Sucré", "Salé", "Fruits", "Je ne mange pas la nuit"] },
  { level: 1, text: "Musique pour un trajet en voiture ?", options: ["Afrobeat", "R&B", "Silence / podcast", "Ça dépend de l'humeur"] },
  { level: 1, text: "Ton animal de compagnie idéal ?", options: ["Chat", "Chien", "Aucun", "Un truc exotique"] },
  { level: 1, text: "Le week-end, tu préfères ?", options: ["Sortir", "Rester à la maison", "Un mix des deux", "Travailler sur un projet perso"] },
  { level: 1, text: "Ton style vestimentaire ?", options: ["Décontracté", "Soigné", "Streetwear", "Ça dépend du jour"] },
  { level: 1, text: "Réseau social que tu utilises le plus ?", options: ["Instagram", "TikTok", "WhatsApp", "Aucun vraiment"] },
  { level: 1, text: "Ta boisson du moment ?", options: ["Café", "Thé/bissap", "Jus naturel", "Eau, simplement"] },

  // Niveau 2 — Complicité
  { level: 2, text: "Quand on se dispute, tu préfères ?", options: ["En parler tout de suite", "Prendre du recul d'abord", "Écrire ce que je ressens", "Un câlin avant de discuter"] },
  { level: 2, text: "Ce qui te fait te sentir aimé(e) ?", options: ["Les mots doux", "Les gestes/cadeaux", "Le temps passé ensemble", "Le contact physique"] },
  { level: 2, text: "Une soirée en couple parfaite ressemble à ?", options: ["Cuisiner ensemble", "Sortie surprise", "Discussion profonde", "Jeux/rires"] },
  { level: 2, text: "Comment tu gères le stress de l'autre ?", options: ["J'écoute sans juger", "Je propose des solutions", "Je distrais", "Je donne de l'espace"] },
  { level: 2, text: "La fréquence de messages dans une journée idéale ?", options: ["Toute la journée", "Quelques fois", "Le matin et le soir", "Peu importe, la qualité compte"] },
  { level: 2, text: "Ce qui compte le plus au quotidien ?", options: ["La confiance", "La communication", "Le respect", "Le temps de qualité"] },
  { level: 2, text: "Face à une erreur de l'autre, tu ?", options: ["Pardonnes vite", "As besoin d'en parler d'abord", "Attends des excuses claires", "Passes à autre chose sans en reparler"] },
  { level: 2, text: "Ton amour love language principal ?", options: ["Paroles valorisantes", "Moments partagés", "Cadeaux", "Toucher physique"] },
  { level: 2, text: "Rencontrer la famille/les amis de l'autre, tu ?", options: ["As hâte", "Es un peu nerveux(se)", "Préfères y aller doucement", "Ça dépend du contexte"] },
  { level: 2, text: "Une habitude à deux que tu voudrais créer ?", options: ["Un rituel du soir", "Une sortie mensuelle", "Un projet commun", "Un jeu ou une activité régulière"] },
  { level: 2, text: "Ce que tu apprécies le plus dans notre duo ?", options: ["On se fait rire", "On se comprend vite", "On se soutient", "On est complémentaires"] },
  { level: 2, text: "Face à un désaccord sur un choix commun ?", options: ["Je cède facilement", "Je négocie", "Je défends mon avis", "Je propose un compromis créatif"] },

  // Niveau 3 — Connexion
  { level: 3, text: "Dans 5 ans, tu te vois plutôt ?", options: ["Installé(e) avec une famille", "Concentré(e) sur ma carrière", "En pleine évolution personnelle", "Je ne planifie pas trop loin"] },
  { level: 3, text: "Ce qui compte le plus dans une vie de couple réussie ?", options: ["La stabilité", "La croissance mutuelle", "La complicité au quotidien", "L'indépendance de chacun"] },
  { level: 3, text: "Face à une grande décision de vie, tu préfères ?", options: ["Décider ensemble étape par étape", "Que chacun décide pour soi puis on ajuste", "Suivre ton instinct puis en parler", "Prendre le temps d'y réfléchir seul(e) d'abord"] },
  { level: 3, text: "Ta plus grande peur en amour ?", options: ["Être abandonné(e)", "Perdre mon indépendance", "Ne pas être compris(e)", "Que ça devienne routinier"] },
  { level: 3, text: "Ce que tu attends le plus de moi dans les moments difficiles ?", options: ["Être écouté(e) sans jugement", "Être rassuré(e)", "Avoir de l'espace", "Sentir une présence, même en silence"] },
  { level: 3, text: "Ta définition de l'amour au quotidien ?", options: ["Des petites attentions", "Une présence constante", "Grandir ensemble", "Se choisir chaque jour"] },
  { level: 3, text: "Comment tu envisages l'argent en couple ?", options: ["Tout en commun", "Chacun garde son indépendance", "Un mix selon les dépenses", "On en parlera le moment venu"] },
  { level: 3, text: "Ce qui te ferait te sentir vraiment en sécurité avec quelqu'un ?", options: ["La transparence totale", "La constance dans le temps", "Des actes plus que des mots", "Le respect de mon rythme"] },
  { level: 3, text: "Une valeur non négociable pour toi en couple ?", options: ["L'honnêteté", "Le respect mutuel", "La loyauté", "La liberté individuelle"] },
  { level: 3, text: "Ce que tu espères qu'on construira ensemble ?", options: ["Un foyer stable", "Des projets communs", "Une complicité durable", "Des souvenirs, avant tout"] },
  { level: 3, text: "Comment tu réagis face à un silence prolongé de l'autre ?", options: ["Je m'inquiète vite", "Je respecte l'espace", "Je demande ce qui se passe", "Je laisse venir naturellement"] },
  { level: 3, text: "Ce qui rendrait notre histoire inoubliable ?", options: ["Des aventures partagées", "Une évolution constante l'un avec l'autre", "Une tendresse au quotidien", "Le sentiment d'être vraiment vus"] },
];
