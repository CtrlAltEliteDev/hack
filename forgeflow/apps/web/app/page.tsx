"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Cpu, GitBranch, Package, ArrowRight, Sparkles } from "lucide-react";
import { startGeneration } from "@/lib/api";

const STACK_OPTIONS = [
  "Next.js + FastAPI + Postgres",
  "Next.js + Node.js + MongoDB",
  "React + Django + Postgres",
  "Vue + FastAPI + SQLite",
  "Next.js + Supabase",
  "React Native + FastAPI",
];

export default function HomePage() {
  const router = useRouter();
  const [idea, setIdea] = useState("");
  const [stack, setStack] = useState(STACK_OPTIONS[0]);
  const [customStack, setCustomStack] = useState("");
  const [teamSize, setTeamSize] = useState(1);
  const [deadline, setDeadline] = useState("5 days");
  const [constraints, setConstraints] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await startGeneration({
        idea: idea.trim(),
        stack: customStack.trim() || stack,
        team_size: teamSize,
        deadline,
        constraints: constraints.trim(),
      });
      router.push(`/project/${res.project_id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border/50 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">ForgeFlow</span>
          </div>
          <a
            href="/projects"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Past projects
          </a>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 pt-20 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium mb-6">
          <Sparkles className="w-3 h-3" />
          Multi-agent AI workflow
        </div>
        <h1 className="text-5xl font-bold tracking-tight mb-4 bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
          Idea → Execution Pack
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Turn any product idea, ticket, or PRD into a scoped MVP, architecture, DB schema, API routes, starter code, and README — in minutes.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-8">
          {[
            { icon: <GitBranch className="w-3 h-3" />, label: "MVP Scope" },
            { icon: <Cpu className="w-3 h-3" />, label: "Architecture" },
            { icon: <Package className="w-3 h-3" />, label: "Starter Code" },
            { icon: <Zap className="w-3 h-3" />, label: "6 AI Agents" },
          ].map((f) => (
            <span
              key={f.label}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-muted-foreground"
            >
              {f.icon} {f.label}
            </span>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-6 pb-24">
        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-2xl p-8 space-y-6 shadow-2xl"
        >
          {/* Idea */}
          <div>
            <label className="block text-sm font-medium mb-2">
              What do you want to build?{" "}
              <span className="text-violet-400">*</span>
            </label>
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              rows={4}
              placeholder='e.g. "A recruiter SaaS that uses AI to summarize video interviews and score candidates automatically"'
              className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-violet-500 placeholder:text-muted-foreground/50"
              required
            />
          </div>

          {/* Stack */}
          <div>
            <label className="block text-sm font-medium mb-2">Tech stack</label>
            <select
              value={stack}
              onChange={(e) => setStack(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
            >
              {STACK_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
              <option value="custom">Custom…</option>
            </select>
            {stack === "custom" && (
              <input
                type="text"
                value={customStack}
                onChange={(e) => setCustomStack(e.target.value)}
                placeholder="e.g. Remix + Rust + CockroachDB"
                className="mt-2 w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 placeholder:text-muted-foreground/50"
              />
            )}
          </div>

          {/* Team + Deadline */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Team size</label>
              <input
                type="number"
                min={1}
                max={20}
                value={teamSize}
                onChange={(e) => setTeamSize(Number(e.target.value))}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Deadline / timeline</label>
              <input
                type="text"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                placeholder="e.g. 5 days, 2 weeks"
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 placeholder:text-muted-foreground/50"
              />
            </div>
          </div>

          {/* Constraints */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Constraints{" "}
              <span className="text-muted-foreground text-xs font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              placeholder="e.g. no paid services, must run locally, mobile-first"
              className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 placeholder:text-muted-foreground/50"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !idea.trim()}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all text-sm"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Starting workflow…
              </>
            ) : (
              <>
                Forge my plan <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
