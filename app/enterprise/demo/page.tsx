"use client";

import { useEffect, useMemo, useState } from "react";
import { apiClient } from "@/lib/api-client";

type UseCase = "wesuite" | "sales";

interface Citation {
  documentId: string;
  chunkIndex: number;
  similarity: number;
  snippet?: string;
  metadata?: {
    heading?: string;
    section?: string;
    pageNumber?: number;
    [key: string]: unknown;
  };
}

interface Stats {
  latencyMs: number;
  retrievalMs: number;
  openaiMs: number;
  topK: number;
  retrievedCount: number;
  totalTokensApprox: number;
  model: string;
}

interface QueryResponse {
  answer: string;
  citations: Citation[];
  stats: Stats;
  logId?: string;
}

interface IngestResponse {
  documentId: string;
  agentId: string;
  chunksCreated: number;
  status: string;
  latencyMs: number;
}

const heroGradient =
  "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white";

export default function EnterpriseDemoPage() {
  const [useCase, setUseCase] = useState<UseCase>("wesuite");
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [citations, setCitations] = useState<Citation[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [logId, setLogId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [ingestStatus, setIngestStatus] = useState<IngestResponse | null>(null);
  const [ingesting, setIngesting] = useState(false);
  const [ingestError, setIngestError] = useState<string | null>(null);

  const headline = useMemo(
    () =>
      useCase === "wesuite"
        ? "WeSuite-style Sales Support"
        : "Sales Enablement Assistant",
    [useCase]
  );

  const subhead = useMemo(
    () =>
      useCase === "wesuite"
        ? "Quote-to-close support over SOPs, pricing policies, and sales playbooks."
        : "Concise sales answers plus draft email and objection handling, grounded in your pitch, pricing, and competitive notes.",
    [useCase]
  );

  async function runQuery() {
    setLoading(true);
    setError(null);
    setAnswer(null);
    setCitations([]);
    setStats(null);
    try {
      const { data } = await apiClient.post<QueryResponse>("/enterprise/query", {
        useCase,
        query,
        topK: useCase === "sales" ? 8 : 6,
        rerank: true,
      });
      setAnswer(data.answer);
      setCitations(data.citations || []);
      setStats(data.stats || null);
      setLogId(data.logId);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Query failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function submitFeedback(feedback: "up" | "down") {
    if (!logId) return;
    try {
      await apiClient.post("/enterprise/feedback", { logId, feedback });
    } catch {
      // best-effort; ignore errors
    }
  }

  async function ingest() {
    if (!file) {
      setIngestError("Please select a file to ingest.");
      return;
    }
    setIngesting(true);
    setIngestStatus(null);
    setIngestError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("useCase", useCase);
      const res = await fetch("/api/enterprise/ingest", {
        method: "POST",
        body: form,
      });
      const data = (await res.json()) as IngestResponse;
      if (!res.ok) {
        throw new Error((data as any)?.message || "Ingest failed");
      }
      setIngestStatus(data);
    } catch (err: any) {
      setIngestError(err?.message || "Ingest failed. Please try again.");
    } finally {
      setIngesting(false);
    }
  }

  useEffect(() => {
    setAnswer(null);
    setCitations([]);
    setStats(null);
    setLogId(undefined);
  }, [useCase]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className={`${heroGradient} pb-14 pt-10 shadow-lg`}>
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-300">
            Enterprise AI Assistant
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold leading-tight">{headline}</h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-200">{subhead}</p>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm text-slate-200">Use case</label>
              <select
                className="rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-400 focus:outline-none"
                value={useCase}
                onChange={(e) => setUseCase(e.target.value as UseCase)}
              >
                <option value="wesuite">
                  WeSuite-style Quote-to-Close Support
                </option>
                <option value="sales">Sales Enablement</option>
              </select>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <HighlightCard
              title="Ingest"
              body="Upload PDFs, DOCX, or text; chunked and embedded into Qdrant."
            />
            <HighlightCard
              title="Retrieve"
              body="Top-k semantic search with guardrails and optional rerank."
            />
            <HighlightCard
              title="Answer"
              body="Concise, cited responses with latency and token stats."
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10 space-y-10">
        <section className="grid gap-6 lg:grid-cols-2">
          <Card title="Ask a question" description="Grounded answers with citations.">
            <textarea
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
              rows={4}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                useCase === "wesuite"
                  ? "e.g., What are the onboarding steps for a new enterprise customer?"
                  : "e.g., Draft a pricing follow-up and handle a competitor objection."
              }
            />
            <div className="mt-3 flex items-center justify-between">
              <button
                onClick={runQuery}
                disabled={loading || !query.trim()}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {loading ? "Thinking…" : "Ask"}
              </button>
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
          </Card>

          <Card
            title="Ingest a document"
            description="Upload a doc into the selected use-case. Auth is required upstream."
          >
            <div className="space-y-3">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt,.md,.html,.csv,.json"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="text-sm"
              />
              <button
                onClick={ingest}
                disabled={ingesting || !file}
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-300"
              >
                {ingesting ? "Processing…" : "Ingest"}
              </button>
              {ingestError && <p className="text-sm text-red-600">{ingestError}</p>}
              {ingestStatus && (
                <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                  <div className="font-semibold">Ingested</div>
                  <div>Document: {ingestStatus.documentId}</div>
                  <div>Chunks: {ingestStatus.chunksCreated}</div>
                  <div>Status: {ingestStatus.status}</div>
                  <div>Latency: {ingestStatus.latencyMs} ms</div>
                </div>
              )}
            </div>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card title="Answer" description="Concise, grounded response.">
            {answer ? (
              <div className="prose prose-sm max-w-none whitespace-pre-wrap text-slate-800">
                {answer}
              </div>
            ) : (
              <Placeholder text="Ask a question to see the answer here." />
            )}
            {stats && (
              <>
                <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
                  <Badge
                    label="Retrieved"
                    value={`${stats.retrievedCount} chunks`}
                  />
                  <Badge
                    label="Grounded"
                    value={
                      computeGrounded(citations) ? "Yes (in docs)" : "No / weak"
                    }
                  />
                  <Badge
                    label="Latency"
                    value={`${(stats.latencyMs / 1000).toFixed(1)} s`}
                  />
                  <Badge
                    label="Tokens"
                    value={`${stats.totalTokensApprox}`}
                  />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <Stat label="Latency" value={`${stats.latencyMs} ms`} />
                  <Stat label="Retrieval" value={`${stats.retrievalMs} ms`} />
                  <Stat label="LLM" value={`${stats.openaiMs} ms`} />
                  <Stat label="TopK" value={String(stats.topK)} />
                  <Stat
                    label="Retrieved"
                    value={String(stats.retrievedCount)}
                  />
                  <Stat
                    label="Tokens"
                    value={String(stats.totalTokensApprox)}
                  />
                  <Stat label="Model" value={stats.model} />
                </div>
              </>
            )}
            {logId && (
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-600">
                <span>Feedback:</span>
                <button
                  onClick={() => submitFeedback("up")}
                  className="rounded border border-slate-200 px-2 py-1 transition hover:bg-slate-100"
                >
                  👍
                </button>
                <button
                  onClick={() => submitFeedback("down")}
                  className="rounded border border-slate-200 px-2 py-1 transition hover:bg-slate-100"
                >
                  👎
                </button>
              </div>
            )}
          </Card>

          <Card title="Citations" description="Top chunks with similarity.">
            {citations.length === 0 && (
              <Placeholder text="Citations will appear once you run a query." />
            )}
            <div className="space-y-3">
              {citations.map((c, idx) => (
                <div
                  key={`${c.documentId}-${c.chunkIndex}-${idx}`}
                  className="rounded-md border border-slate-200 bg-white p-3 shadow-sm"
                >
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <div className="font-semibold text-slate-800">
                      {c.metadata?.heading || `Doc ${c.documentId}`}
                      {c.metadata?.section && (
                        <span className="text-slate-500">
                          {" "}
                          • {c.metadata.section}
                        </span>
                      )}
                    </div>
                    <div>Score {(c.similarity * 100).toFixed(1)}%</div>
                  </div>
                  {c.snippet && (
                    <p className="mt-2 text-sm text-slate-700">
                      {c.snippet.length > 260
                        ? `${c.snippet.slice(0, 260)}…`
                        : c.snippet}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
}

function HighlightCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-slate-800/40 bg-slate-800/60 px-4 py-3 shadow-sm backdrop-blur">
      <div className="text-sm font-semibold text-white">{title}</div>
      <div className="mt-1 text-xs text-slate-200/90">{body}</div>
    </div>
  );
}

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-base font-semibold text-slate-900">{title}</div>
          {description && (
            <div className="text-xs text-slate-600">{description}</div>
          )}
        </div>
        <div className="h-2 w-2 rounded-full bg-emerald-500" />
      </div>
      <div className="mt-3 space-y-3">{children}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded border border-slate-200 bg-slate-50 px-2 py-1">
      <span className="text-[11px] uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <span className="text-[11px] font-semibold text-slate-800">{value}</span>
    </div>
  );
}

function Placeholder({ text }: { text: string }) {
  return (
    <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
      {text}
    </div>
  );
}

function Badge({ label, value }: { label: string; value: string }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-[3px] shadow-sm">
      <span className="text-[10px] uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <span className="text-[11px] font-semibold text-slate-800">{value}</span>
    </div>
  );
}

function computeGrounded(citations: Citation[]): boolean {
  if (!citations.length) return false;
  const maxSim = Math.max(...citations.map((c) => c.similarity));
  return maxSim >= 0.55;
}

