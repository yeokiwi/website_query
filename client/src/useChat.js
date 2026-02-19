import { useState, useCallback, useRef, useEffect } from "react";
import { streamMessage, sendMessage } from "./api";

const STORAGE_KEY = "llm-chat-history";

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore corrupt data
  }
  return [];
}

function saveHistory(messages) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {
    // storage full or unavailable
  }
}

export function useChat() {
  const [messages, setMessages] = useState(loadHistory);
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef(null);

  // Persist messages to localStorage whenever they change
  useEffect(() => {
    saveHistory(messages);
  }, [messages]);

  const send = useCallback(
    async (content) => {
      const userMsg = {
        role: "user",
        content,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      // Build the API messages array (role + content only)
      const apiMessages = [
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content },
      ];

      const assistantMsg = {
        role: "assistant",
        content: "",
        timestamp: Date.now(),
      };

      // Add placeholder for streaming
      setMessages((prev) => [...prev, assistantMsg]);

      try {
        const controller = streamMessage(apiMessages, {
          onDelta: (delta) => {
            setMessages((prev) => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              updated[updated.length - 1] = {
                ...last,
                content: last.content + delta,
              };
              return updated;
            });
          },
          onDone: () => {
            setIsLoading(false);
          },
          onError: async (err) => {
            // Try non-streaming fallback
            try {
              const fallbackReply = await sendMessage(apiMessages);
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: fallbackReply,
                  timestamp: Date.now(),
                };
                return updated;
              });
            } catch {
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: `Error: ${err.message || "Something went wrong. Please try again."}`,
                  isError: true,
                  timestamp: Date.now(),
                };
                return updated;
              });
            }
            setIsLoading(false);
          },
        });

        abortRef.current = controller;
      } catch (err) {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: `Error: ${err.message || "Something went wrong. Please try again."}`,
            isError: true,
            timestamp: Date.now(),
          };
          return updated;
        });
        setIsLoading(false);
      }
    },
    [messages]
  );

  const editAndResend = useCallback(
    (index, newContent) => {
      // Truncate history up to (but not including) the edited message,
      // then resend with the new content
      const truncated = messages.slice(0, index);
      setMessages(truncated);
      // We need to wait for state to settle, so use setTimeout
      setTimeout(() => {
        // Re-build from truncated state
        const userMsg = {
          role: "user",
          content: newContent,
          timestamp: Date.now(),
        };
        const apiMessages = [
          ...truncated.map((m) => ({ role: m.role, content: m.content })),
          { role: "user", content: newContent },
        ];

        setMessages((prev) => [...prev, userMsg]);
        setIsLoading(true);

        const assistantMsg = {
          role: "assistant",
          content: "",
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, assistantMsg]);

        const controller = streamMessage(apiMessages, {
          onDelta: (delta) => {
            setMessages((prev) => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              updated[updated.length - 1] = {
                ...last,
                content: last.content + delta,
              };
              return updated;
            });
          },
          onDone: () => setIsLoading(false),
          onError: (err) => {
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                role: "assistant",
                content: `Error: ${err.message || "Something went wrong. Please try again."}`,
                isError: true,
                timestamp: Date.now(),
              };
              return updated;
            });
            setIsLoading(false);
          },
        });
        abortRef.current = controller;
      }, 0);
    },
    [messages]
  );

  const clearChat = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    setMessages([]);
    setIsLoading(false);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { messages, isLoading, send, clearChat, editAndResend };
}
