"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  status?: "success" | "crawling" | "error";
  sources?: string[];
}

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userQuery = input.trim();
    setInput("");
    setLoading(true);

    const userMessageId = crypto.randomUUID();
    const aiMessageId = crypto.randomUUID();

    // 1. Append User Message to Chat History
    setMessages((prev) => [
      ...prev,
      { id: userMessageId, sender: "user", text: userQuery },
    ]);

    try {
      // 2. Query the RAG endpoint
      const res = await fetch("http://localhost:3001/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userQuery }),
      });

      const data = await res.json();

      // 3. Append AI Response with sources and status
      setMessages((prev) => [
        ...prev,
        {
          id: aiMessageId,
          sender: "ai",
          text: data.answer || "No response received.",
          status: data.status,
          sources: data.sources || [],
        },
      ]);
    } catch (error) {
      console.error("RAG Chat request failed:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: aiMessageId,
          sender: "ai",
          text: "Failed to communicate with the RAG backend server.",
          status: "error",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* Top Header Navigation */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            Wiki<span className="text-blue-600">RAG</span> Assistant
          </h1>
          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded">
            Strict Context Mode
          </span>
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Backend: localhost:3001
        </div>
      </header>

      {/* Main Conversation Window */}
      <div className="flex-1 overflow-y-auto px-4 py-8 space-y-6 max-w-4xl w-full mx-auto">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 mt-12">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-2xl font-bold mb-4 shadow-inner">
              📚
            </div>
            <h2 className="text-xl font-semibold text-slate-700 mb-2">Verified Academic Knowledge Base</h2>
            <p className="text-slate-500 text-sm max-w-md leading-relaxed">
              Ask questions naturally. The AI will strictly extract facts from your vector database and cite verified sources without hallucinating.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-2xl rounded-2xl p-5 shadow-sm transition-all ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : msg.status === "crawling"
                    ? "bg-amber-50 border border-amber-200 text-slate-800 rounded-bl-none animate-pulse"
                    : "bg-white border border-slate-200 text-slate-800 rounded-bl-none"
                }`}
              >
                {/* Message Body */}
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                {/* Citations/Sources Section */}
                {msg.sender === "ai" && msg.sources && msg.sources.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Verified Sources:
                    </span>
                    <div className="flex flex-col gap-1.5">
                      {msg.sources.map((src, idx) => (
                        <a
                          key={idx}
                          href={src}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline truncate block max-w-full font-medium"
                        >
                          🔗 {src.split("/wiki/")[1]?.replace(/_/g, " ") || src}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {/* Loading/Thinking Indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none p-5 shadow-sm flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Retrieving vectors & synthesizing facts</span>
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Sticky Bottom Input Bar */}
      <div className="bg-white border-t border-slate-200 p-4 shrink-0 shadow-md">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-3">
          <input
            type="text"
            className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-5 py-3.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-transparent transition-all"
            placeholder="Ask anything about the stored knowledge base..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-3.5 rounded-xl shadow-sm transition-colors disabled:bg-blue-400"
            disabled={loading || !input.trim()}
          >
            Ask AI
          </button>
        </form>
      </div>

    </div>
  );
}