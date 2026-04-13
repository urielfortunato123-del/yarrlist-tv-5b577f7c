import { useState, useMemo, useEffect } from "react";
import { categories } from "@/data/categories";
import CategoryCard from "@/components/CategoryCard";
import TvClock from "@/components/TvClock";
import { useFavorites } from "@/hooks/useFavorites";
import { useVisitCounter } from "@/hooks/useVisitCounter";
import { usePwaInstall, useShareApp } from "@/hooks/usePwaInstall";
import { useOnlineUsers } from "@/hooks/useOnlineUsers";
import { motion } from "framer-motion";
import { Anchor, Star, Search, Heart, Users, Download, Share2, RefreshCw, Radio } from "lucide-react";
import { ChangelogDialog } from "@/components/ChangelogDialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PixDonateDialog } from "@/components/PixDonateDialog";
import CastButton from "@/components/CastButton";

const Index = () => {
  const { favorites, toggleFavorite } = useFavorites();
  const [search, setSearch] = useState("");
  const [donateOpen, setDonateOpen] = useState(false);

  // Auto-open donate popup after 35 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setDonateOpen(true);
    }, 35000);
    return () => clearTimeout(timer);
  }, []);
  const visitCount = useVisitCounter();
  const onlineCount = useOnlineUsers();
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
      <footer className="glass-panel relative z-10 border-t border-border/50 px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              <span>{visitCount.toLocaleString("pt-BR")} acessos</span>
            </div>
            <span className="text-xs text-muted-foreground/50">•</span>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Radio className="h-3.5 w-3.5 text-green-500 animate-pulse" />
              <span>{onlineCount} online</span>
            </div>
            <span className="text-xs text-muted-foreground/50">•</span>
            <p className="text-xs text-muted-foreground">
              por Uriel da Fonseca Fortunato • v2.1
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

      <CastButton />
      <PixDonateDialog open={donateOpen} onOpenChange={setDonateOpen} visitCount={visitCount} />

      <ChangelogDialog externalOpen={changelogOpen} onExternalClose={() => setChangelogOpen(false)} />
    </div>
  );
};

export default Index;
