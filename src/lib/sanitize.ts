import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitize HTML content to prevent XSS
 * Utilise DOMPurify côté serveur (isomorphic-dompurify)
 */
export function sanitizeHtml(input: string): string {
  if (!input) return "";
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "p", "br", "span"],
    ALLOWED_ATTR: [],
  });
}

/**
 * Sanitize plain text input (strip HTML tags, escape special chars)
 * Pour les champs de texte simples (pseudo, titre, contenu)
 */
export function sanitizeText(input: string): string {
  if (!input) return "";
  return input
    .replace(/[<>]/g, "") // Supprime < et >
    .replace(/javascript:/gi, "") // Supprime javascript:
    .replace(/on\w+=/gi, "") // Supprime on*= (event handlers)
    .trim()
    .slice(0, 1000); // Limite de longueur
}

/**
 * Sanitize user input for safe display
 * Version stricte pour les contenus affichés dans l'UI
 */
export function sanitizeForDisplay(input: string): string {
  if (!input) return "";
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  }).trim();
}

/**
 * Sanitize filename for safe storage
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return "file";
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 255);
}

/**
 * Validate and sanitize URL
 */
export function sanitizeUrl(url: string): string {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    // N'autoriser que http et https
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return "";
    }
    return parsed.toString();
  } catch {
    return "";
  }
}