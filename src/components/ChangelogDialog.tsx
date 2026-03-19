import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Download, Share2, Sparkles, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "ancora-changelog-seen";

type UpdateItem = { icon: string; title: string; description: string };
type AppUpdate = { version: string; title: string; items: UpdateItem[]; created_at: string };

const iconMap: Record<string, React.ElementType> = {
  download: Download,
  share: Share2,
  sparkles: Sparkles,
};

export function ChangelogDialog({ externalOpen, onExternalClose }: { externalOpen?: boolean; onExternalClose?: () => void }) {
  const [update, setUpdate] = useState<AppUpdate | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoOpen, setAutoOpen] = useState(false);

  const fetchLatest = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("app_updates")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    setLoading(false);

    if (data) {
      const parsed: AppUpdate = {
        version: data.version,
        title: data.title,
        items: data.items as unknown as UpdateItem[],
        created_at: data.created_at,
      };
      setUpdate(parsed);

      const seen = localStorage.getItem(STORAGE_KEY);
      if (seen !== parsed.version) {
        setAutoOpen(true);
      }
    }
  };

  useEffect(() => {
    fetchLatest();
  }, []);

  // Re-fetch when user clicks the button
  useEffect(() => {
    if (externalOpen) fetchLatest();
  }, [externalOpen]);

  const open = externalOpen || autoOpen;

  const handleClose = (value: boolean) => {
    if (!value && update) {
      localStorage.setItem(STORAGE_KEY, update.version);
      setAutoOpen(false);
      onExternalClose?.();
    }
  };

  if (!update) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="border-border bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-lg tracking-wider text-primary">
            <Sparkles className="h-5 w-5" />
            {update.title}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Versão {update.version} — Confira o que há de novo! ⚓
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Verificando atualizações...
            </div>
          )}
          {!loading && update.items.map((item, i) => {
            const Icon = iconMap[item.icon] || Sparkles;
            return (
              <div key={i} className="flex items-start gap-3 rounded-lg border border-border bg-secondary p-3">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="font-display text-sm font-bold tracking-wider text-foreground">{item.title}</p>
                  <p className="font-body text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
        <button
          onClick={() => handleClose(false)}
          className="w-full rounded-lg bg-primary px-4 py-2.5 font-display text-sm font-bold tracking-wider text-primary-foreground transition-all duration-200 hover:opacity-90"
        >
          Entendi, vamos lá! ⚓
        </button>
      </DialogContent>
    </Dialog>
  );
}
