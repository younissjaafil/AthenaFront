"use client";

import { useEffect, useState } from "react";

interface LogRow {
  id: string;
  createdAt: string;
  useCase: string;
  agentId: string;
  query: string;
  topK: number;
  retrievedCount: number;
  maxSimilarity?: number;
  rerankUsed: boolean;
  latencyMs: number;
  retrievalMs: number;
  openaiMs: number;
  outcome: string;
  feedback?: "up" | "down";
}

export default function EnterpriseMonitorPage() {
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useCase, setUseCase] = useState<string>("");
  const [outcome, setOutcome] = useState<string>("");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("limit", "50");
      if (useCase) params.set("useCase", useCase);
      if (outcome) params.set("outcome", outcome);
      const res = await fetch(`/api/enterprise/logs?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to load logs");
      }
      setLogs(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load logs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useCase, outcome]);

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
              Monitoring
            </p>
            <h1 className="text-2xl font-semibold text-slate-900">
              Enterprise RAG Logs
            </h1>
            <p className="text-sm text-slate-600">
              Recent queries with latency, outcome, and feedback.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              value={useCase}
              onChange={(e) => setUseCase(e.target.value)}
            >
              <option value="">All use-cases</option>
              <option value="wesuite">WeSuite</option>
              <option value="sales">Sales</option>
            </select>
            <select
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
            >
              <option value="">All outcomes</option>
              <option value="answered">Answered</option>
              <option value="idk">I don’t know</option>
            </select>
            <button
              onClick={load}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
              disabled={loading}
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <Header>When</Header>
                <Header>Use-case</Header>
                <Header>Outcome</Header>
                <Header>Latency</Header>
                <Header>Retrieval</Header>
                <Header>LLM</Header>
                <Header>TopK</Header>
                <Header>Retrieved</Header>
                <Header>Max sim</Header>
                <Header>Feedback</Header>
                <Header>Query</Header>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="text-xs text-slate-800">
                  <Cell>{new Date(log.createdAt).toLocaleString()}</Cell>
                  <Cell className="font-semibold uppercase tracking-wide text-slate-700">
                    {log.useCase}
                  </Cell>
                  <Cell>
                    <Badge
                      color={
                        log.outcome === "answered" ? "emerald" : "amber"
                      }
                      text={log.outcome}
                    />
                  </Cell>
                  <Cell>{log.latencyMs} ms</Cell>
                  <Cell>{log.retrievalMs} ms</Cell>
                  <Cell>{log.openaiMs} ms</Cell>
                  <Cell>{log.topK}</Cell>
                  <Cell>{log.retrievedCount}</Cell>
                  <Cell>
                    {log.maxSimilarity !== undefined
                      ? `${(log.maxSimilarity * 100).toFixed(1)}%`
                      : "—"}
                  </Cell>
                  <Cell>
                    {log.feedback ? (
                      <span>{log.feedback === "up" ? "👍" : "👎"}</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </Cell>
                  <Cell className="max-w-xs truncate">
                    {log.query}
                  </Cell>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td
                    colSpan={11}
                    className="px-4 py-6 text-center text-sm text-slate-500"
                  >
                    {loading ? "Loading..." : "No logs yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

function Header({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </th>
  );
}

function Cell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={`px-3 py-2 ${className}`}>
      <div className="text-slate-800">{children}</div>
    </td>
  );
}

function Badge({ text, color }: { text: string; color: "emerald" | "amber" }) {
  const palette =
    color === "emerald"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-amber-50 text-amber-700 border-amber-200";
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-[2px] text-[11px] font-semibold uppercase ${palette}`}
    >
      {text}
    </span>
  );
}

