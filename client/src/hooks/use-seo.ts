import { useEffect } from 'react';
import { useLanguage } from './use-language';
import type { Language } from '@/lib/i18n';

/**
 * Mapping des codes de langue vers les locales Open Graph
 */
const localeMap: Record<Language, string> = {
  en: 'en_US',
  fr: 'fr_FR',
  mg: 'mg_MG',
};

/**
 * Met à jour un meta tag avec l'attribut name
 */
function updateMetaTag(name: string, content: string): void {
  let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', name);
    document.head.appendChild(meta);
  }
  
  meta.setAttribute('content', content);
}

/**
 * Met à jour un meta tag avec l'attribut property (pour Open Graph)
 */
function updateMetaProperty(property: string, content: string): void {
  let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
  
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('property', property);
    document.head.appendChild(meta);
  }
  
  meta.setAttribute('content', content);
}

/**
 * Hook pour mettre à jour dynamiquement les meta tags SEO selon la langue
 * 
 * Ce hook met à jour :
 * - Le title de la page
 * - Les meta description et keywords
 * - Les balises Open Graph (og:title, og:description, og:locale)
 * - Les balises Twitter Card (twitter:title, twitter:description)
 * - L'attribut lang du document HTML
 */
export function useSEO(): void {
  const { t, language } = useLanguage();

  useEffect(() => {
    // Mettre à jour le title de la page
    document.title = t.seo.title;

    // Mettre à jour l'attribut lang du document HTML
    document.documentElement.lang = language;

    // Mettre à jour les meta tags standards
    updateMetaTag('description', t.seo.description);
    updateMetaTag('keywords', t.seo.keywords);

    // Mettre à jour les balises Open Graph
    updateMetaProperty('og:title', t.seo.ogTitle);
    updateMetaProperty('og:description', t.seo.ogDescription);
    updateMetaProperty('og:locale', localeMap[language]);

    // Mettre à jour les balises Twitter Card
    updateMetaTag('twitter:title', t.seo.twitterTitle);
    updateMetaTag('twitter:description', t.seo.twitterDescription);

    console.log('[useSEO] Meta tags updated for language:', language);
  }, [t, language]);
}
