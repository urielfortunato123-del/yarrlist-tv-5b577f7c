import { useState } from "react";
import { Monitor } from "lucide-react";
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

const startCast = () => {
  const context = window.cast?.framework.CastContext.getInstance();
  if (!context) return;

  context.setOptions({
    receiverApplicationId: window.chrome!.cast!.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
    autoJoinPolicy: window.chrome!.cast!.AutoJoinPolicy.ORIGIN_SCOPED,
  });

  const session = context.getCurrentSession();
  if (!session) {
    alert("📡 Conecte-se a um Chromecast ou TV compatível primeiro.");
    return;
  }

  const mediaInfo = new (window.chrome!.cast!.media.MediaInfo as new (u: string, t: string) => unknown)(
    window.location.href,
    "text/html"
  );
  const request = new (window.chrome!.cast!.media.LoadRequest as new (m: unknown) => unknown)(mediaInfo);

  session.loadMedia(request)
    .then(() => console.log("Transmitindo..."))
    .catch((err: unknown) => console.error("Erro:", err));
};

const openMirroring = () => {
  alert(
    "📺 Sua TV não suporta transmissão direta.\n\nUse o espelhamento de tela:\n• Smart View\n• SmartThings\n• Ou transmitir do celular."
  );
};

const CastButton = () => {
  const [hovered, setHovered] = useState(false);

  const handleClick = () => {
    if (isSamsungTV()) {
      openMirroring();
    } else if (hasCast()) {
      startCast();
    } else {
      openMirroring();
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      className="flex items-center gap-2 rounded-xl bg-destructive/10 px-3 py-1.5 font-body text-xs font-semibold text-destructive transition-all hover:bg-destructive/20 hover:shadow-lg"
    >
      <Monitor className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">Assistir na TV</span>
      <AnimatePresence>
        {hovered && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            className="text-[10px] sm:hidden"
          >
            TV
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default CastButton;
