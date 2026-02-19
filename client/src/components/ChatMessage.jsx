import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneLight,
  oneDark,
} from "react-syntax-highlighter/dist/esm/styles/prism";

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatMessage({
  message,
  index,
  darkMode,
  onEdit,
  isLoading,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.content);
  const isUser = message.role === "user";

  const handleSaveEdit = () => {
    if (editText.trim() && editText !== message.content) {
      onEdit(index, editText.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditText(message.content);
    setIsEditing(false);
  };

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-blue-600 text-white rounded-br-md"
            : message.isError
              ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-bl-md"
              : "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm rounded-bl-md"
        }`}
      >
        {/* Role label and timestamp */}
        <div
          className={`flex items-center gap-2 mb-1 text-xs ${
            isUser
              ? "text-blue-100"
              : message.isError
                ? "text-red-500 dark:text-red-400"
                : "text-slate-400 dark:text-slate-400"
          }`}
        >
          <span className="font-semibold">
            {isUser ? "You" : "Assistant"}
          </span>
          <span>{formatTime(message.timestamp)}</span>
          {isUser && !isLoading && (
            <button
              onClick={() => setIsEditing(true)}
              className="ml-auto opacity-0 group-hover:opacity-100 hover:text-blue-200 transition-opacity"
              title="Edit message"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-3.5 h-3.5"
              >
                <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
              </svg>
            </button>
          )}
        </div>

        {/* Message content */}
        {isEditing ? (
          <div className="mt-1">
            <textarea
              className="w-full p-2 rounded bg-blue-700 text-white border border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-300 resize-none"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={3}
              autoFocus
            />
            <div className="flex gap-2 mt-1">
              <button
                onClick={handleSaveEdit}
                className="text-xs px-2 py-1 bg-blue-500 rounded hover:bg-blue-400 transition-colors"
              >
                Save & Resend
              </button>
              <button
                onClick={handleCancelEdit}
                className="text-xs px-2 py-1 bg-blue-700 rounded hover:bg-blue-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : isUser ? (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        ) : (
          <div className="markdown-content break-words">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  const inline = !match && !className;
                  return inline ? (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  ) : (
                    <SyntaxHighlighter
                      style={darkMode ? oneDark : oneLight}
                      language={match ? match[1] : "text"}
                      PreTag="div"
                      customStyle={{ fontSize: "0.85em" }}
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
