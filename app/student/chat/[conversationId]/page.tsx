"use client";

import { useState, useEffect, useRef, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  useConversation,
  useSendMessage,
  useConversations,
  useDeleteConversation,
} from "@/hooks/useConversations";
import { useAgentAccessInfo } from "@/hooks/usePayments";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { PaywallModal } from "@/components/payments";
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
  Lock,
  Crown,
  MessageSquare,
  Plus,
  Search,
  MoreVertical,
  Trash2,
  PanelLeftClose,
  PanelLeft,
  History,
  ChevronDown,
  ChevronUp,
  Globe,
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
  const [showMetadata, setShowMetadata] = useState(false);
  const isUser = message.role === MessageRole.USER;
  const hasRagSources =
    message.metadata?.ragSources && message.metadata.ragSources.length > 0;

  // Remove markdown formatting (bold, italic, etc.)
  const removeMarkdown = (text: string): string => {
    return text
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold **text**
      .replace(/\*([^*]+)\*/g, '$1')     // Remove italic *text*
      .replace(/__([^_]+)__/g, '$1')     // Remove bold __text__
      .replace(/_([^_]+)_/g, '$1')       // Remove italic _text_
      .replace(/~~([^~]+)~~/g, '$1');    // Remove strikethrough ~~text~~
  };

  const displayContent = removeMarkdown(message.content);

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
            {displayContent}
          </p>
        </div>

        {/* Source Citations - Enhanced Display */}
        {!isUser && hasRagSources && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-3 p-3 rounded-lg bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800/30"
          >
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
                Sources Used
              </span>
            </div>
            <div className="space-y-1.5">
              {message.metadata?.ragSources?.slice(0, 5).map((source, index) => {
                const relevanceColor = source.similarity >= 0.8 
                  ? 'text-green-600 dark:text-green-400' 
                  : source.similarity >= 0.65 
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-gray-500 dark:text-slate-500';
                
                return (
                  <div
                    key={`${source.documentId}-${source.chunkIndex}`}
                    className="flex items-start gap-2 text-xs"
                  >
                    <span className="text-purple-500 dark:text-purple-400 font-mono">
                      #{index + 1}
                    </span>
                    <FileText className="w-3 h-3 flex-shrink-0 text-gray-400 dark:text-slate-500 mt-0.5" />
                    <span className="text-gray-700 dark:text-slate-300 flex-1">
                      {source.documentName || `Document ${index + 1}`}
                    </span>
                    <span className={`font-medium ${relevanceColor}`}>
                      {(source.similarity * 100).toFixed(0)}%
                    </span>
                  </div>
                );
              })}
              {(message.metadata?.ragSources?.length || 0) > 5 && (
                <div className="text-xs text-gray-500 dark:text-slate-500 italic pt-1">
                  +{(message.metadata?.ragSources?.length || 0) - 5} more sources
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Debug Metadata (for agent messages only) */}
        {!isUser && message.metadata && (
          <div className="mt-2">
            <button
              onClick={() => setShowMetadata(!showMetadata)}
              className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300 transition-colors"
            >
              {showMetadata ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
              <span>View metadata</span>
            </button>
            <AnimatePresence>
              {showMetadata && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 p-3 rounded-lg bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs overflow-hidden"
                >
                  <div className="space-y-2 font-mono">
                    {message.metadata.model && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 dark:text-slate-500">Model:</span>
                        <span className="text-gray-900 dark:text-slate-100 bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{message.metadata.model}</span>
                      </div>
                    )}
                    {message.metadata.ragContext !== undefined && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 dark:text-slate-500">RAG Context:</span>
                        <span className={`px-1.5 py-0.5 rounded ${message.metadata.ragContext ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400'}`}>
                          {message.metadata.ragContext ? "Yes" : "No"}
                        </span>
                      </div>
                    )}
                    {message.metadata.ragOutcome && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 dark:text-slate-500">RAG Outcome:</span>
                        <span className={`px-1.5 py-0.5 rounded ${message.metadata.ragOutcome === 'answered' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'}`}>
                          {message.metadata.ragOutcome === 'answered' ? 'Answered' : 'IDK (Low confidence)'}
                        </span>
                      </div>
                    )}
                    {message.metadata.ragIdkReason && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 dark:text-slate-500">IDK Reason:</span>
                        <span className="text-yellow-600 dark:text-yellow-400">{message.metadata.ragIdkReason}</span>
                      </div>
                    )}
                    {message.metadata.tokensUsed !== undefined && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 dark:text-slate-500">Tokens:</span>
                        <span className="text-gray-900 dark:text-slate-100">{message.metadata.tokensUsed.toLocaleString()}</span>
                      </div>
                    )}
                    {message.metadata.ragSources && message.metadata.ragSources.length > 0 && (
                      <div>
                        <span className="text-gray-500 dark:text-slate-500">RAG Sources ({message.metadata.ragSources.length}):</span>
                        <div className="mt-1 space-y-1 pl-2 max-h-40 overflow-y-auto">
                          {message.metadata.ragSources.map((source, idx) => (
                            <div key={`${source.documentId}-${source.chunkIndex}`} className="text-gray-700 dark:text-slate-300">
                              <span className="text-purple-600 dark:text-purple-400">#{idx + 1}</span>{" "}
                              {source.documentName || source.documentId.substring(0, 8)}...
                              <span className="text-gray-500 dark:text-slate-500"> (chunk {source.chunkIndex}, {(source.similarity * 100).toFixed(1)}%)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

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
          {isUser && (
            <CheckCheck className="w-3 h-3 text-cyan-500 dark:text-cyan-400" />
          )}
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
        <span className="text-sm text-purple-600 dark:text-purple-400">
          RAG-Powered Responses
        </span>
      </div>
    </motion.div>
  );
}

// Paywall message component for blocked chat
function PaywallMessage({
  agentName,
  onUnlock,
}: {
  agentName: string;
  onUnlock: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center h-full text-center px-4"
    >
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-100 dark:from-amber-600/20 to-orange-100 dark:to-orange-600/20 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center mb-6">
        <Lock className="w-10 h-10 text-amber-500 dark:text-amber-400" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Premium Agent
      </h2>
      <p className="text-gray-600 dark:text-slate-400 max-w-md mb-6">
        {agentName} is a premium agent. Unlock access to start chatting and get
        expert-level insights.
      </p>
      <button
        onClick={onUnlock}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold transition-all shadow-lg shadow-purple-500/20"
      >
        <Crown className="w-5 h-5" />
        Unlock Access
      </button>
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
  const [showPaywall, setShowPaywall] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [useWebSearch, setUseWebSearch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { data: currentUser } = useCurrentUser();
  const { data: conversations, isLoading: conversationsLoading } =
    useConversations();
  const deleteConversation = useDeleteConversation();

  const {
    data: conversation,
    isLoading,
    error,
  } = useConversation(conversationId);
  const sendMessage = useSendMessage(conversationId);

  // Check entitlement for the agent in this conversation
  // The useAgentAccessInfo hook will make API call to check access server-side
  const agentId = conversation?.agentId || "";
  const {
    hasAccess,
    isLoading: checkingAccess,
    needsPayment,
    pricePerMessage,
    pricePerConversation,
  } = useAgentAccessInfo(
    agentId,
    false // Assume not free, let server determine access
  );

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
      await sendMessage.mutateAsync({
        content,
        useRag: true,
        useWebSearch,
      });
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

  const handleDeleteConversation = async (convId: string) => {
    try {
      await deleteConversation.mutateAsync(convId);
      setDeleteConfirmId(null);
      // If deleting current conversation, navigate to dashboard
      if (convId === conversationId) {
        router.push("/student/dashboard");
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  };

  if (isLoading || checkingAccess) {
    return (
      <div className="h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-purple-500 dark:text-purple-400 animate-spin" />
          <p className="text-gray-600 dark:text-slate-400">
            {checkingAccess ? "Checking access..." : "Loading conversation..."}
          </p>
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

  // Filter conversations by search
  const filteredConversations =
    conversations?.filter(
      (conv) =>
        conv.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.agent?.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  // Format date
  const formatDate = (date: string) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex">
      {/* Conversation History Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-80" : "w-0"
        } flex-shrink-0 border-r border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 overflow-hidden flex flex-col`}
      >
        {sidebarOpen && (
          <>
            {/* Sidebar Header */}
            <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-slate-800">
              <button
                onClick={() => router.push("/student/dashboard")}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold transition-all shadow-lg shadow-purple-500/20 mb-3"
              >
                <Plus className="w-5 h-5" />
                New Chat
              </button>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 focus:outline-none focus:border-purple-500 text-sm"
                />
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {conversationsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <History className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {searchQuery
                      ? "No conversations found"
                      : "No conversations yet"}
                  </p>
                </div>
              ) : (
                <div className="p-2">
                  {filteredConversations.map((conv) => (
                    <div
                      key={conv.id}
                      className={`relative rounded-lg mb-1 transition-all group ${
                        conv.id === conversationId
                          ? "bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-500/30"
                          : "hover:bg-gray-100 dark:hover:bg-slate-800 border border-transparent"
                      }`}
                    >
                      {deleteConfirmId === conv.id ? (
                        // Delete confirmation
                        <div className="px-3 py-3">
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">Delete this chat?</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDeleteConversation(conv.id)}
                              disabled={deleteConversation.isPending}
                              className="flex-1 px-3 py-1.5 text-xs font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50"
                            >
                              {deleteConversation.isPending ? "Deleting..." : "Delete"}
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="flex-1 px-3 py-1.5 text-xs font-medium bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Normal conversation item
                        <button
                          onClick={() => router.push(`/student/chat/${conv.id}`)}
                          className="w-full text-left px-3 py-3"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center flex-shrink-0">
                              <Bot className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {conv.title || conv.agent?.name || "New Chat"}
                              </h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {conv.agent?.name}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                  {formatDate(conv.updatedAt)}
                                </span>
                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                  •
                                </span>
                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                  {0} messages
                                </span>
                              </div>
                            </div>
                            {/* Delete button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirmId(conv.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar Footer */}
            <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                {currentUser?.profileImageUrl ? (
                  <Image
                    src={currentUser.profileImageUrl}
                    alt={currentUser.username || "User"}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {currentUser?.firstName || currentUser?.username || "User"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    @{currentUser?.username}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex-shrink-0 border-b border-gray-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <div className="px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                {sidebarOpen ? (
                  <PanelLeftClose className="w-5 h-5 text-gray-500 dark:text-slate-400" />
                ) : (
                  <PanelLeft className="w-5 h-5 text-gray-500 dark:text-slate-400" />
                )}
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-semibold text-gray-900 dark:text-white">
                    {agentName}
                  </h1>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                    <span>Online</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Context indicator */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                <BookOpen className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                <span className="text-sm text-gray-700 dark:text-slate-300">
                  Powered by {agentName}&apos;s Knowledge
                </span>
              </div>
              
              {/* Delete current chat button */}
              <button
                onClick={() => setDeleteConfirmId(conversationId)}
                className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-all"
                title="Delete chat"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Messages Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-6">
            {needsPayment ? (
              <PaywallMessage
                agentName={agentName}
                onUnlock={() => setShowPaywall(true)}
              />
            ) : messages.length === 0 ? (
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
            {needsPayment ? (
              <div className="text-center py-2">
                <p className="text-gray-500 dark:text-slate-400 text-sm">
                  Unlock this agent to start chatting
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <button
                    onClick={() => setUseWebSearch(!useWebSearch)}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      useWebSearch
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700"
                        : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                    <span>Web Search</span>
                  </button>
                </div>
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
              </>
            )}
          </div>
        </footer>
      </div>

      {/* Paywall Modal */}
      {conversation?.agent && (
        <PaywallModal
          isOpen={showPaywall}
          onClose={() => setShowPaywall(false)}
          agent={{
            id: conversation.agentId,
            name: conversation.agent.name,
            description: conversation.agent.tagline,
            pricePerMessage: pricePerMessage || 0,
            pricePerConversation: pricePerConversation || 0,
            profileImageUrl: conversation.agent.profileImageUrl,
          }}
        />
      )}

      {/* Delete Confirmation Modal (for header delete) */}
      <AnimatePresence>
        {deleteConfirmId === conversationId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setDeleteConfirmId(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm mx-4 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Delete Chat</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">This cannot be undone</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to delete this conversation with <strong>{agentName}</strong>? All messages will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteConversation(conversationId)}
                  disabled={deleteConversation.isPending}
                  className="flex-1 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-colors disabled:opacity-50"
                >
                  {deleteConversation.isPending ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
