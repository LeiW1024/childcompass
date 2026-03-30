"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { useLang, t } from "@/components/ui/LanguageSwitcher";
import { cn } from "@/lib/utils/cn";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { lang } = useLang();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Add welcome message when first opened
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: t("chatWelcome", lang),
        },
      ]);
    }
  }, [open, messages.length, lang]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/support/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
        }),
      });

      if (!res.ok) {
        throw new Error("Request failed");
      }

      const json = await res.json();

      if (json.error) {
        setError(t("chatError", lang));
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: json.data.reply,
          },
        ]);
      }
    } catch {
      setError(t("chatError", lang));
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <>
      {/* Chat Panel */}
      {open && (
        <div
          className={cn(
            "fixed bottom-24 right-6 z-50 flex flex-col",
            "w-[360px] h-[480px] max-sm:w-[calc(100vw-2rem)] max-sm:right-4",
            "bg-card border border-border rounded-2xl shadow-xl animate-fade-in overflow-hidden"
          )}
          role="dialog"
          aria-label={t("chatTitle", lang)}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-compass-500 text-white">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <span className="font-semibold text-sm">{t("chatTitle", lang)}</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg p-1 hover:bg-white/20 transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                  msg.role === "user"
                    ? "ml-auto bg-compass-500 text-white rounded-br-md"
                    : "mr-auto bg-muted text-foreground rounded-bl-md"
                )}
              >
                {msg.content}
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="mr-auto bg-muted rounded-2xl rounded-bl-md px-4 py-3 max-w-[85%]">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <p className="text-xs text-destructive text-center">{error}</p>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border px-3 py-2 flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("chatPlaceholder", lang)}
              disabled={isLoading}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
              maxLength={2000}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={cn(
                "rounded-lg p-2 transition-colors",
                input.trim() && !isLoading
                  ? "bg-compass-500 text-white hover:bg-compass-600"
                  : "bg-muted text-muted-foreground"
              )}
              aria-label={t("chatSend", lang)}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "fixed bottom-6 right-6 z-50",
          "h-14 w-14 rounded-full shadow-lg",
          "flex items-center justify-center transition-all",
          open
            ? "bg-compass-600 hover:bg-compass-700"
            : "bg-compass-500 hover:bg-compass-600"
        )}
        aria-label={open ? "Close support chat" : "Open support chat"}
      >
        {open ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <MessageCircle className="h-6 w-6 text-white" />
        )}
      </button>
    </>
  );
}
