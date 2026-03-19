import { useRef, useCallback, useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import type { Category } from "@/data/categories";

interface CategoryCardProps {
  category: Category;
  index: number;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

const CategoryCard = ({ category, index, isFavorite, onToggleFavorite }: CategoryCardProps) => {
  const ref = useRef<HTMLAnchorElement>(null);
  const [focused, setFocused] = useState(false);
  const Icon = category.icon;

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "f" || e.key === "F") {
      e.preventDefault();
      onToggleFavorite(category.id);
      return;
    }

    const cards = document.querySelectorAll<HTMLElement>("[data-tv-card]");
    const currentIndex = Array.from(cards).indexOf(ref.current!);
    const cols = window.innerWidth >= 1280 ? 4 : window.innerWidth >= 768 ? 3 : 2;

    let nextIndex = -1;
    if (e.key === "ArrowRight") nextIndex = Math.min(currentIndex + 1, cards.length - 1);
    if (e.key === "ArrowLeft") nextIndex = Math.max(currentIndex - 1, 0);
    if (e.key === "ArrowDown") nextIndex = Math.min(currentIndex + cols, cards.length - 1);
    if (e.key === "ArrowUp") nextIndex = Math.max(currentIndex - cols, 0);

    if (nextIndex >= 0) {
      e.preventDefault();
      cards[nextIndex]?.focus();
    }
  }, [category.id, onToggleFavorite]);

  const handleFavClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite(category.id);
  };

  return (
    <motion.a
      ref={ref}
      href={category.url}
      target="_blank"
      rel="noopener noreferrer"
      data-tv-card
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ scale: 1.06, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="group relative flex aspect-square flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border border-transparent transition-all duration-300 ease-out focus:outline-none xl:gap-4"
      style={{
        background: `linear-gradient(145deg, hsl(${category.color} / 0.2) 0%, hsl(${category.color} / 0.05) 100%)`,
        borderColor: focused ? `hsl(${category.color} / 0.6)` : 'hsl(220 15% 16%)',
        boxShadow: focused
          ? `0 0 30px hsl(${category.color} / 0.3), 0 8px 32px hsl(${category.color} / 0.15)`
          : '0 2px 12px hsl(0 0% 0% / 0.2)',
      }}
    >
      {/* Background glow effect */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at 50% 40%, hsl(${category.color} / 0.25) 0%, transparent 70%)`,
        }}
      />

      {/* Favorite button */}
      <button
        onClick={handleFavClick}
        className="absolute top-2.5 right-2.5 z-10 rounded-full p-1.5 transition-all duration-200 hover:scale-125 focus:outline-none"
        tabIndex={-1}
        aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      >
        <Star
          className="h-4 w-4 transition-all duration-200 xl:h-5 xl:w-5"
          style={{
            color: isFavorite ? `hsl(${category.color})` : "hsl(var(--muted-foreground))",
            fill: isFavorite ? `hsl(${category.color})` : "none",
            filter: isFavorite ? `drop-shadow(0 0 6px hsl(${category.color} / 0.6))` : undefined,
          }}
        />
      </button>

      {/* Icon */}
      <div
        className="relative flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110 xl:h-16 xl:w-16"
        style={{
          background: `linear-gradient(135deg, hsl(${category.color} / 0.3), hsl(${category.color} / 0.1))`,
        }}
      >
        <Icon
          className="h-7 w-7 transition-all duration-300 xl:h-8 xl:w-8"
          style={{
            color: `hsl(${category.color})`,
            filter: `drop-shadow(0 0 8px hsl(${category.color} / 0.4))`,
          }}
        />
      </div>

      {/* Name */}
      <span
        className="relative z-10 text-center font-display text-xs font-semibold tracking-wide xl:text-sm text-foreground"
        style={{
          color: focused ? `hsl(${category.color})` : undefined,
        }}
      >
        {category.name}
      </span>

      {/* Focus indicator */}
      {focused && (
        <motion.div
          layoutId="focus-indicator"
          className="absolute -bottom-px left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full"
          style={{ backgroundColor: `hsl(${category.color})` }}
        />
      )}
    </motion.a>
  );
};

export default CategoryCard;
