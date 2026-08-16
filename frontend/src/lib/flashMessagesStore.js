// flashMessagesStore — fetches the rotating flash-message bar content
// from the real storefront-backend API (GET /api/flash-messages) instead
// of localStorage. The messages are filtered client-side to hide "login"
// prompts from authenticated users.
//
// subscribeFlashMessages polls the backend every 30 seconds to stay
// current with any admin changes to the flash message list.

import { apiRequest } from "./api";

export const FLASH_KEY = "rns_flash_messages_v1";
const EVENT = "rns-flash-messages-updated";
const POLL_INTERVAL_MS = 30000; // Poll every 30 seconds

let cachedMessages = [];

export async function loadFlashMessages() {
  if (typeof window === "undefined") return [];
  try {
    const response = await apiRequest("/flash-messages", { method: "GET" });
    const items = (response.items || []).map((m) => ({
      id: m._id || m.id,
      type: m.type || "custom",
      message: m.message || "",
      ctaLabel: m.ctaLabel || "",
      ctaHref: m.ctaHref || "",
      active: m.active !== false,
      durationSeconds: m.durationSeconds || 5,
    }));
    cachedMessages = items;
    return items;
  } catch (error) {
    console.warn("Failed to load flash messages:", error);
    return cachedMessages; // Return cached if fetch fails
  }
}

// subscribeFlashMessages — calls `callback` whenever flash messages are
// refreshed from the server. Polls every POLL_INTERVAL_MS. Returns an
// unsubscribe function.
export function subscribeFlashMessages(callback) {
  const interval = window.setInterval(async () => {
    const messages = await loadFlashMessages();
    window.dispatchEvent(new CustomEvent(EVENT, { detail: messages }));
    callback();
  }, POLL_INTERVAL_MS);

  return () => {
    window.clearInterval(interval);
  };
}

// visibleFlashMessages — the one place that decides which messages a
// given visitor should actually see: active ones, minus "login" prompts
// once they're already signed in (there's nothing useful in nudging a
// logged-in visitor to log in).
export function visibleFlashMessages(messages, { isAuthenticated } = {}) {
  return (messages || []).filter((m) => {
    if (m.active === false || !m.message) return false;
    if (m.type === "login" && isAuthenticated) return false;
    return true;
  });
}
