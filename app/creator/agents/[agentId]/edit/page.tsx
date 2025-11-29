"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAgent, useUpdateAgent, useDeleteAgent } from "@/hooks/useAgents";
import {
  AIModel,
  AgentVisibility,
  AgentStatus,
  AGENT_CATEGORIES,
  AI_MODEL_DISPLAY,
  type UpdateAgentDto,
} from "@/lib/types/agent";

export default function EditAgentPage() {
  const router = useRouter();
  const params = useParams();
  const agentId = params.agentId as string;

  const { data: agent, isLoading, error } = useAgent(agentId);
  const updateAgent = useUpdateAgent();
  const deleteAgent = useDeleteAgent();

  const [formData, setFormData] = useState<UpdateAgentDto>({});
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<
    "basic" | "ai" | "pricing" | "advanced"
  >("basic");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize form with agent data
  useEffect(() => {
    if (agent) {
      setFormData({
        name: agent.name,
        tagline: agent.tagline || "",
        description: agent.description,
        systemPrompt: agent.systemPrompt,
        welcomeMessage: agent.welcomeMessage || "",
        model: agent.model,
        temperature: agent.temperature,
        maxTokens: agent.maxTokens,
        category: agent.category,
        tags: agent.tags || [],
        isFree: agent.isFree,
        pricePerMonth: agent.pricePerMonth,
        visibility: agent.visibility,
        status: agent.status,
        ragEnabled: agent.ragEnabled,
        ragContextSize: agent.ragContextSize,
        ragSimilarityThreshold: agent.ragSimilarityThreshold,
      });
    }
  }, [agent]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? parseFloat(value) || 0
          : value,
    }));
    setHasChanges(true);

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()],
      }));
      setTagInput("");
      setHasChanges(true);
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((t) => t !== tag),
    }));
    setHasChanges(true);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) newErrors.name = "Name is required";
    if (!formData.description?.trim())
      newErrors.description = "Description is required";
    if (!formData.systemPrompt?.trim())
      newErrors.systemPrompt = "System prompt is required";
    if (!formData.category) newErrors.category = "Category is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      if (errors.name || errors.description || errors.category) {
        setActiveTab("basic");
      } else if (errors.systemPrompt) {
        setActiveTab("ai");
      }
      return;
    }

    try {
      await updateAgent.mutateAsync({ id: agentId, data: formData });
      setHasChanges(false);
    } catch (error: any) {
      console.error("Failed to update agent:", error);
      setErrors({
        submit: error.response?.data?.message || "Failed to update agent",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAgent.mutateAsync(agentId);
      router.push("/creator/agents");
    } catch (error: any) {
      console.error("Failed to delete agent:", error);
      setErrors({
        submit: error.response?.data?.message || "Failed to delete agent",
      });
      setShowDeleteModal(false);
    }
  };

  const tabs = [
    { id: "basic", label: "Basic Info", icon: "📝" },
    { id: "ai", label: "AI Config", icon: "🤖" },
    { id: "pricing", label: "Pricing", icon: "💰" },
    { id: "advanced", label: "Advanced", icon: "⚙️" },
  ] as const;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error || !agent) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Agent not found
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          The agent you&apos;re looking for doesn&apos;t exist or you don&apos;t
          have access.
        </p>
        <Link href="/creator/agents" className="btn-primary">
          Back to Agents
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Link
          href="/creator/agents"
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-brand-purple-600 dark:hover:text-brand-purple-400 mb-2 inline-block"
        >
          ← Back to Agents
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Edit Agent
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {agent.name}
            </p>
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            Delete Agent
          </button>
        </div>
      </motion.div>

      {/* Unsaved Changes Banner */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 flex items-center justify-between"
        >
          <p className="text-yellow-700 dark:text-yellow-300 text-sm">
            You have unsaved changes
          </p>
          <button
            onClick={handleSubmit}
            disabled={updateAgent.isPending}
            className="btn-primary text-sm px-4 py-1"
          >
            {updateAgent.isPending ? "Saving..." : "Save Changes"}
          </button>
        </motion.div>
      )}

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-800"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === tab.id
                ? "text-brand-purple-600 dark:text-brand-purple-400"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-purple-600 dark:bg-brand-purple-400"
              />
            )}
          </button>
        ))}
      </motion.div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-900 rounded-xl border border-border-light dark:border-gray-800 p-6 mb-6"
        >
          {/* Basic Info Tab */}
          {activeTab === "basic" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Agent Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.name
                      ? "border-red-500"
                      : "border-gray-200 dark:border-gray-700"
                  } bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-purple-500`}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tagline
                </label>
                <input
                  type="text"
                  name="tagline"
                  value={formData.tagline || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description || ""}
                  onChange={handleChange}
                  rows={4}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.description
                      ? "border-red-500"
                      : "border-gray-200 dark:border-gray-700"
                  } bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-purple-500 resize-none`}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.description}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-purple-500"
                >
                  {AGENT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                </label>
                <div className="flex gap-2 mb-2 flex-wrap">
                  {formData.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-purple-100 dark:bg-brand-purple-900/30 text-brand-purple-700 dark:text-brand-purple-300 text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && (e.preventDefault(), handleAddTag())
                    }
                    placeholder="Add a tag..."
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-purple-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* AI Config Tab */}
          {activeTab === "ai" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  System Prompt <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="systemPrompt"
                  value={formData.systemPrompt || ""}
                  onChange={handleChange}
                  rows={8}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.systemPrompt
                      ? "border-red-500"
                      : "border-gray-200 dark:border-gray-700"
                  } bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-purple-500 resize-none font-mono text-sm`}
                />
                {errors.systemPrompt && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.systemPrompt}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Welcome Message
                </label>
                <textarea
                  name="welcomeMessage"
                  value={formData.welcomeMessage || ""}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-purple-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  AI Model
                </label>
                <select
                  name="model"
                  value={formData.model || AIModel.GPT_35_TURBO}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-purple-500"
                >
                  {Object.entries(AI_MODEL_DISPLAY).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Temperature: {formData.temperature}
                </label>
                <input
                  type="range"
                  name="temperature"
                  min="0"
                  max="2"
                  step="0.1"
                  value={formData.temperature || 0.7}
                  onChange={handleChange}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Tokens
                </label>
                <input
                  type="number"
                  name="maxTokens"
                  min="100"
                  max="8000"
                  value={formData.maxTokens || 2000}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-purple-500"
                />
              </div>
            </div>
          )}

          {/* Pricing Tab */}
          {activeTab === "pricing" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div>
                  <label className="font-medium text-gray-900 dark:text-white">
                    Free Agent
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Anyone can use this agent for free
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isFree"
                    checked={formData.isFree || false}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-purple-300 dark:peer-focus:ring-brand-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-purple-600"></div>
                </label>
              </div>

              {!formData.isFree && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Monthly Price (USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      name="pricePerMonth"
                      min="0"
                      step="0.01"
                      value={formData.pricePerMonth || 0}
                      onChange={handleChange}
                      className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-purple-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Visibility
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      value: AgentVisibility.PRIVATE,
                      label: "Private",
                      icon: "🔒",
                      desc: "Only you",
                    },
                    {
                      value: AgentVisibility.UNLISTED,
                      label: "Unlisted",
                      icon: "🔗",
                      desc: "Link only",
                    },
                    {
                      value: AgentVisibility.PUBLIC,
                      label: "Public",
                      icon: "🌍",
                      desc: "Everyone",
                    },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          visibility: option.value,
                        }));
                        setHasChanges(true);
                      }}
                      className={`p-4 rounded-lg border text-center transition-all ${
                        formData.visibility === option.value
                          ? "border-brand-purple-500 bg-brand-purple-50 dark:bg-brand-purple-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                    >
                      <span className="text-2xl mb-1 block">{option.icon}</span>
                      <span className="font-medium text-gray-900 dark:text-white text-sm block">
                        {option.label}
                      </span>
                      <span className="text-xs text-gray-500">
                        {option.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status || AgentStatus.DRAFT}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-purple-500"
                >
                  <option value={AgentStatus.DRAFT}>
                    Draft - Not visible to users
                  </option>
                  <option value={AgentStatus.ACTIVE}>
                    Active - Ready for users
                  </option>
                  <option value={AgentStatus.INACTIVE}>
                    Inactive - Temporarily disabled
                  </option>
                </select>
              </div>
            </div>
          )}

          {/* Advanced Tab */}
          {activeTab === "advanced" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div>
                  <label className="font-medium text-gray-900 dark:text-white">
                    Enable RAG (Knowledge Base)
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Allow agent to reference uploaded documents
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="ragEnabled"
                    checked={formData.ragEnabled || false}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-purple-300 dark:peer-focus:ring-brand-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-purple-600"></div>
                </label>
              </div>

              {formData.ragEnabled && (
                <>
                  {/* Documents Link */}
                  <Link
                    href={`/creator/agents/${agentId}/documents`}
                    className="flex items-center justify-between p-4 rounded-lg border border-brand-purple-200 dark:border-brand-purple-800 bg-brand-purple-50 dark:bg-brand-purple-950/30 hover:bg-brand-purple-100 dark:hover:bg-brand-purple-950/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-brand-purple-100 dark:bg-brand-purple-900/50 flex items-center justify-center">
                        <span className="text-xl">📚</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Manage Documents
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {agent.totalDocuments} document
                          {agent.totalDocuments !== 1 ? "s" : ""} uploaded
                        </p>
                      </div>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400 group-hover:text-brand-purple-600 transition-colors"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Context Size (chunks)
                    </label>
                    <input
                      type="number"
                      name="ragContextSize"
                      min="1"
                      max="20"
                      value={formData.ragContextSize || 5}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Similarity Threshold:{" "}
                      {formData.ragSimilarityThreshold || 0.7}
                    </label>
                    <input
                      type="range"
                      name="ragSimilarityThreshold"
                      min="0"
                      max="1"
                      step="0.05"
                      value={formData.ragSimilarityThreshold || 0.7}
                      onChange={handleChange}
                      className="w-full"
                    />
                  </div>
                </>
              )}

              {/* Stats */}
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                <h3 className="font-medium text-gray-900 dark:text-white mb-4">
                  Agent Statistics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-2xl font-bold text-brand-purple-600">
                      {agent.totalConversations}
                    </p>
                    <p className="text-sm text-gray-500">Conversations</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-brand-teal-500">
                      {agent.totalMessages}
                    </p>
                    <p className="text-sm text-gray-500">Messages</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                      {agent.averageRating > 0
                        ? `${agent.averageRating.toFixed(1)}★`
                        : "—"}
                    </p>
                    <p className="text-sm text-gray-500">Rating</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                      {agent.totalDocuments}
                    </p>
                    <p className="text-sm text-gray-500">Documents</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Error Message */}
        {errors.submit && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
            <p className="text-red-600 dark:text-red-400">{errors.submit}</p>
          </div>
        )}

        {/* Success Message */}
        {updateAgent.isSuccess && !hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800"
          >
            <p className="text-green-600 dark:text-green-400">
              ✓ Changes saved successfully
            </p>
          </motion.div>
        )}

        {/* Submit Button */}
        <div className="flex items-center justify-between">
          <Link
            href="/creator/agents"
            className="px-6 py-3 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Back to Agents
          </Link>
          <button
            type="submit"
            disabled={updateAgent.isPending || !hasChanges}
            className="btn-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateAgent.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      {/* Delete Modal */}
      {showDeleteModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDeleteModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="text-5xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Delete &quot;{agent.name}&quot;?
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                This action cannot be undone. All conversations and data will be
                permanently deleted.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleteAgent.isPending}
                  className="px-6 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteAgent.isPending}
                  className="px-6 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {deleteAgent.isPending ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="max-w-4xl mx-auto animate-pulse">
      <div className="mb-8">
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24 mb-4" />
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-48 mb-2" />
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-32" />
      </div>
      <div className="flex gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-24"
          />
        ))}
      </div>
      <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-xl" />
    </div>
  );
}
