import { useState } from "react";
import { Monitor, X, Tv, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

declare global {
  interface Window {
    chrome?: {
      cast?: {
        media: {
          DEFAULT_MEDIA_RECEIVER_APP_ID: string;
          MediaInfo: new (url: string, contentType: string) => unknown;
          LoadRequest: new (mediaInfo: unknown) => unknown;
        };
        AutoJoinPolicy: { ORIGIN_SCOPED: string };
      };
    };
    cast?: {
      framework: {
        CastContext: {
          getInstance: () => {
            setOptions: (opts: Record<string, unknown>) => void;
            getCurrentSession: () => {
              loadMedia: (req: unknown) => Promise<void>;
            } | null;
          };
        };
      };
    };
  }
}

const isSamsungTV = () => /Samsung|Tizen/i.test(navigator.userAgent);
const hasCast = () => !!(window.chrome?.cast);

const CastButton = () => {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleCast = () => {
    if (!hasCast()) {
      handleMirror();
      return;
    }

    const context = window.cast?.framework.CastContext.getInstance();
    if (!context) return;

    context.setOptions({
      receiverApplicationId: window.chrome!.cast!.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
      autoJoinPolicy: window.chrome!.cast!.AutoJoinPolicy.ORIGIN_SCOPED,
    });

    const session = context.getCurrentSession();
    if (!session) {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
      return;
    }

    const mediaInfo = new (window.chrome!.cast!.media.MediaInfo as new (u: string, t: string) => unknown)(
      window.location.href,
      "text/html"
    );
    const request = new (window.chrome!.cast!.media.LoadRequest as new (m: unknown) => unknown)(mediaInfo);

    session.loadMedia(request)
      .then(() => {
        setStatus("success");
        setTimeout(() => { setStatus("idle"); setOpen(false); }, 2000);
      })
      .catch(() => {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 3000);
      });
  };

  const handleMirror = () => {
    setOpen(false);
    const msg = isSamsungTV()
      ? "Use Smart View ou SmartThings para espelhar na sua TV Samsung."
      : "Use a função 'Transmitir tela' do seu celular.";
    alert(`📺 ${msg}`);
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-glow-hover)]"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Assistir na TV"
      >
        <Monitor className="h-6 w-6" />
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative mx-4 w-full max-w-xs rounded-2xl border border-border bg-card p-6 shadow-2xl"
            >
              <button
                onClick={() => setOpen(false)}
                className="absolute top-3 right-3 rounded-full p-1.5 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="mb-5 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Tv className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground">Assistir na TV</h3>
                <p className="mt-1 font-body text-xs text-muted-foreground">
                  Escolha como transmitir
                </p>
              </div>

              {status === "error" && (
                <p className="mb-3 rounded-xl bg-destructive/10 px-3 py-2 text-center font-body text-xs text-destructive">
                  Conecte a um Chromecast ou TV compatível primeiro.
                </p>
              )}

              {status === "success" && (
                <p className="mb-3 rounded-xl bg-primary/10 px-3 py-2 text-center font-body text-xs text-primary">
                  ✅ Transmitindo!
                </p>
              )}

              <div className="flex flex-col gap-2.5">
                <button
                  onClick={handleCast}
                  className="flex items-center gap-3 rounded-xl bg-primary px-4 py-3 font-body text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
                >
                  <Tv className="h-4 w-4" />
                  Transmitir (Chromecast)
                </button>
                <button
                  onClick={handleMirror}
                  className="flex items-center gap-3 rounded-xl border border-border bg-secondary px-4 py-3 font-body text-sm font-medium text-secondary-foreground transition-all hover:bg-accent hover:text-accent-foreground"
                >
                  <Smartphone className="h-4 w-4" />
                  Espelhar tela
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CastButton;
