import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { useLanguage } from "@/hooks/use-language";
import { motion, AnimatePresence } from "framer-motion";

export function OfflineBanner() {
  const isOnline = useOnlineStatus();
  const { language } = useLanguage();

  const messages = {
    en: "You're offline. Don't worry, your data is saved locally!",
    fr: "Vous êtes hors ligne. Pas d'inquiétude, vos données sont sauvegardées localement!",
    mg: "Tsy misy connexion. Aza manahy, voatahiry eo an-toerana ny data-nao!"
  };

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-amber-950 py-2 px-4 flex items-center justify-center gap-2 text-sm font-medium shadow-lg"
        >
          <WifiOff className="w-4 h-4" />
          <span>{messages[language]}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
