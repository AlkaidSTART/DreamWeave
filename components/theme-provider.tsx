"use client";

import { useEffect, type ReactNode } from "react";
import { useThemeStore, type Theme } from "@/stores/theme-store";

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    const listener = (event: MediaQueryListEvent) => {
      const stored = window.localStorage.getItem("dreamweave-theme");
      if (!stored) {
        setTheme(event.matches ? "dark" : "light");
      }
    };

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [setTheme]);

  return children;
}

export function useTheme() {
  const { theme, setTheme, toggleTheme } = useThemeStore();
  return { theme, setTheme, toggleTheme };
}

export type { Theme };
