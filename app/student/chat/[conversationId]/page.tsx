"use client";

import { useState, useEffect, useRef, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useConversation, useSendMessage } from "@/hooks/useConversations";
import { Message, MessageRole } from "@/lib/types/conversation";
import {
  Send,
  Bot,
  User,
  Sparkles,
  ArrowLeft,
  BookOpen,
  Clock,
  CheckCheck,
  AlertCircle,
  FileText,
  Loader2,
} from "lucide-react";
import Link from "next/link";

// Typing indicator component
function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-start gap-3 mb-4"
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="px-4 py-3 rounded-2xl bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
        <div className="flex items-center gap-1">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
            className="w-2 h-2 rounded-full bg-purple-500 dark:bg-purple-400"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
            className="w-2 h-2 rounded-full bg-purple-500 dark:bg-purple-400"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
            className="w-2 h-2 rounded-full bg-purple-500 dark:bg-purple-400"
          />
        </div>
      </div>
    </motion.div>
  );
}

// Message bubble component
function MessageBubble({
  message,
  agentName,
}: {
  message: Message;
  agentName?: string;
}) {
  const isUser = message.role === MessageRole.USER;
  const hasRagSources =
    message.metadata?.ragSources && message.metadata.ragSources.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-start gap-3 mb-4 ${
        isUser ? "flex-row-reverse" : ""
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser
            ? "bg-gradient-to-br from-cyan-500 to-blue-600"
            : "bg-gradient-to-br from-purple-600 to-cyan-600"
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className={`max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
        {/* RAG Context Badge */}
        {!isUser && hasRagSources && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-1.5 mb-2"
          >
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
              <FileText className="w-3 h-3" />
              Using {message.metadata?.ragSources?.length} document
              {(message.metadata?.ragSources?.length || 0) > 1 ? "s" : ""}
            </span>
          </motion.div>
        )}

        {/* Message Bubble */}
        <div
          className={`px-4 py-3 rounded-2xl ${
            isUser
              ? "bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-tr-md"
              : "bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-slate-100 rounded-tl-md"
          }`}
        >
          <p className="whitespace-pre-wrap leading-relaxed">
            {message.content}
          </p>
        </div>

        {/* Timestamp */}
        <div
          className={`flex items-center gap-1.5 mt-1.5 text-xs text-gray-500 dark:text-slate-500 ${
            isUser ? "justify-end" : "justify-start"
          }`}
        >
          <Clock className="w-3 h-3" />
          <span>
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {isUser && <CheckCheck className="w-3 h-3 text-cyan-500 dark:text-cyan-400" />}
        </div>
      </div>
    </motion.div>
  );
}

// Welcome message component
function WelcomeMessage({ agentName }: { agentName: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center h-full text-center px-4"
    >
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-100 dark:from-purple-600/20 to-cyan-100 dark:to-cyan-600/20 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center mb-6">
        <Bot className="w-10 h-10 text-purple-500 dark:text-purple-400" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Chat with {agentName}
      </h2>
      <p className="text-gray-600 dark:text-slate-400 max-w-md mb-8">
        This AI is powered by specialized knowledge. Ask anything and get
        context-aware answers.
      </p>
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20">
        <Sparkles className="w-4 h-4 text-purple-500 dark:text-purple-400" />
        <span className="text-sm text-purple-600 dark:text-purple-400">RAG-Powered Responses</span>
      </div>
    </motion.div>
  );
}

export default function ChatPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = use(params);
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
    data: conversation,
    isLoading,
    error,
  } = useConversation(conversationId);
  const sendMessage = useSendMessage(conversationId);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    if (!inputValue.trim() || sendMessage.isPending) return;

    const content = inputValue.trim();
    setInputValue("");

    try {
      await sendMessage.mutateAsync({ content, useRag: true });
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-purple-500 dark:text-purple-400 animate-spin" />
          <p className="text-gray-600 dark:text-slate-400">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Conversation not found
          </h2>
          <p className="text-gray-600 dark:text-slate-400 mb-6">
            This conversation doesn&apos;t exist or you don&apos;t have access.
          </p>
          <Link
            href="/student/dashboard"
            className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const agentName = conversation.agent?.name || "AI Agent";
  const messages = conversation.messages || [];

  return (
    <div className="h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-gray-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/student/dashboard"
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-500 dark:text-slate-400" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-gray-900 dark:text-white">{agentName}</h1>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                  <span>Online</span>
                </div>
              </div>
            </div>
          </div>

          {/* Context indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
            <BookOpen className="w-4 h-4 text-purple-500 dark:text-purple-400" />
            <span className="text-sm text-gray-700 dark:text-slate-300">
              Powered by {agentName}&apos;s Knowledge
            </span>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {messages.length === 0 ? (
            <WelcomeMessage agentName={agentName} />
          ) : (
            <>
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  agentName={agentName}
                />
              ))}
              <AnimatePresence>
                {sendMessage.isPending && <TypingIndicator />}
              </AnimatePresence>
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="flex-shrink-0 border-t border-gray-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="relative flex items-end gap-3 bg-gray-100 dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 focus-within:border-purple-500/50 transition-colors">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${agentName}...`}
              rows={1}
              className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 px-4 py-3 resize-none focus:outline-none max-h-32 scrollbar-thin"
              style={{
                height: "auto",
                minHeight: "48px",
              }}
              disabled={sendMessage.isPending}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || sendMessage.isPending}
              className="m-2 p-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {sendMessage.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          <p className="text-center text-xs text-gray-500 dark:text-slate-500 mt-3">
            Athena can make mistakes. Verify important information.
          </p>
        </div>
      </footer>
    </div>
  );
}
