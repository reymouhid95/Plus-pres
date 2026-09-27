/**
 * Design Tokens centralisés pour Plus Près V1
 * Source unique de vérité pour tous les tokens de design
 */

// ============================================
// COULEURS
// ============================================

export const colors = {
  // Primary - Bleu principal de la marque
  primary: {
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
    950: "#172554",
  },

  // Secondary - Rose/Or pour les accents émotionnels
  secondary: {
    50: "#fdf2f8",
    100: "#fce7f3",
    200: "#fbcfe8",
    300: "#f9a8d4",
    400: "#f472b6",
    500: "#ec4899",
    600: "#db2777",
    700: "#be185d",
    800: "#9d174d",
    900: "#831843",
  },

  // Accent - Or pour les moments spéciaux
  accent: {
    50: "#fffbeb",
    100: "#fef3c7",
    200: "#fde68a",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#f59e0b",
    600: "#d97706",
    700: "#b45309",
    800: "#92400e",
    900: "#78350f",
  },

  // Success - Vert pour les validations
  success: {
    50: "#f0fdf4",
    100: "#dcfce7",
    200: "#bbf7d0",
    300: "#86efac",
    400: "#4ade80",
    500: "#22c55e",
    600: "#16a34a",
    700: "#15803d",
    800: "#166534",
    900: "#14532d",
  },

  // Warning - Orange pour les avertissements
  warning: {
    50: "#fff7ed",
    100: "#ffedd5",
    200: "#fed7aa",
    300: "#fdba74",
    400: "#fb923c",
    500: "#f97316",
    600: "#ea580c",
    700: "#c2410c",
    800: "#9a340c",
    900: "#7c2d12",
  },

  // Error - Rouge pour les erreurs
  error: {
    50: "#fef2f2",
    100: "#fee2e2",
    200: "#fecaca",
    300: "#fca5a5",
    400: "#f87171",
    500: "#ef4444",
    600: "#dc2626",
    700: "#b91c1c",
    800: "#991b1b",
    900: "#7f1d1d",
  },

  // Neutres - Pour les surfaces et textes
  neutral: {
    0: "#ffffff",
    50: "#fafafa",
    100: "#f5f5f5",
    200: "#e5e5e5",
    300: "#d4d4d4",
    400: "#a3a3a3",
    500: "#737373",
    600: "#525252",
    700: "#404040",
    800: "#262626",
    900: "#171717",
    950: "#0a0a0a",
  },

  // Sémantiques - Pour utilisation directe dans les composants
  semantic: {
    // Backgrounds
    bg: {
      primary: "var(--color-bg-primary)",
      secondary: "var(--color-bg-secondary)",
      tertiary: "var(--color-bg-tertiary)",
      inverse: "var(--color-bg-inverse)",
    },
    // Text
    text: {
      primary: "var(--color-text-primary)",
      secondary: "var(--color-text-secondary)",
      muted: "var(--color-text-muted)",
      inverse: "var(--color-text-inverse)",
      link: "var(--color-link)",
    },
    // Borders
    border: {
      light: "var(--color-border-light)",
      medium: "var(--color-border-medium)",
      strong: "var(--color-border-strong)",
      focus: "var(--color-focus)",
    },
    // States
    state: {
      success: "var(--color-success)",
      warning: "var(--color-warning)",
      error: "var(--color-error)",
      info: "var(--color-info)",
    },
  },
} as const;

// ============================================
// ESPACEMENT
// ============================================

export const spacing = {
  0: "0",
  1: "0.25rem", // 4px
  2: "0.5rem", // 8px
  3: "0.75rem", // 12px
  4: "1rem", // 16px
  5: "1.25rem", // 20px
  6: "1.5rem", // 24px
  8: "2rem", // 32px
  10: "2.5rem", // 40px
  12: "3rem", // 48px
  16: "4rem", // 64px
  20: "5rem", // 80px
} as const;

// Alias sémantiques pour l'espacement
export const space = {
  none: spacing[0],
  xs: spacing[1], // 4px
  sm: spacing[2], // 8px
  md: spacing[3], // 12px
  lg: spacing[4], // 16px
  xl: spacing[5], // 20px
  "2xl": spacing[6], // 24px
  "3xl": spacing[8], // 32px
  "4xl": spacing[10], // 40px
  "5xl": spacing[12], // 48px
  "6xl": spacing[16], // 64px
} as const;

