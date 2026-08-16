import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getStoreProfileContent } from "../lib/contentApi";
import { support as defaultSupport } from "../data/siteData";

const SiteSettingsContext = createContext(null);
const REFRESH_AFTER_MS = 30_000;

export function SiteSettingsProvider({ children }) {
  const [support, setSupport] = useState(defaultSupport);
  const [lastFetchedAt, setLastFetchedAt] = useState(0);

  const refresh = useCallback(async ({ force = false } = {}) => {
    if (!force && Date.now() - lastFetchedAt < REFRESH_AFTER_MS) return support;
    try {
      const profile = await getStoreProfileContent();
      if (profile) {
        // The backend is authoritative. Merge all returned fields,
        // including intentionally empty values, instead of filtering by
        // truthiness and accidentally keeping stale static business data.
        setSupport((current) => ({ ...current, ...profile }));
      }
      setLastFetchedAt(Date.now());
      return profile;
    } catch {
      // Keep the last known good values when the API is temporarily down.
      return null;
    }
  }, [lastFetchedAt, support]);

  useEffect(() => {
    refresh({ force: true });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [refresh]);

  return <SiteSettingsContext.Provider value={{ support, refresh }}>{children}</SiteSettingsContext.Provider>;
}

export function useSiteSettings() {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) throw new Error("useSiteSettings must be used within a SiteSettingsProvider");
  return ctx;
}
