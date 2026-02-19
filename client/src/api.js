const API_URL = "/api/chat";

/**
 * Send messages to the backend and return the full response.
 */
export async function sendMessage(messages) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, stream: false }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed with status ${res.status}`);
  }

  const data = await res.json();
  return data.content;
}

/**
 * Send messages to the backend with SSE streaming.
 * Calls onDelta for each text chunk, onDone when complete.
 * Returns an AbortController so the caller can cancel.
 */
export function streamMessage(messages, { onDelta, onDone, onError }) {
  const controller = new AbortController();

  (async () => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, stream: true }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          body.error || `Request failed with status ${res.status}`
        );
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) continue;
          const payload = trimmed.slice(6);

          if (payload === "[DONE]") {
            onDone();
            return;
          }

          try {
            const parsed = JSON.parse(payload);
            if (parsed.error) {
              onError(new Error(parsed.error));
              return;
            }
            if (parsed.delta) {
              onDelta(parsed.delta);
            }
          } catch {
            // skip malformed JSON
          }
        }
      }

      onDone();
    } catch (err) {
      if (err.name !== "AbortError") {
        onError(err);
      }
    }
  })();

  return controller;
}