// ============================================
// RAYONS (BORDER RADIUS)
// ============================================

export const radius = {
  none: "0",
  sm: "0.25rem", // 4px
  md: "0.375rem", // 6px
  lg: "0.5rem", // 8px
  xl: "0.75rem", // 12px
  "2xl": "1rem", // 16px
  "3xl": "1.5rem", // 24px
  full: "9999px", // Pill / Circle
} as const;

// Alias sémantiques
export const rounded = {
  none: radius.none,
  sm: radius.sm,
  md: radius.md,
  lg: radius.lg,
  xl: radius.xl,
  "2xl": radius["2xl"],
  "3xl": radius["3xl"],
  pill: radius.full,
  circle: radius.full,
} as const;

// ============================================
// OMBRES
// ============================================

export const shadows = {
  none: "none",
  xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  sm: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
  inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",

  // Sémantiques
  card: "0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.08)",
  cardHover: "0 4px 12px 0 rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  modal: "0 25px 50px -12px rgb(0 0 0 / 0.25)",
  dropdown:
    "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  toast: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  glow: "0 0 20px rgb(59 130 246 / 0.3)",
  glowGold: "0 0 20px rgb(245 158 11 / 0.4)",
} as const;

// ============================================
// TYPOGRAPHIE
// ============================================

export const fontFamily = {
  sans: [
    "Inter",
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "sans-serif",
  ],
  display: ["Playfair Display", "Georgia", "serif"],
  mono: ["JetBrains Mono", "Fira Code", "monospace"],
} as const;

export const fontSize = {
  xs: ["0.75rem", { lineHeight: "1rem" }], // 12px / 16px
  sm: ["0.875rem", { lineHeight: "1.25rem" }], // 14px / 20px
  base: ["1rem", { lineHeight: "1.5rem" }], // 16px / 24px
  lg: ["1.125rem", { lineHeight: "1.75rem" }], // 18px / 28px
  xl: ["1.25rem", { lineHeight: "1.75rem" }], // 20px / 28px
  "2xl": ["1.5rem", { lineHeight: "2rem" }], // 24px / 32px
  "3xl": ["1.875rem", { lineHeight: "2.25rem" }], // 30px / 36px
  "4xl": ["2.25rem", { lineHeight: "2.5rem" }], // 36px / 40px
  "5xl": ["3rem", { lineHeight: "1" }], // 48px
  "6xl": ["3.75rem", { lineHeight: "1" }], // 60px
} as const;

