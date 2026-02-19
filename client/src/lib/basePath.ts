/**
 * Base path de l'app (vide à la racine, ex. "/piggyback" en sous-dossier).
 * Dérivé à partir de l'URL du script d'entrée pour que le même build
 * fonctionne à la racine (/) ou dans un sous-dossier (/piggyback/).
 */
let cached: string | null = null;

export function getBasePath(): string {
  if (cached !== null) return cached;
  if (typeof document === "undefined") {
    cached = "";
    return "";
  }
  try {
    const script = document.querySelector('script[type="module"][src]');
    const src = script?.getAttribute("src");
    if (!src) {
      cached = "";
      return "";
    }
    const pathname = new URL(src, document.baseURI).pathname;
    // ex. /assets/index-xxx.js ou /piggyback/assets/index-xxx.js
    const dir = pathname.substring(0, pathname.lastIndexOf("/"));
    const base = dir.substring(0, dir.lastIndexOf("/"));
    cached = base || "";
    return cached;
  } catch {
    cached = "";
    return "";
  }
}

/** Préfixe pour les URLs (ex. "" ou "/piggyback") — toujours suivi de / pour les chemins. */
export function getBasePathPrefix(): string {
  const base = getBasePath();
  return base ? `${base}/` : "";
}
