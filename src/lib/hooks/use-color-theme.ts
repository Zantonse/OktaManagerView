"use client";

import { useState, useEffect, useCallback } from "react";

const COLOR_THEMES = [
  { id: "okta", label: "Okta Indigo" },
  { id: "midnight", label: "Classic Blue" },
  { id: "ember", label: "Ember Red" },
  { id: "forest", label: "Forest Green" },
  { id: "sunset", label: "Sunset Orange" },
] as const;

export type ColorThemeId = (typeof COLOR_THEMES)[number]["id"];

const STORAGE_KEY = "okta-color-theme";

function applyThemeClass(themeId: ColorThemeId) {
  const root = document.documentElement;
  COLOR_THEMES.forEach((t) => {
    root.classList.remove(`theme-${t.id}`);
  });
  if (themeId !== "okta") {
    root.classList.add(`theme-${themeId}`);
  }
}

export function useColorTheme() {
  const [colorTheme, setColorTheme] = useState<ColorThemeId>("okta");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ColorThemeId | null;
    if (stored && COLOR_THEMES.some((t) => t.id === stored)) {
      setColorTheme(stored);
      applyThemeClass(stored);
    }
    setMounted(true);
  }, []);

  const cycleTheme = useCallback(() => {
    const currentIndex = COLOR_THEMES.findIndex((t) => t.id === colorTheme);
    const nextIndex = (currentIndex + 1) % COLOR_THEMES.length;
    const next = COLOR_THEMES[nextIndex];
    setColorTheme(next.id);
    localStorage.setItem(STORAGE_KEY, next.id);
    applyThemeClass(next.id);
    return next;
  }, [colorTheme]);

  const themeLabel = COLOR_THEMES.find((t) => t.id === colorTheme)?.label ?? "Okta Indigo";

  return { colorTheme, cycleTheme, themeLabel, mounted, themes: COLOR_THEMES };
}