// Échelle sémantique pour l'UI
export const textStyle = {
  // Display - Pour les titres d'écran principaux
  display: {
    xl: {
      fontFamily: fontFamily.display,
      fontSize: fontSize["5xl"][0],
      lineHeight: fontSize["5xl"][1].lineHeight,
      fontWeight: 700,
      letterSpacing: "-0.02em",
    },
    lg: {
      fontFamily: fontFamily.display,
      fontSize: fontSize["4xl"][0],
      lineHeight: fontSize["4xl"][1].lineHeight,
      fontWeight: 700,
      letterSpacing: "-0.02em",
    },
    md: {
      fontFamily: fontFamily.display,
      fontSize: fontSize["3xl"][0],
      lineHeight: fontSize["3xl"][1].lineHeight,
      fontWeight: 700,
      letterSpacing: "-0.02em",
    },
    sm: {
      fontFamily: fontFamily.display,
      fontSize: fontSize["2xl"][0],
      lineHeight: fontSize["2xl"][1].lineHeight,
      fontWeight: 600,
      letterSpacing: "-0.01em",
    },
  },

  // Heading - Pour les titres de section
  heading: {
    xl: {
      fontSize: fontSize["3xl"][0],
      lineHeight: fontSize["3xl"][1].lineHeight,
      fontWeight: 700,
    },
    lg: {
      fontSize: fontSize["2xl"][0],
      lineHeight: fontSize["2xl"][1].lineHeight,
      fontWeight: 700,
    },
    md: {
      fontSize: fontSize.xl[0],
      lineHeight: fontSize.xl[1].lineHeight,
      fontWeight: 600,
    },
    sm: {
      fontSize: fontSize.lg[0],
      lineHeight: fontSize.lg[1].lineHeight,
      fontWeight: 600,
    },
  },

  // Body - Pour le texte courant
  body: {
    lg: {
      fontSize: fontSize.lg[0],
      lineHeight: fontSize.lg[1].lineHeight,
      fontWeight: 400,
    },
    md: {
      fontSize: fontSize.base[0],
      lineHeight: fontSize.base[1].lineHeight,
      fontWeight: 400,
    },
    sm: {
      fontSize: fontSize.sm[0],
      lineHeight: fontSize.sm[1].lineHeight,
      fontWeight: 400,
    },
    xs: {
      fontSize: fontSize.xs[0],
      lineHeight: fontSize.xs[1].lineHeight,
      fontWeight: 400,
    },
  },

  // Labels et UI
  label: {
    lg: {
      fontSize: fontSize.sm[0],
      lineHeight: fontSize.sm[1].lineHeight,
      fontWeight: 600,
      letterSpacing: "0.02em",
    },
    md: {
      fontSize: fontSize.xs[0],
      lineHeight: fontSize.xs[1].lineHeight,
      fontWeight: 600,
      letterSpacing: "0.02em",
    },
    sm: {
      fontSize: "0.6875rem",
      lineHeight: "1rem",
      fontWeight: 600,
      letterSpacing: "0.03em",
    }, // 11px
  },

  // Code / Mono
  code: {
    sm: {
      fontFamily: fontFamily.mono,
      fontSize: fontSize.xs[0],
      lineHeight: fontSize.xs[1].lineHeight,
    },
    md: {
      fontFamily: fontFamily.mono,
      fontSize: fontSize.sm[0],
      lineHeight: fontSize.sm[1].lineHeight,
    },
  },
} as const;

// ============================================
// POIDS DE POLICE
// ============================================

export const fontWeight = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
} as const;

// ============================================
// HAUTEUR DE LIGNE
// ============================================

export const lineHeight = {
  none: 1,
  tight: 1.1,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
} as const;

// ============================================
// DURÉES D'ANIMATION
// ============================================

export const duration = {
  instant: "0ms",
  fast: "150ms", // Fast - transitions rapides
  normal: "250ms", // Normal - transitions standard
  emphasis: "400ms", // Emphasis - transitions importantes
  slow: "600ms", // Lent - entrées/sorties modales
} as const;

// ============================================
// COURBES D'ANIMATION (EASING)
// ============================================

export const easing = {
  linear: "linear",
  in: "cubic-bezier(0.4, 0, 1, 1)",
  out: "cubic-bezier(0, 0, 0.2, 1)",
  inOut: "cubic-bezier(0.4, 0, 0.2, 1)",

  // Courbes spécifiques
  spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  smooth: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  sharp: "cubic-bezier(0.4, 0, 0.6, 1)",
} as const;

// ============================================
// Z-INDEX
// ============================================

export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  modalBackdrop: 400,
  modal: 500,
  popover: 600,
  tooltip: 700,
  toast: 800,
  max: 9999,
} as const;

// ============================================
// BREAKPOINTS
// ============================================

export const breakpoints = {
  xs: "360px", // Petit mobile
  sm: "390px", // Mobile standard
  md: "414px", // Mobile large
  lg: "768px", // Tablette
  xl: "1024px", // Desktop
  "2xl": "1280px", // Large desktop
  "3xl": "1536px", // Ultra wide
} as const;

// Media queries helpers
export const mediaQuery = {
  xs: `@media (min-width: ${breakpoints.xs})`,
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  "2xl": `@media (min-width: ${breakpoints["2xl"]})`,
  "3xl": `@media (min-width: ${breakpoints["3xl"]})`,

  // Mobile only
  mobile: `@media (max-width: ${parseInt(breakpoints.lg) - 1}px)`,
  tablet: `@media (min-width: ${breakpoints.lg}) and (max-width: ${parseInt(breakpoints.xl) - 1}px)`,
  desktop: `@media (min-width: ${breakpoints.xl})`,
} as const;

// ============================================
// LARGEUR MAX CONTENU
// ============================================

