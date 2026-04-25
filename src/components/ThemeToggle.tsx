"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-10 h-10 p-2 opacity-0"></div>; // Placeholder to avoid layout shift

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-3 rounded-full text-zinc-500 dark:text-zinc-400 hover:text-purple-500 dark:hover:text-purple-400 hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-95 border border-transparent hover:border-purple-500/30"
      title="Toggle Theme"
      suppressHydrationWarning
    >
      {theme === "dark" ? (
        <Sun size={20} className="stroke-[2.5]" />
      ) : (
        <Moon size={20} className="stroke-[2.5]" />
      )}
    </button>
  );
}
