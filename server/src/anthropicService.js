import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const MODEL = process.env.MODEL_NAME || "claude-sonnet-4-20250514";
const MAX_TOKENS = parseInt(process.env.MAX_TOKENS || "4096", 10);
const TEMPERATURE = parseFloat(process.env.TEMPERATURE || "0.7");
const SYSTEM_PROMPT =
  process.env.SYSTEM_PROMPT ||
  "You are a helpful, friendly assistant. Respond concisely and clearly.";

/**
 * Send messages to Claude and return the full response.
 */
export async function getChatResponse(messages) {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    temperature: TEMPERATURE,
    system: SYSTEM_PROMPT,
    messages,
  });

  const text = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");

  return text;
}

/**
 * Stream messages from Claude, yielding text deltas.
 */
export async function* streamChatResponse(messages) {
  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    temperature: TEMPERATURE,
    system: SYSTEM_PROMPT,
    messages,
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      yield event.delta.text;
    }
  }
}
