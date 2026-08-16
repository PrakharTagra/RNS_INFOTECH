import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { getOrCreateGuestId, getOrCreateThread, sendMessage, markRead, subscribeToChatUpdates } from "../lib/chatService";

const LiveChatContext = createContext(null);

/**
 * LiveChatProvider — a real customer-support chat thread (not a bot).
 * Each visitor gets one thread via the real backend API. For authenticated
 * users, the thread is keyed by their account ID; for guests, it's a
 * persisted guest ID (stored in localStorage). Messages are fetched via
 * polling (every 5 seconds) to pick up responses from support staff.
 */
export function LiveChatProvider({ children }) {
  const { currentUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatError, setChatError] = useState(null);

  // Build the thread ID: user_<id> for logged-in users, guest_<id> for guests
  const threadId = useMemo(
    () => (currentUser ? `user_${currentUser.id}` : `guest_${getOrCreateGuestId()}`),
    [currentUser]
  );

  // Initialize the thread on mount or when currentUser changes
  useEffect(() => {
    const initThread = async () => {
      try {
        setLoading(true);
        setChatError(null);
        const fetchedThread = await getOrCreateThread(
          threadId,
          currentUser?.name || "Guest",
          currentUser?.email || ""
        );
        setThread(fetchedThread);
      } catch (error) {
        console.error("Failed to initialize chat thread:", error);
        setChatError(error);
        setThread(null);
      } finally {
        setLoading(false);
      }
    };

    initThread();
  }, [threadId, currentUser]);

  // Poll for new messages periodically
  useEffect(() => {
    if (!thread) return;
    const unsubscribe = subscribeToChatUpdates(threadId, setThread);
    return unsubscribe;
  }, [threadId, thread]);

  // Mark messages as read when chat opens
  useEffect(() => {
    if (!open || !thread) return;
    const hasUnread = thread.messages.some((m) => m.from === "admin" && !m.readByCustomer);
    if (hasUnread) {
      markRead(threadId).then(setThread).catch((error) => console.warn("Failed to mark chat read:", error));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const unreadCount = useMemo(
    () => (thread?.messages || []).filter((m) => m.from === "admin" && !m.readByCustomer).length,
    [thread?.messages]
  );

  const api = useMemo(
    () => ({
      open,
      openChat: () => setOpen(true),
      closeChat: () => setOpen(false),
      toggleChat: () => setOpen((o) => !o),
      messages: thread?.messages || [],
      unreadCount,
      loading,
      chatError,
      sendMessage: async (text) => {
        if (!text.trim() || !thread) return;
        try {
          const updatedThread = await sendMessage(threadId, text, "customer");
          setThread(updatedThread);
        } catch (error) {
          console.error("Failed to send message:", error);
        }
      },
    }),
    [open, thread, unreadCount, threadId, loading]
  );

  return <LiveChatContext.Provider value={api}>{children}</LiveChatContext.Provider>;
}

export function useLiveChat() {
  const ctx = useContext(LiveChatContext);
  if (!ctx) throw new Error("useLiveChat must be used within a LiveChatProvider");
  return ctx;
}
