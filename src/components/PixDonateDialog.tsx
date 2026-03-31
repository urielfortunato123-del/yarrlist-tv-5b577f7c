import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Heart, Copy, Check, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import pixQrCode from "@/assets/pix-qrcode.png";

const PIX_CODE = "00020126330014BR.GOV.BCB.PIX0111363848348715204000053039865802BR5901N6001C621205108ANCORATV630439EB";

const DONATION_VALUES = [
  { label: "Doar R$5", value: 5, highlight: false },
  { label: "Doar R$10", value: 10, highlight: true },
  { label: "Doar R$20", value: 20, highlight: false },
  { label: "Outro valor", value: 0, highlight: false },
];

interface PixDonateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visitCount: number;
  todayDonors?: number;
}

export function PixDonateDialog({ open, onOpenChange, visitCount, todayDonors = 0 }: PixDonateDialogProps) {
  const [copied, setCopied] = useState(false);
  const [thanked, setThanked] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(PIX_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDonate = (value: number) => {
    navigator.clipboard.writeText(PIX_CODE);
    if (value > 0) {
      setThanked(true);
      setTimeout(() => setThanked(false), 4000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-gradient-to-b from-card to-card/95 sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl tracking-wide text-primary">
            ❤️ Ajude a manter o Âncora TV vivo!
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-3 pt-2 text-sm leading-relaxed text-foreground/80">
              <p className="text-base font-semibold text-destructive">
                🚨 O Âncora TV depende da sua ajuda urgente para continuar funcionando!
              </p>
              <p>
                Sem doações fica muito difícil pagar o servidor e atualizar todos os dias os links de filmes, séries, animes, mangás, esportes ao vivo e torrents.
              </p>
              <p>
                Com <strong className="text-primary">R$5</strong> você ajuda a manter o app rodando por vários dias.
              </p>
              <p>
                Com <strong className="text-primary">R$10</strong> ou <strong className="text-primary">R$20</strong> ajuda a trazer links novos e mais rápidos todos os dias.
              </p>
              <p className="font-medium">
                Qualquer valor faz muita diferença!
              </p>
              <p>
                Contribua via Pix agora e faça parte dessa comunidade.
              </p>
              <p className="text-muted-foreground">
                Obrigado de coração por usar e apoiar o Âncora TV ❤️
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>

        {/* Donation buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          {DONATION_VALUES.map((d) => (
            <button
              key={d.label}
              onClick={() => handleDonate(d.value)}
              className={`rounded-2xl px-4 py-3 font-display text-sm font-bold transition-all duration-200 ${
                d.highlight
                  ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow)] hover:shadow-[var(--shadow-glow-hover)] scale-[1.02]"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Thank you message */}
        <AnimatePresence>
          {thanked && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-center text-sm font-medium text-primary"
            >
              Obrigado! Pix gerado/copiado. Sua ajuda faz toda a diferença ❤️
            </motion.div>
          )}
        </AnimatePresence>

        {/* QR Code */}
        <div className="flex flex-col items-center gap-3 pt-1">
          <div className="rounded-2xl border border-border bg-white p-4">
            <img src={pixQrCode} alt="QR Code PIX" className="h-72 w-72 object-contain" />
          </div>
        </div>

        {/* Pix copy-paste */}
        <div>
          <p className="mb-1 text-center font-body text-xs font-semibold text-muted-foreground">Pix Copia-e-cola:</p>
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-secondary p-2.5">
            <p className="flex-1 break-all text-center font-mono text-[10px] text-foreground">{PIX_CODE}</p>
            <button
              onClick={handleCopy}
              className="shrink-0 rounded-xl border border-border bg-card p-2 text-muted-foreground transition-colors hover:text-primary"
              title="Copiar código PIX"
            >
            {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          {copied && <p className="mt-1 text-center text-xs text-primary font-medium">Copiado!</p>}
        </div>

        {/* Footer stats */}
        <div className="flex flex-wrap items-center justify-center gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Heart className="h-3.5 w-3.5 text-primary" style={{ fill: "hsl(var(--primary))" }} />
            Hoje já ajudaram <strong className="text-primary">{todayDonors}</strong> pessoas
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            Total de acessos: <strong className="text-primary">{visitCount.toLocaleString("pt-BR")}</strong>
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