export const maxWidth = {
  xs: "20rem", // 320px
  sm: "24rem", // 384px
  md: "28rem", // 448px
  lg: "32rem", // 512px
  xl: "36rem", // 576px
  "2xl": "42rem", // 672px
  "3xl": "48rem", // 768px
  "4xl": "56rem", // 896px
  "5xl": "64rem", // 1024px
  "6xl": "72rem", // 1152px
  "7xl": "80rem", // 1280px
  full: "100%",
  screen: "100vw",
} as const;

// Largeurs sémantiques pour les pages
export const containerWidth = {
  narrow: maxWidth["2xl"], // 672px - Lecture confortable
  normal: maxWidth["4xl"], // 896px - Standard
  wide: maxWidth["6xl"], // 1152px - Large
  full: maxWidth.full,
} as const;

// ============================================
// TAILLES ICÔNES
// ============================================

export const iconSize = {
  xs: "0.75rem", // 12px
  sm: "1rem", // 16px
  md: "1.25rem", // 20px
  lg: "1.5rem", // 24px
  xl: "2rem", // 32px
  "2xl": "3rem", // 48px
} as const;

// ============================================
// TRANSITIONS PRÉDÉFINIES
// ============================================

export const transitions = {
  // Transitions courantes
  all: `all ${duration.normal} ${easing.out}`,
  colors: `color ${duration.fast} ${easing.out}, background-color ${duration.fast} ${easing.out}, border-color ${duration.fast} ${easing.out}`,
  transform: `transform ${duration.normal} ${easing.out}`,
  opacity: `opacity ${duration.fast} ${easing.out}`,
  shadow: `box-shadow ${duration.normal} ${easing.out}`,

  // Composants
  button: `all ${duration.fast} ${easing.out}`,
  card: `all ${duration.normal} ${easing.out}`,
  modal: `all ${duration.emphasis} ${easing.out}`,
  toast: `all ${duration.normal} ${easing.out}`,
  tooltip: `all ${duration.fast} ${easing.out}`,
  dropdown: `all ${duration.fast} ${easing.out}`,
  tab: `all ${duration.fast} ${easing.out}`,
  input: `all ${duration.fast} ${easing.out}`,

  // États
  hover: `all ${duration.fast} ${easing.out}`,
  focus: `all ${duration.fast} ${easing.out}`,
  active: `all ${duration.instant} ${easing.linear}`,
} as const;

// ============================================
// TYPES TYPESCRIPT POUR LES TOKENS
// ============================================

export type ColorScale = typeof colors.primary;
export type SpacingScale = typeof spacing;
export type RadiusScale = typeof radius;
export type ShadowScale = typeof shadows;
export type DurationScale = typeof duration;
export type EasingScale = typeof easing;
export type ZIndexScale = typeof zIndex;
export type BreakpointScale = typeof breakpoints;
export type FontSizeScale = typeof fontSize;

// ============================================
// CSS VARIABLES GENERATOR
// ============================================

/**
 * Génère les variables CSS pour les tokens
 * À utiliser dans :root ou dans un fichier CSS global
 */
