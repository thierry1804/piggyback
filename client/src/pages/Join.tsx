import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { acceptInvitation } from "@/lib/supabase";
import { useLanguage } from "@/hooks/use-language";
import { useQueryClient } from "@tanstack/react-query";

export default function Join() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (!token) {
      setStatus("error");
      setErrorMessage("Missing invitation token");
      return;
    }
    acceptInvitation(token)
      .then(() => {
        setStatus("success");
        queryClient.invalidateQueries({ queryKey: ["goals"] });
        queryClient.invalidateQueries({ queryKey: ["settings"] });
        queryClient.invalidateQueries({ queryKey: ["groupRole"] });
        queryClient.invalidateQueries({ queryKey: ["myGroupId"] });
        setTimeout(() => setLocation("/app"), 1500);
      })
      .catch((err) => {
        setStatus("error");
        setErrorMessage(err instanceof Error ? err.message : String(err));
      });
  }, [queryClient, setLocation]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Joining group...</p>
      </div>
    );
  }
  if (status === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <p className="text-destructive font-medium">{errorMessage}</p>
        <button
          onClick={() => setLocation("/app")}
          className="px-4 py-2 rounded-xl bg-primary text-white font-medium"
        >
          {t.settings.backToDashboard}
        </button>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
      <CheckCircle className="w-12 h-12 text-emerald-500" />
      <p className="text-foreground font-medium">You joined the group.</p>
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  );
}
