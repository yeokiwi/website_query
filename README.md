# LLM Chat Interface

A responsive single-page chat application that connects to the Anthropic Claude API with real-time streaming responses.

## Features

- **Streaming responses** — tokens appear in real-time via Server-Sent Events (SSE)
- **Markdown rendering** — assistant responses render markdown with syntax-highlighted code blocks
- **Dark / light mode** — toggle between themes; preference is persisted
- **Conversation persistence** — chat history is saved to `localStorage` and survives page refreshes
- **Edit & resend** — click the edit icon on any user message to modify and resend it
- **Mobile responsive** — works on screens 320px and wider
- **Error handling** — errors display inline in the chat thread with automatic fallback from streaming to non-streaming

## Project Structure

```
├── client/          # React + Vite + Tailwind CSS frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatInput.jsx
│   │   │   ├── ChatMessage.jsx
│   │   │   ├── Header.jsx
│   │   │   └── TypingIndicator.jsx
│   │   ├── api.js         # API client (fetch + SSE streaming)
│   │   ├── useChat.js     # Chat state management hook
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── vite.config.js
└── server/          # Node.js + Express backend
    └── src/
        ├── index.js              # Express app and /api/chat route
        └── anthropicService.js   # Anthropic SDK service layer
```

## Setup

### Prerequisites

- Node.js 18+
- An Anthropic API key ([get one here](https://console.anthropic.com/))

### 1. Configure environment variables

```bash
cp server/.env.example server/.env
```

Edit `server/.env` and set your `ANTHROPIC_API_KEY`.

### 2. Install dependencies

```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 3. Run locally

Start both the server and client in separate terminals:

```bash
# Terminal 1 — backend
cd server && npm run dev

# Terminal 2 — frontend
cd client && npm run dev
```

The client dev server proxies `/api` requests to the backend at `http://localhost:3001`.

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Configuration

All configurable values are set via environment variables in `server/.env`:

| Variable | Default | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | — | Your Anthropic API key (required) |
| `MODEL_NAME` | `claude-sonnet-4-20250514` | Model ID to use |
| `SYSTEM_PROMPT` | `You are a helpful, friendly assistant...` | System prompt |
| `MAX_TOKENS` | `4096` | Max tokens per response |
| `TEMPERATURE` | `0.7` | Sampling temperature |
| `PORT` | `3001` | Backend server port |

## Swapping LLM Providers

To use a different LLM provider, modify `server/src/anthropicService.js`:

1. Replace the `@anthropic-ai/sdk` import with your provider's SDK
2. Update the `getChatResponse` function to call your provider's completion API
3. Update the `streamChatResponse` generator to yield text deltas from your provider's streaming API
4. Adjust environment variables in `.env` as needed

The rest of the application (Express routes, frontend) requires no changes — the service layer is the only file that talks to the LLM.
