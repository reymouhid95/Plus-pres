/** Libellés, couleurs et intentions des trois niveaux de jeu. */
export const LEVEL_META: Record<number, { label: string; color: string; hint: string }> = {
  1: { label: "Découverte", color: "#C7973E", hint: "Des questions simples pour briser la glace." },
  2: { label: "Complicité", color: "#C77B87", hint: "Un cran de profondeur en plus." },
  3: { label: "Connexion", color: "#7C8B6F", hint: "Les questions qui comptent vraiment." },
};

export const DEFAULT_LEVEL = 1;

export function levelMeta(level: number) {
  return LEVEL_META[level] ?? LEVEL_META[DEFAULT_LEVEL];
}
