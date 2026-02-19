import { useState, useEffect, useRef } from "react";
import { useChat } from "./useChat";
import Header from "./components/Header";
import ChatMessage from "./components/ChatMessage";
import ChatInput from "./components/ChatInput";
import TypingIndicator from "./components/TypingIndicator";

function App() {
  const { messages, isLoading, send, clearChat, editAndResend } = useChat();
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("llm-chat-dark-mode");
    if (saved !== null) return saved === "true";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const chatEndRef = useRef(null);

  // Apply dark class to html element
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("llm-chat-dark-mode", String(darkMode));
  }, [darkMode]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const showTyping =
    isLoading &&
    messages.length > 0 &&
    messages[messages.length - 1].role === "assistant" &&
    messages[messages.length - 1].content === "";

  return (
    <div className="h-dvh flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors">
      <Header
        onClearChat={clearChat}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((d) => !d)}
      />

      {/* Chat messages area */}
      <main className="flex-1 overflow-y-auto chat-scroll px-3 sm:px-4 py-4">
        <div className="max-w-3xl mx-auto">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full min-h-[50vh] text-slate-400 dark:text-slate-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1}
                stroke="currentColor"
                className="w-16 h-16 mb-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                />
              </svg>
              <p className="text-lg font-medium">Start a conversation</p>
              <p className="text-sm mt-1">Send a message to begin chatting</p>
            </div>
          )}

          {messages.map((msg, i) => {
            // Skip rendering the empty assistant placeholder (typing indicator shown instead)
            if (
              msg.role === "assistant" &&
              msg.content === "" &&
              isLoading &&
              i === messages.length - 1
            ) {
              return null;
            }
            return (
              <div key={`${msg.timestamp}-${i}`} className="group">
                <ChatMessage
                  message={msg}
                  index={i}
                  darkMode={darkMode}
                  onEdit={editAndResend}
                  isLoading={isLoading}
                />
              </div>
            );
          })}

          {showTyping && <TypingIndicator />}

          <div ref={chatEndRef} />
        </div>
      </main>

      <ChatInput onSend={send} disabled={isLoading} />
    </div>
  );
}

export default App;
