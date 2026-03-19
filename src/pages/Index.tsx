import { useState, useMemo } from "react";
import { categories } from "@/data/categories";
import CategoryCard from "@/components/CategoryCard";
import TvClock from "@/components/TvClock";
import { useFavorites } from "@/hooks/useFavorites";
import { useVisitCounter } from "@/hooks/useVisitCounter";
import { motion } from "framer-motion";
import { Anchor, Star, Search, Heart, Users, Copy, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import pixQrCode from "@/assets/pix-qrcode.png";

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
      <div className="rounded-xl border-2 border-border bg-white p-3">
        <img src={pixQrCode} alt="QR Code PIX" className="h-48 w-48 object-contain" />
      </div>
      <p className="text-center font-body text-sm text-muted-foreground">
        Escaneie o QR Code acima com seu app de banco para contribuir via PIX.
      </p>
      <div className="w-full">
        <p className="mb-1 text-center font-body text-xs font-semibold text-muted-foreground">Pix Copia-e-cola:</p>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary p-2">
          <p className="flex-1 break-all text-center font-mono text-[10px] text-foreground">{PIX_CODE}</p>
          <button
            onClick={handleCopy}
            className="shrink-0 rounded-md border border-border bg-card p-1.5 text-muted-foreground transition-colors hover:text-primary"
            title="Copiar código PIX"
          >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
        {copied && <p className="mt-1 text-center text-xs text-green-500">Copiado!</p>}
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Users className="h-4 w-4" />
        <span>Já são <strong className="text-primary">{visitCount.toLocaleString("pt-BR")}</strong> acessos!</span>
      </div>
    </div>
  );
};

const Index = () => {
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const [search, setSearch] = useState("");
  const [donateOpen, setDonateOpen] = useState(true);
  const visitCount = useVisitCounter();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [search]);

  const favCategories = filtered.filter((c) => favorites.includes(c.id));
  const otherCategories = filtered.filter((c) => !favorites.includes(c.id));

  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-6 py-10 xl:py-16">
      {/* Donate Banner */}
      <button
        onClick={() => setDonateOpen(true)}
        className="mb-6 flex w-full max-w-5xl items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 font-display text-sm font-bold tracking-wider text-primary transition-all duration-200 hover:bg-primary/20 hover:shadow-[var(--shadow-glow)]"
      >
        <Heart className="h-5 w-5" style={{ fill: "hsl(var(--primary))" }} />
        Ajude a manter o app — Contribua com R$1 ⚓
      </button>

      {/* Clock */}
      <div className="mb-8 w-full max-w-5xl flex justify-end">
        <TvClock />
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-10 flex flex-col items-center gap-3 xl:mb-14"
      >
        <div className="flex items-center gap-3">
          <Anchor className="h-8 w-8 text-primary xl:h-10 xl:w-10" />
          <h1 className="font-display text-3xl font-black tracking-widest text-gradient-gold xl:text-5xl">
            YARRLIST TV
          </h1>
        </div>
        <p className="font-body text-sm text-muted-foreground xl:text-base">
          Ahoy, Mateys! Selecione uma categoria. Pressione <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 font-display text-xs text-foreground">F</kbd> para favoritar.
        </p>
      </motion.header>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-md mb-8"
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value.slice(0, 50))}
            placeholder="Buscar categoria..."
            className="w-full rounded-lg border-2 border-border bg-card py-3 pl-12 pr-4 font-body text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors duration-200 focus:border-primary"
          />
        </div>
      </motion.div>
      {/* Favorites Section */}
      {favCategories.length > 0 && (
        <section className="w-full max-w-5xl mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-primary" style={{ fill: "hsl(var(--primary))" }} />
            <h2 className="font-display text-lg font-bold tracking-wider text-foreground xl:text-xl">
              Favoritos
            </h2>
          </div>
          <div className="grid w-full grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 xl:gap-6">
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
      <section className="w-full max-w-5xl">
        {favCategories.length > 0 && (
          <h2 className="font-display text-lg font-bold tracking-wider text-muted-foreground mb-4 xl:text-xl">
            Todas as categorias
          </h2>
        )}
        <div className="grid w-full grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 xl:gap-6">
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

      {/* Footer */}
      <footer className="mt-12 flex flex-col items-center gap-3 text-center xl:mt-16">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{visitCount.toLocaleString("pt-BR")} acessos</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Desenvolvido por Uriel da Fonseca Fortunato
        </p>
        <button
          onClick={() => setDonateOpen(true)}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 font-display text-xs font-bold tracking-wider text-primary transition-all duration-200 hover:border-primary hover:shadow-[var(--shadow-glow)]"
        >
          <Heart className="h-4 w-4" style={{ fill: "hsl(var(--primary))" }} />
          Ajude o Desenvolvedor
        </button>
      </footer>

      {/* Donate Dialog */}
      <Dialog open={donateOpen} onOpenChange={setDonateOpen}>
        <DialogContent className="border-border bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display text-lg tracking-wider text-primary">
              <Heart className="h-5 w-5" style={{ fill: "hsl(var(--primary))" }} />
              Ajude o Desenvolvedor
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Se o YarrList TV te ajuda, considere fazer uma contribuição via PIX para manter o programa funcionando! ⚓
            </DialogDescription>
          </DialogHeader>
          <PixDonateContent visitCount={visitCount} />

        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
