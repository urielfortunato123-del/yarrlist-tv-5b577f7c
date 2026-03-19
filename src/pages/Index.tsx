import { useState, useMemo } from "react";
import { categories } from "@/data/categories";
import CategoryCard from "@/components/CategoryCard";
import TvClock from "@/components/TvClock";
import { useFavorites } from "@/hooks/useFavorites";
import { useVisitCounter } from "@/hooks/useVisitCounter";
import { usePwaInstall, useShareApp } from "@/hooks/usePwaInstall";
import { motion } from "framer-motion";
import { Anchor, Star, Search, Heart, Users, Copy, Check, Download, Share2, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import pixQrCode from "@/assets/pix-qrcode.png";
import { ChangelogDialog } from "@/components/ChangelogDialog";
import { ThemeToggle } from "@/components/ThemeToggle";

const PIX_CODE = "00020126330014BR.GOV.BCB.PIX01113638483487152040000530398654041.005802BR5901N6001C62140510YARRLISTTV63045AC";

const PixDonateContent = ({ visitCount }: { visitCount: number }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(PIX_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="rounded-2xl border border-border bg-white p-3">
        <img src={pixQrCode} alt="QR Code PIX" className="h-48 w-48 object-contain" />
      </div>
      <p className="text-center font-body text-sm text-muted-foreground">
        Escaneie o QR Code acima com seu app de banco para contribuir via PIX.
      </p>
      <div className="w-full">
        <p className="mb-1 text-center font-body text-xs font-semibold text-muted-foreground">Pix Copia-e-cola:</p>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary p-2">
          <p className="flex-1 break-all text-center font-mono text-[10px] text-foreground">{PIX_CODE}</p>
          <button
            onClick={handleCopy}
            className="shrink-0 rounded-lg border border-border bg-card p-1.5 text-muted-foreground transition-colors hover:text-primary"
            title="Copiar código PIX"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
        {copied && <p className="mt-1 text-center text-xs text-emerald-400">Copiado!</p>}
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Users className="h-4 w-4" />
        <span>Já são <strong className="text-primary">{visitCount.toLocaleString("pt-BR")}</strong> acessos!</span>
      </div>
    </div>
  );
};

const Index = () => {
  const { favorites, toggleFavorite } = useFavorites();
  const [search, setSearch] = useState("");
  const [donateOpen, setDonateOpen] = useState(true);
  const visitCount = useVisitCounter();
  const { canInstall, install } = usePwaInstall();
  const { canShare, share } = useShareApp();
  const [changelogOpen, setChangelogOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [search]);

  const favCategories = filtered.filter((c) => favorites.includes(c.id));
  const otherCategories = filtered.filter((c) => !favorites.includes(c.id));

  return (
    <div className="relative flex min-h-screen flex-col bg-wallpaper">
      {/* Overlay for readability */}
      <div className="pointer-events-none fixed inset-0 bg-background/70" />

      {/* Top bar */}
      <div className="glass-panel sticky top-0 z-30 border-b border-border/50 px-4 py-3 sm:px-6">
        <div className="relative z-10 mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Anchor className="h-6 w-6 text-primary" />
            <h1 className="font-display text-lg font-bold tracking-wide text-gradient-gold sm:text-xl">
              ÂNCORA TV
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setChangelogOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-secondary px-3 py-1.5 font-body text-xs font-medium text-muted-foreground transition-all hover:text-foreground"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Novidades</span>
            </button>
            <TvClock />
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 sm:px-6 sm:py-8">
        {/* Donate Banner */}
        <motion.button
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setDonateOpen(true)}
          className="mb-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 font-body text-sm font-medium text-primary transition-all duration-200 hover:bg-primary/10 hover:shadow-[var(--shadow-glow)]"
        >
          <Heart className="h-4 w-4" style={{ fill: "hsl(var(--primary))" }} />
          Ajude a manter o app — Contribua com R$1 ⚓
        </motion.button>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative mx-auto max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value.slice(0, 50))}
              placeholder="Buscar categoria..."
              className="w-full rounded-2xl border border-border bg-card/50 py-3 pl-11 pr-4 font-body text-sm text-foreground placeholder:text-muted-foreground outline-none backdrop-blur-sm transition-all duration-200 focus:border-primary/50 focus:bg-card"
            />
          </div>
        </motion.div>

        {/* Favorites Section */}
        {favCategories.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-4 w-4 text-primary" style={{ fill: "hsl(var(--primary))" }} />
              <h2 className="font-display text-base font-semibold tracking-wide text-foreground">
                Favoritos
              </h2>
            </div>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 xl:gap-4">
              {favCategories.map((cat, i) => (
                <CategoryCard
                  key={cat.id}
                  category={cat}
                  index={i}
                  isFavorite
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          </section>
        )}

        {/* All Categories */}
        <section className="flex-1">
          {favCategories.length > 0 && (
            <h2 className="font-display text-base font-semibold tracking-wide text-muted-foreground mb-4">
              Todas as categorias
            </h2>
          )}
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 xl:gap-4">
            {otherCategories.map((cat, i) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                index={i}
                isFavorite={false}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="glass-panel border-t border-border/50 px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              <span>{visitCount.toLocaleString("pt-BR")} acessos</span>
            </div>
            <span className="text-xs text-muted-foreground/50">•</span>
            <p className="text-xs text-muted-foreground">
              por Uriel da Fonseca Fortunato
            </p>
          </div>
          <div className="flex items-center gap-2">
            {canInstall && (
              <button
                onClick={install}
                className="flex items-center gap-1.5 rounded-xl bg-secondary px-3 py-1.5 font-body text-xs font-medium text-muted-foreground transition-all hover:text-foreground"
              >
                <Download className="h-3.5 w-3.5" />
                Instalar
              </button>
            )}
            {canShare && (
              <button
                onClick={share}
                className="flex items-center gap-1.5 rounded-xl bg-secondary px-3 py-1.5 font-body text-xs font-medium text-muted-foreground transition-all hover:text-foreground"
              >
                <Share2 className="h-3.5 w-3.5" />
                Compartilhar
              </button>
            )}
            <button
              onClick={() => setDonateOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-1.5 font-body text-xs font-medium text-primary transition-all hover:bg-primary/20"
            >
              <Heart className="h-3.5 w-3.5" style={{ fill: "hsl(var(--primary))" }} />
              Doar
            </button>
          </div>
        </div>
      </footer>

      {/* Donate Dialog */}
      <Dialog open={donateOpen} onOpenChange={setDonateOpen}>
        <DialogContent className="border-border bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display text-lg tracking-wide text-primary">
              <Heart className="h-5 w-5" style={{ fill: "hsl(var(--primary))" }} />
              Ajude o Desenvolvedor
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Ajude a manter o Âncora TV funcionando! Com apenas R$1 você já faz a diferença. Contribua via PIX! ⚓
            </DialogDescription>
          </DialogHeader>
          <PixDonateContent visitCount={visitCount} />
        </DialogContent>
      </Dialog>

      <ChangelogDialog externalOpen={changelogOpen} onExternalClose={() => setChangelogOpen(false)} />
    </div>
  );
};

export default Index;
