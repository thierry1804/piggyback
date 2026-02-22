import { useSettings } from "./use-settings";
import { getTranslation, type Language, type Translations } from "@/lib/i18n";

export function useLanguage(): {
  language: Language;
  t: Translations;
} {
  const { data: settings } = useSettings();
  const language = settings?.language || "en";
  const t = getTranslation(language);
  
  return { language, t };
}
