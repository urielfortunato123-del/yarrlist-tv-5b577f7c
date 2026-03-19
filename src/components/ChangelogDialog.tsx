import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Download, Share2, Sparkles } from "lucide-react";

const CHANGELOG_VERSION = "1.1.0";
const STORAGE_KEY = "ancora-changelog-seen";

export function ChangelogDialog() {
  const seen = localStorage.getItem(STORAGE_KEY);
  const [open, setOpen] = useState(seen !== CHANGELOG_VERSION);

  const handleClose = (value: boolean) => {
    if (!value) {
      localStorage.setItem(STORAGE_KEY, CHANGELOG_VERSION);
    }
    setOpen(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="border-border bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-lg tracking-wider text-primary">
            <Sparkles className="h-5 w-5" />
            Novidades do Âncora TV!
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Confira o que há de novo nesta atualização ⚓
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex items-start gap-3 rounded-lg border border-border bg-secondary p-3">
            <Download className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="font-display text-sm font-bold tracking-wider text-foreground">Instale no Celular</p>
              <p className="font-body text-xs text-muted-foreground">
                Agora você pode instalar o Âncora TV direto no seu celular como um app! Basta clicar em "Instalar App" no rodapé.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-border bg-secondary p-3">
            <Share2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="font-display text-sm font-bold tracking-wider text-foreground">Compartilhe com Amigos</p>
              <p className="font-body text-xs text-muted-foreground">
                Use o botão "Compartilhar" no rodapé para enviar o Âncora TV para seus amigos via WhatsApp, Telegram e mais!
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-border bg-secondary p-3">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="font-display text-sm font-bold tracking-wider text-foreground">Novo Nome</p>
              <p className="font-body text-xs text-muted-foreground">
                O app agora se chama Âncora TV! Mesmo conteúdo, nova identidade. ⚓
              </p>
            </div>
          </div>
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
