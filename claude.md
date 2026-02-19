## Coding Prompt: LLM Chat Interface Web Application

### Project Overview
Build a clean, responsive single-page web application that allows users to send chat messages to an LLM API and display the streamed or returned responses in a conversational UI.

---

### Tech Stack
- **Frontend:** React (with Vite) + Tailwind CSS
- **Backend:** Node.js + Express
- **LLM Integration:** Anthropic Claude API (or OpenAI-compatible endpoint)
- **Communication:** REST API with optional streaming via Server-Sent Events (SSE)

---

### Functional Requirements

**Chat Interface**
- Display a scrollable conversation thread showing alternating user and assistant messages
- Each message should show a role label (e.g. "You" / "Assistant") and timestamp
- Auto-scroll to the latest message when a new one appears
- Show a typing indicator / loading spinner while awaiting the LLM response

**Input Area**
- A fixed-to-bottom textarea input that expands up to 4 lines
- Submit on Enter key (Shift+Enter for newline) or a Send button
- Disable input and button while a request is in progress
- Clear the input field after submission

**Session Management**
- Maintain full conversation history in state and pass it with each API call to preserve context
- Include a "Clear Chat" button that resets the conversation thread and history

**Streaming Support (optional but preferred)**
- Stream the LLM response token-by-token using SSE so the user sees text appear progressively
- Gracefully fall back to a single response if streaming is unavailable

---

### Backend Requirements

- Create a `POST /api/chat` endpoint that accepts:
  ```json
  { "messages": [ { "role": "user", "content": "..." }, ... ] }
  ```
- Forward the messages array to the LLM API with a configurable system prompt
- Return the assistant reply (or stream it)
- Store the API key securely in a `.env` file — never expose it to the frontend
- Add basic error handling: return meaningful HTTP error codes and messages on failure

---

### Non-Functional Requirements

- Mobile-responsive layout that works on screens 320px and wider
- Graceful error display in the chat thread (e.g. "Something went wrong. Please try again.") rather than silent failures
- Environment variables for all configurable values: API key, model name, system prompt, max tokens, temperature
- Clean separation of concerns — API logic in a service layer, not inline in the route handler

---

### Stretch Goals
- Markdown rendering for assistant responses (code blocks, bold, lists, etc.)
- Syntax highlighting for code snippets in responses
- Ability to edit and resend a previous user message
- Persist conversation history to `localStorage` so it survives page refresh
- Dark/light mode toggle

---

### Deliverables
1. Full source code with a clear folder structure (`/client`, `/server`)
2. `.env.example` file listing all required environment variables
3. `README.md` with setup instructions, how to run locally, and how to swap in a different LLM provider

---

This prompt gives a developer everything they need to build a production-quality chat UI from scratch. You can swap out the tech stack section (e.g. replace React with plain HTML/JS, or use Python/FastAPI on the backend) depending on your preferences.
