"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useCreateAgent } from "@/hooks/useAgents";
import {
  AIModel,
  AgentStatus,
  AGENT_CATEGORIES,
  AI_MODEL_DISPLAY,
  type CreateAgentDto,
} from "@/lib/types/agent";

export default function NewAgentPage() {
  const router = useRouter();
  const createAgent = useCreateAgent();

  const [formData, setFormData] = useState<CreateAgentDto>({
    name: "",
    description: "",
    systemPrompt: "",
    model: AIModel.GPT_35_TURBO,
    temperature: 0.7,
    maxTokens: 2000,
    category: [AGENT_CATEGORIES[0]],
    tags: [],
    isFree: true,
    pricePerConversation: 0,
    isPublic: false,
    status: AgentStatus.DRAFT,
    useRag: true,
  });

  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<
    "basic" | "ai" | "pricing" | "advanced"
  >("basic");

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

    // Clear error when field is edited
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
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((t) => t !== tag),
    }));
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
      // Switch to tab with errors
      if (errors.name || errors.description || errors.category) {
        setActiveTab("basic");
      } else if (errors.systemPrompt) {
        setActiveTab("ai");
      }
      return;
    }

    try {
      const agent = await createAgent.mutateAsync(formData);
      router.push(`/creator/agents/${agent.id}/edit`);
    } catch (error: any) {
      console.error("Failed to create agent:", error);
      setErrors({
        submit: error.response?.data?.message || "Failed to create agent",
      });
    }
  };

  const tabs = [
    { id: "basic", label: "Basic Info", icon: "📝" },
    { id: "ai", label: "AI Config", icon: "🤖" },
    { id: "pricing", label: "Pricing", icon: "💰" },
    { id: "advanced", label: "Advanced", icon: "⚙️" },
  ] as const;

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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Create New Agent
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Configure your AI assistant with a custom personality and capabilities
        </p>
      </motion.div>

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
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Agent Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Python Tutor Pro"
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

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe what your agent does and how it helps users..."
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

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
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

              {/* Tags */}
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
              {/* System Prompt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  System Prompt <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Define your agent&apos;s personality, expertise, and behavior
                </p>
                <textarea
                  name="systemPrompt"
                  value={formData.systemPrompt}
                  onChange={handleChange}
                  rows={8}
                  placeholder="You are an expert Python programming tutor. Your goal is to help students understand Python concepts clearly and write clean, efficient code..."
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

              {/* Model Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  AI Model
                </label>
                <select
                  name="model"
                  value={formData.model}
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

              {/* Temperature */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Temperature: {formData.temperature}
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Lower = more focused, Higher = more creative
                </p>
                <input
                  type="range"
                  name="temperature"
                  min="0"
                  max="2"
                  step="0.1"
                  value={formData.temperature}
                  onChange={handleChange}
                  className="w-full"
                />
              </div>

              {/* Max Tokens */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Tokens
                </label>
                <input
                  type="number"
                  name="maxTokens"
                  min="100"
                  max="8000"
                  value={formData.maxTokens}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-purple-500"
                />
              </div>
            </div>
          )}

          {/* Pricing Tab */}
          {activeTab === "pricing" && (
            <div className="space-y-6">
              {/* Free Toggle */}
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
                    checked={formData.isFree}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-purple-300 dark:peer-focus:ring-brand-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-purple-600"></div>
                </label>
              </div>

              {/* Monthly Price */}
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
                      name="pricePerConversation"
                      min="0"
                      step="0.01"
                      value={formData.pricePerConversation}
                      onChange={handleChange}
                      className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-purple-500"
                    />
                  </div>
                </div>
              )}

              {/* Visibility */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Visibility
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      value: false,
                      label: "Private",
                      icon: "🔒",
                      desc: "Only you",
                    },
                    {
                      value: true,
                      label: "Public",
                      icon: "🌍",
                      desc: "Everyone",
                    },
                  ].map((option) => (
                    <button
                      key={String(option.value)}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          isPublic: option.value,
                        }))
                      }
                      className={`p-4 rounded-lg border text-center transition-all ${
                        formData.isPublic === option.value
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

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
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
              {/* RAG Toggle */}
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
                    name="useRag"
                    checked={formData.useRag}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-purple-300 dark:peer-focus:ring-brand-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-purple-600"></div>
                </label>
              </div>

              {formData.useRag && (
                <>
                  {/* RAG Max Results */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Max Results (chunks)
                    </label>
                    <input
                      type="number"
                      name="ragMaxResults"
                      min="1"
                      max="20"
                      value={formData.ragMaxResults || 5}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-purple-500"
                    />
                  </div>

                  {/* RAG Max Tokens */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Max Tokens for Context
                    </label>
                    <input
                      type="number"
                      name="ragMaxTokens"
                      min="500"
                      max="8000"
                      step="100"
                      value={formData.ragMaxTokens || 3000}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-purple-500"
                    />
                  </div>
                </>
              )}

              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  💡 You can upload documents after creating your agent. Go to
                  Documents to add knowledge base files.
                </p>
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

        {/* Submit Buttons */}
        <div className="flex items-center justify-between">
          <Link
            href="/creator/agents"
            className="px-6 py-3 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={createAgent.isPending}
            className="btn-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createAgent.isPending ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Creating...
              </span>
            ) : (
              "Create Agent"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
