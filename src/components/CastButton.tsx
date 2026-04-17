import { useState } from "react";
import { Monitor, X, Tv, Smartphone, BookOpen, Copy, Check, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TUTORIALS: Record<string, { title: string; steps: string[] }> = {
  Samsung: {
    title: "Samsung",
    steps: [
      "Conecte o celular e a TV na mesma rede Wi-Fi.",
      "Na TV, abra o app SmartThings ou ative 'Smart View'.",
      "No celular, deslize o painel rápido e toque em 'Smart View'.",
      "Selecione sua TV Samsung na lista e confirme.",
      "Abra o site Âncora TV no celular — a tela aparecerá na TV.",
    ],
  },
  LG: {
    title: "LG",
    steps: [
      "Conecte o celular e a TV LG na mesma rede Wi-Fi.",
      "Na TV, abra 'Screen Share' (botão Home → Screen Share).",
      "No celular Android, abra o painel rápido → 'Transmitir tela' (Cast).",
      "Selecione sua TV LG na lista de dispositivos.",
      "Aguarde a conexão e abra o Âncora TV no celular.",
    ],
  },
  Roku: {
    title: "Roku",
    steps: [
      "Na TV Roku, vá em Configurações → Sistema → Espelhamento de tela.",
      "Ative o modo 'Solicitar' ou 'Sempre permitir'.",
      "No celular Android, abra o painel rápido → 'Transmitir tela'.",
      "Escolha seu dispositivo Roku e aceite na TV.",
      "Abra o Âncora TV — a tela será espelhada.",
    ],
  },
};

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

  const [showMirrorTip, setShowMirrorTip] = useState(false);
  const [tutorial, setTutorial] = useState<keyof typeof TUTORIALS | null>(null);
  const [copied, setCopied] = useState(false);

  const handleMirror = () => {
    setShowMirrorTip(true);
  };

  const closeAll = () => {
    setOpen(false);
    setShowMirrorTip(false);
    setTutorial(null);
    setCopied(false);
  };

  const copyTutorial = async () => {
    if (!tutorial) return;
    const t = TUTORIALS[tutorial];
    const text = `Como espelhar no ${t.title}:\n\n${t.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const mirrorMsg = isSamsungTV()
    ? "Use Smart View ou SmartThings para espelhar na sua TV Samsung."
    : "Use a função 'Transmitir tela' do seu celular (no menu rápido ou em Configurações).";

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-glow-hover)] animate-[pulse-glow_2s_cubic-bezier(0.4,0,0.6,1)_infinite]"
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
            onClick={closeAll}
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
                onClick={closeAll}
                className="absolute top-3 right-3 rounded-full p-1.5 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>

              {tutorial ? (
                <>
                  <div className="mb-4 flex items-center gap-2">
                    <button
                      onClick={() => { setTutorial(null); setCopied(false); }}
                      className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      aria-label="Voltar"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <h3 className="font-display text-base font-bold text-foreground">
                      Espelhar em {TUTORIALS[tutorial].title}
                    </h3>
                  </div>

                  <ol className="mb-4 space-y-2">
                    {TUTORIALS[tutorial].steps.map((step, i) => (
                      <li key={i} className="flex gap-2 font-body text-xs text-foreground">
                        <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
                          {i + 1}
                        </span>
                        <span className="leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>

                  <button
                    onClick={copyTutorial}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-body text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copiado!" : "Copiar instruções"}
                  </button>
                </>
              ) : (
                <>
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

                  {showMirrorTip && (
                    <div className="mb-3 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2.5 text-center font-body text-xs text-foreground">
                      📺 {mirrorMsg}
                    </div>
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

                    <div className="mt-2 border-t border-border pt-3">
                      <p className="mb-2 text-center font-body text-[11px] uppercase tracking-wider text-muted-foreground">
                        Tutoriais por TV
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {(Object.keys(TUTORIALS) as Array<keyof typeof TUTORIALS>).map((key) => (
                          <button
                            key={key}
                            onClick={() => setTutorial(key)}
                            className="flex flex-col items-center gap-1 rounded-xl border border-border bg-secondary/50 px-2 py-2.5 font-body text-xs font-medium text-secondary-foreground transition-all hover:bg-accent hover:text-accent-foreground"
                          >
                            <BookOpen className="h-3.5 w-3.5" />
                            {TUTORIALS[key].title}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CastButton;
