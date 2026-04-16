"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { listProjects, Project } from "@/lib/api";
import { ArrowLeft, Zap, Clock, CheckCircle2, AlertCircle, Loader2, ArrowRight } from "lucide-react";

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listProjects()
      .then(setProjects)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border/50 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="font-semibold">ForgeFlow</span>
          </div>
          <span className="text-muted-foreground text-sm">/ Past Projects</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-6">Past Projects</h1>

        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
          </div>
        )}

        {!loading && projects.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <p>No projects yet.</p>
            <button onClick={() => router.push("/")} className="mt-4 text-violet-400 hover:underline text-sm">
              Create your first one →
            </button>
          </div>
        )}

        <div className="space-y-3">
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => router.push(`/project/${p.id}`)}
              className="w-full bg-card border border-border rounded-xl p-5 text-left hover:border-violet-500/50 transition-colors group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium truncate">{p.title}</p>
                  <p className="text-sm text-muted-foreground mt-1 truncate">{p.stack}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={p.status} />
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                <Clock className="w-3 h-3 inline mr-1" />
                {new Date(p.created_at).toLocaleString()}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "done") {
    return (
      <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
        <CheckCircle2 className="w-3 h-3" /> Done
      </span>
    );
  }
  if (status === "running") {
    return (
      <span className="flex items-center gap-1 text-xs text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/20">
        <Loader2 className="w-3 h-3 animate-spin" /> Running
      </span>
    );
  }
  if (status.startsWith("error")) {
    return (
      <span className="flex items-center gap-1 text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
        <AlertCircle className="w-3 h-3" /> Error
      </span>
    );
  }
  return (
    <span className="text-xs text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
      {status}
    </span>
  );
}