export function generateCSSVariables(): string {
  const lines: string[] = ["/* Design Tokens - Auto-generated */", ":root {"];

  // Colors
  Object.entries(colors.primary).forEach(([key, value]) => {
    lines.push(`  --color-primary-${key}: ${value};`);
  });
  Object.entries(colors.secondary).forEach(([key, value]) => {
    lines.push(`  --color-secondary-${key}: ${value};`);
  });
  Object.entries(colors.accent).forEach(([key, value]) => {
    lines.push(`  --color-accent-${key}: ${value};`);
  });
  Object.entries(colors.success).forEach(([key, value]) => {
    lines.push(`  --color-success-${key}: ${value};`);
  });
  Object.entries(colors.warning).forEach(([key, value]) => {
    lines.push(`  --color-warning-${key}: ${value};`);
  });
  Object.entries(colors.error).forEach(([key, value]) => {
    lines.push(`  --color-error-${key}: ${value};`);
  });
  Object.entries(colors.neutral).forEach(([key, value]) => {
    lines.push(`  --color-neutral-${key}: ${value};`);
  });

  // Semantic colors
  lines.push("  --color-bg-primary: var(--color-neutral-0);");
  lines.push("  --color-bg-secondary: var(--color-neutral-50);");
  lines.push("  --color-bg-tertiary: var(--color-neutral-100);");
  lines.push("  --color-bg-inverse: var(--color-neutral-900);");

  lines.push("  --color-text-primary: var(--color-neutral-900);");
  lines.push("  --color-text-secondary: var(--color-neutral-600);");
  lines.push("  --color-text-muted: var(--color-neutral-400);");
  lines.push("  --color-text-inverse: var(--color-neutral-0);");
  lines.push("  --color-link: var(--color-primary-600);");

  lines.push("  --color-border-light: var(--color-neutral-200);");
  lines.push("  --color-border-medium: var(--color-neutral-300);");
  lines.push("  --color-border-strong: var(--color-neutral-400);");
  lines.push("  --color-focus: var(--color-primary-500);");

  lines.push("  --color-success: var(--color-success-500);");
  lines.push("  --color-warning: var(--color-warning-500);");
  lines.push("  --color-error: var(--color-error-500);");
  lines.push("  --color-info: var(--color-primary-500);");

  // Spacing
  Object.entries(spacing).forEach(([key, value]) => {
    lines.push(`  --space-${key}: ${value};`);
  });

  // Radius
  Object.entries(radius).forEach(([key, value]) => {
    lines.push(`  --radius-${key}: ${value};`);
  });

  // Shadows
  Object.entries(shadows).forEach(([key, value]) => {
    lines.push(`  --shadow-${key}: ${value};`);
  });

  // Font sizes
  Object.entries(fontSize).forEach(([key, value]) => {
    lines.push(`  --font-size-${key}: ${value[0]};`);
    lines.push(`  --leading-${key}: ${value[1].lineHeight};`);
  });

  // Duration
  Object.entries(duration).forEach(([key, value]) => {
    lines.push(`  --duration-${key}: ${value};`);
  });

  // Easing
  Object.entries(easing).forEach(([key, value]) => {
    lines.push(`  --easing-${key}: ${value};`);
  });

  // Z-index
  Object.entries(zIndex).forEach(([key, value]) => {
    lines.push(`  --z-${key}: ${value};`);
  });

  // Breakpoints (as px values)
  Object.entries(breakpoints).forEach(([key, value]) => {
    lines.push(`  --breakpoint-${key}: ${value};`);
  });

  // Radius
  Object.entries(radius).forEach(([key, value]) => {
    lines.push(`  --radius-${key}: ${value};`);
  });

  // Z-index
  Object.entries(zIndex).forEach(([key, value]) => {
    lines.push(`  --z-${key}: ${value};`);
  });

  lines.push("}");

  // Dark mode support
  lines.push("");
  lines.push("@media (prefers-color-scheme: dark) {");
  lines.push("  :root {");
  lines.push("    --color-bg-primary: var(--color-neutral-950);");
  lines.push("    --color-bg-secondary: var(--color-neutral-900);");
  lines.push("    --color-bg-tertiary: var(--color-neutral-800);");
  lines.push("    --color-bg-inverse: var(--color-neutral-0);");
  lines.push("    --color-text-primary: var(--color-neutral-0);");
  lines.push("    --color-text-secondary: var(--color-neutral-400);");
  lines.push("    --color-text-muted: var(--color-neutral-500);");
  lines.push("    --color-text-inverse: var(--color-neutral-900);");
  lines.push("    --color-border-light: var(--color-neutral-700);");
  lines.push("    --color-border-medium: var(--color-neutral-600);");
  lines.push("    --color-border-strong: var(--color-neutral-500);");
  lines.push("  }");
  lines.push("}");

  return lines.join("\n");
}

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

const designTokens = {
  colors,
  spacing,
  space,
  radius,
  rounded,
  shadows,
  fontFamily,
  fontSize,
  textStyle,
  fontWeight,
  lineHeight,
  duration,
  easing,
  zIndex,
  breakpoints,
  mediaQuery,
  maxWidth,
  containerWidth,
  iconSize,
  transitions,
  generateCSSVariables,
} as const;

export default designTokens;
export type DesignTokens = typeof designTokens;
