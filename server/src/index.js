import "dotenv/config";
import express from "express";
import cors from "cors";
import { getChatResponse, streamChatResponse } from "./anthropicService.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

/**
 * POST /api/chat
 * Body: { messages: [{ role, content }], stream?: boolean }
 */
app.post("/api/chat", async (req, res) => {
  const { messages, stream } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages array is required" });
  }

  // Validate message format
  for (const msg of messages) {
    if (!msg.role || !msg.content) {
      return res
        .status(400)
        .json({ error: "Each message must have a role and content" });
    }
    if (!["user", "assistant"].includes(msg.role)) {
      return res
        .status(400)
        .json({ error: 'role must be "user" or "assistant"' });
    }
  }

  try {
    if (stream) {
      // SSE streaming response
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders();

      const generator = streamChatResponse(messages);
      for await (const delta of generator) {
        res.write(`data: ${JSON.stringify({ delta })}\n\n`);
      }
      res.write("data: [DONE]\n\n");
      res.end();
    } else {
      const reply = await getChatResponse(messages);
      res.json({ role: "assistant", content: reply });
    }
  } catch (err) {
    console.error("LLM API error:", err.message);

    // If headers already sent (during streaming), close the connection
    if (res.headersSent) {
      res.write(
        `data: ${JSON.stringify({ error: "Stream interrupted. Please try again." })}\n\n`
      );
      res.end();
      return;
    }

    if (err.status === 401) {
      return res.status(401).json({ error: "Invalid API key" });
    }
    if (err.status === 429) {
      return res.status(429).json({ error: "Rate limit exceeded. Please wait and try again." });
    }
    res
      .status(500)
      .json({ error: "Something went wrong. Please try again." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
