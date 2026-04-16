"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Circle, Loader2, AlertCircle } from "lucide-react";
import { getProject, Project } from "@/lib/api";
import { OutputTabs } from "@/components/output-tabs";

const STEPS = [
  { key: "intake_done", label: "Intake", desc: "Parsing your idea" },
  { key: "pm_done", label: "PM Agent", desc: "Scoping MVP" },
  { key: "architect_done", label: "Architect", desc: "Designing system" },
  { key: "scaffold_done", label: "Scaffold", desc: "Generating code" },
  { key: "reviewer_done", label: "Reviewer", desc: "Reviewing plan" },
  { key: "delivery_done", label: "Delivery", desc: "Writing README" },
];

function stepIndex(currentStep: string): number {
  return STEPS.findIndex((s) => s.key === currentStep);
}

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!projectId) return;

    let interval: NodeJS.Timeout;

    const poll = async () => {
      try {
        const p = await getProject(projectId);
        setProject(p);
        if (p.status === "done" || p.status.startsWith("error")) {
          clearInterval(interval);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load project");
        clearInterval(interval);
      }
    };

    poll();
    interval = setInterval(poll, 2000);
    return () => clearInterval(interval);
  }, [projectId]);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <p className="text-muted-foreground">{error}</p>
          <button onClick={() => router.push("/")} className="text-sm text-violet-400 hover:underline">
            Go home
          </button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  const isDone = project.status === "done";
  const isError = project.status.startsWith("error");
  const isRunning = project.status === "running";
  const activeStep = stepIndex(project.artifacts?.scope ? "pm_done" :
    project.artifacts?.architecture ? "architect_done" :
    project.artifacts?.scaffold ? "scaffold_done" :
    project.artifacts?.review ? "reviewer_done" :
    project.artifacts?.delivery ? "delivery_done" : "");

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border/50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> New project
          </button>
          <div className="h-4 w-px bg-border" />
          <h1 className="text-sm font-medium truncate max-w-lg">{project.title}</h1>
          {isDone && (
            <span className="ml-auto flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
              <CheckCircle2 className="w-3 h-3" /> Complete
            </span>
          )}
          {isRunning && (
            <span className="ml-auto flex items-center gap-1.5 text-xs text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded-full">
              <Loader2 className="w-3 h-3 animate-spin" /> Running
            </span>
          )}
          {isError && (
            <span className="ml-auto flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-full">
              <AlertCircle className="w-3 h-3" /> Error
            </span>
          )}
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Progress pipeline */}
        {!isDone && !isError && (
          <div className="mb-10">
            <div className="flex items-center gap-0">
              {STEPS.map((step, i) => {
                const done = isDone || (project.artifacts && (
                  (i === 0 && project.artifacts.parsed_input) ||
                  (i === 1 && project.artifacts.scope) ||
                  (i === 2 && project.artifacts.architecture) ||
                  (i === 3 && project.artifacts.scaffold) ||
                  (i === 4 && project.artifacts.review) ||
                  (i === 5 && project.artifacts.delivery)
                ));
                const active = !done && i === activeStep + 1;
                return (
                  <div key={step.key} className="flex items-center flex-1">
                    <div className="flex flex-col items-center min-w-0 flex-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        done ? "bg-violet-600 text-white" :
                        active ? "bg-violet-500/20 border-2 border-violet-500 text-violet-400" :
                        "bg-white/5 border border-white/10 text-muted-foreground"
                      }`}>
                        {done ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : active ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground mt-1.5 text-center">{step.label}</span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`h-px flex-1 mx-1 transition-colors ${done ? "bg-violet-600" : "bg-white/10"}`} />
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Agents are working… results will appear below as each step completes.
            </p>
          </div>
        )}

        {/* Results */}
        {(isDone || Object.keys(project.artifacts).length > 0) && (
          <OutputTabs artifacts={project.artifacts} isDone={isDone} />
        )}

        {isError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
            <p className="text-red-300 font-medium">Workflow failed</p>
            <p className="text-sm text-muted-foreground mt-1">{project.status}</p>
          </div>
        )}
      </div>
    </div>
  );
}
