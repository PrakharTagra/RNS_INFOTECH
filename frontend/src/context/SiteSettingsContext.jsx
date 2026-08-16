import React, { createContext, useContext, useEffect, useState } from "react";
import { getStoreProfileContent } from "../lib/contentApi";
import { support as defaultSupport } from "../data/siteData";

const SiteSettingsContext = createContext(null);

/**
 * SiteSettingsProvider — fetches the admin-saved store profile
 * (name/email/phone/whatsapp/hours/address) once on app boot and
 * exposes it as `support` via useSiteSettings(). Falls back to the
 * static `support` object from siteData.js so a backend hiccup never
 * breaks the footer/contact/help pages — only fields the API actually
 * returns a value for override the defaults.
 */
export function SiteSettingsProvider({ children }) {
  const [support, setSupport] = useState(defaultSupport);

  useEffect(() => {
    let cancelled = false;
    getStoreProfileContent()
      .then((profile) => {
        if (cancelled || !profile) return;
        const updates = Object.fromEntries(Object.entries(profile).filter(([, value]) => value));
        if (Object.keys(updates).length === 0) return;
        setSupport((current) => ({ ...current, ...updates }));
      })
      .catch(() => {
        // Network/API hiccup — keep the static defaults already in state.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return <SiteSettingsContext.Provider value={{ support }}>{children}</SiteSettingsContext.Provider>;
}

export function useSiteSettings() {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) throw new Error("useSiteSettings must be used within a SiteSettingsProvider");
  return ctx;
}
