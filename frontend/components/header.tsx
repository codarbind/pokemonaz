"use client"

import { Bookmark, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { COLOR_CLASSES } from "./pagination"

interface HeaderProps {
  showFavoritesOnly: boolean
  onToggleFavorites: (show: boolean) => void
  searchTerm: string
  onSearchChange: (term: string) => void
}

export function Header({
  showFavoritesOnly,
  onToggleFavorites,
  searchTerm,
  onSearchChange,
}: HeaderProps) {
  return (
<<<<<<< HEAD
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-20 flex items-center px-6 justify-between">
      <div className="text-2xl font-bold text-red-600">
        Poke<span className="text-blue-600">Deck</span>
=======
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-20 flex items-center px-6 justify-between sticky top-0 z-40 backdrop-blur-sm bg-white/80 dark:bg-slate-900/80">
      
      {/* Logo with colorful letters */}
      <div className="flex items-center gap-1">
        {"PokeDeck".split("").map((letter, index) => {
          const colorClass = COLOR_CLASSES[index % COLOR_CLASSES.length];
          return (
            <span
              key={index}
              className={`w-8 h-8 flex items-center justify-center rounded-full text-white font-bold ${colorClass}`}
            >
              {letter}
            </span>
          );
        })}
>>>>>>> fad34f2dc6eba312ef45cc87e8e01f336d81887b
      </div>

      {/* Search input */}
      <div className="flex items-center gap-4 flex-1 max-w-md mx-auto">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search Pokemon..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Bookmarks button */}
      <Button
        variant={showFavoritesOnly ? "default" : "outline"}
        onClick={() => onToggleFavorites(!showFavoritesOnly)}
        className="gap-2"
      >
        <Bookmark className="w-4 h-4" fill={showFavoritesOnly ? "currentColor" : "none"} />
        Bookmarks
      </Button>
    </header>
  );
}
