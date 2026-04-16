"use client";

import { useState } from "react";
import { Artifacts, Scope, Architecture, Scaffold, Review, Delivery } from "@/lib/api";
import {
  Target, Cpu, Code2, ShieldAlert, FileText, Download,
  ChevronRight, CheckCircle2, XCircle, AlertTriangle, Star
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  artifacts: Artifacts;
  isDone: boolean;
}

const TABS = [
  { key: "scope", label: "Scope & Plan", icon: Target },
  { key: "architecture", label: "Architecture", icon: Cpu },
  { key: "scaffold", label: "Code Scaffold", icon: Code2 },
  { key: "review", label: "Review", icon: ShieldAlert },
  { key: "readme", label: "README", icon: FileText },
];

export function OutputTabs({ artifacts, isDone }: Props) {
  const [active, setActive] = useState("scope");

  const availableTabs = TABS.filter((t) => {
    if (t.key === "scope") return !!artifacts.scope;
    if (t.key === "architecture") return !!artifacts.architecture;
    if (t.key === "scaffold") return !!artifacts.scaffold;
    if (t.key === "review") return !!artifacts.review;
    if (t.key === "readme") return !!artifacts.delivery;
    return false;
  });

  if (availableTabs.length === 0) return null;

  const currentTab = availableTabs.find((t) => t.key === active) || availableTabs[0];

  return (
    <div className="animate-fade-in">
      {/* Tab bar */}
      <div className="flex gap-1 mb-6 border-b border-border overflow-x-auto pb-px">
        {availableTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = (active === tab.key) || (active === "scope" && availableTabs[0].key === tab.key && !availableTabs.find(t => t.key === active));
          return (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors",
                active === tab.key
                  ? "border-violet-500 text-violet-400"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
        {isDone && (
          <button
            onClick={() => downloadAll(artifacts)}
            className="ml-auto flex items-center gap-1.5 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export all
          </button>
        )}
      </div>

      {/* Tab content */}
      <div>
        {active === "scope" && artifacts.scope && <ScopePanel scope={artifacts.scope} />}
        {active === "architecture" && artifacts.architecture && <ArchPanel arch={artifacts.architecture} />}
        {active === "scaffold" && artifacts.scaffold && <ScaffoldPanel scaffold={artifacts.scaffold} />}
        {active === "review" && artifacts.review && <ReviewPanel review={artifacts.review} />}
        {active === "readme" && artifacts.delivery && <DeliveryPanel delivery={artifacts.delivery} />}
      </div>
    </div>
  );
}

/* ---- Scope Panel ---- */
function ScopePanel({ scope }: { scope: Scope }) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* MVP name */}
      <div className="bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-500/20 rounded-xl p-6">
        <h2 className="text-2xl font-bold">{scope.mvp_name}</h2>
        <p className="text-muted-foreground mt-1">{scope.one_liner}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* In scope */}
        <Card title="In Scope" accent="emerald">
          <ul className="space-y-2">
            {scope.in_scope?.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Out of scope */}
        <Card title="Out of Scope" accent="red">
          <ul className="space-y-2">
            {scope.out_of_scope?.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{f}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Milestones */}
      <Card title="Milestones">
        <div className="space-y-3">
          {scope.milestones?.map((m, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-xs font-bold text-violet-400 shrink-0">
                D{m.day}
              </div>
              <div>
                <p className="text-sm font-medium">{m.title}</p>
                <ul className="mt-1 space-y-0.5">
                  {m.deliverables?.map((d, j) => (
                    <li key={j} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <ChevronRight className="w-3 h-3" /> {d}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Success Metrics">
          <ul className="space-y-1">
            {scope.success_metrics?.map((m, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <Star className="w-3.5 h-3.5 text-yellow-400 mt-0.5 shrink-0" /> {m}
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Risks">
          <ul className="space-y-1">
            {scope.risks?.map((r, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 mt-0.5 shrink-0" /> {r}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

/* ---- Architecture Panel ---- */
function ArchPanel({ arch }: { arch: Architecture }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <Card title="System Overview">
        <p className="text-sm text-muted-foreground leading-relaxed">{arch.overview}</p>
        <p className="text-sm mt-3 text-muted-foreground/70 italic">{arch.data_flow}</p>
      </Card>

      {/* Components */}
      <Card title="Components">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {arch.components?.map((c, i) => (
            <div key={i} className="bg-background/50 rounded-lg p-3 border border-border/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{c.name}</span>
                <span className="text-xs text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full">{c.technology}</span>
              </div>
              <p className="text-xs text-muted-foreground">{c.role}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* DB Schema */}
      <Card title="Database Schema">
        <div className="space-y-4">
          {arch.db_schema?.map((table, i) => (
            <div key={i}>
              <p className="text-sm font-mono font-semibold text-violet-400 mb-1">{table.table}</p>
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-muted-foreground border-b border-border/50">
                    <th className="pb-1 pr-4 font-medium">Column</th>
                    <th className="pb-1 pr-4 font-medium">Type</th>
                    <th className="pb-1 font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {table.columns?.map((col, j) => (
                    <tr key={j} className="border-b border-border/20">
                      <td className="py-1.5 pr-4 font-mono">{col.name}</td>
                      <td className="py-1.5 pr-4 text-amber-400">{col.type}</td>
                      <td className="py-1.5 text-muted-foreground">{col.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </Card>

      {/* API Routes */}
      <Card title="API Routes">
        <div className="space-y-1">
          {arch.api_routes?.map((r, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-border/20 last:border-0">
              <span className={cn(
                "text-xs font-mono font-bold w-16 text-center py-0.5 rounded",
                r.method === "GET" ? "bg-emerald-500/10 text-emerald-400" :
                r.method === "POST" ? "bg-blue-500/10 text-blue-400" :
                r.method === "PUT" || r.method === "PATCH" ? "bg-yellow-500/10 text-yellow-400" :
                "bg-red-500/10 text-red-400"
              )}>{r.method}</span>
              <span className="text-sm font-mono text-muted-foreground">{r.path}</span>
              <span className="text-xs text-muted-foreground ml-auto">{r.description}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Tech decisions */}
      <Card title="Technical Decisions">
        <div className="space-y-2">
          {arch.tech_decisions?.map((d, i) => (
            <div key={i} className="text-sm">
              <span className="font-medium">{d.decision}</span>
              <span className="text-muted-foreground"> — {d.reason}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ---- Scaffold Panel ---- */
function ScaffoldPanel({ scaffold }: { scaffold: Scaffold }) {
  const [activeFile, setActiveFile] = useState(0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Folder tree */}
      <Card title="Folder Structure">
        <pre className="text-xs text-muted-foreground whitespace-pre font-mono leading-relaxed overflow-x-auto">
          {scaffold.folder_tree}
        </pre>
      </Card>

      {/* File viewer */}
      {scaffold.key_files && scaffold.key_files.length > 0 && (
        <Card title="Starter Code">
          <div className="flex gap-0 border-b border-border mb-4 overflow-x-auto">
            {scaffold.key_files.map((f, i) => (
              <button
                key={i}
                onClick={() => setActiveFile(i)}
                className={cn(
                  "px-3 py-2 text-xs font-mono whitespace-nowrap border-b-2 -mb-px",
                  activeFile === i
                    ? "border-violet-500 text-violet-400"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {f.path.split("/").pop()}
              </button>
            ))}
          </div>
          <div className="text-xs text-muted-foreground mb-2 font-mono">
            {scaffold.key_files[activeFile]?.path}
          </div>
          <p className="text-xs text-muted-foreground mb-3 italic">
            {scaffold.key_files[activeFile]?.description}
          </p>
          <pre className="text-xs bg-black/40 rounded-lg p-4 overflow-x-auto leading-relaxed">
            <code>{scaffold.key_files[activeFile]?.starter_code}</code>
          </pre>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Env vars */}
        <Card title="Environment Variables">
          <div className="space-y-2">
            {scaffold.env_vars?.map((v, i) => (
              <div key={i} className="bg-background/50 rounded p-2 border border-border/50">
                <p className="text-xs font-mono text-amber-400">{v.name}</p>
                <p className="text-xs text-muted-foreground">{v.description}</p>
                <p className="text-xs font-mono text-white/30 mt-0.5"># {v.example}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Commands */}
        <Card title="Commands">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">Setup</p>
            {scaffold.setup_commands?.map((cmd, i) => (
              <p key={i} className="text-xs font-mono bg-black/40 rounded px-3 py-1.5">{cmd}</p>
            ))}
            {scaffold.dev_commands && (
              <>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-3 mb-2">Dev</p>
                {Object.entries(scaffold.dev_commands).map(([k, v]) => (
                  <p key={k} className="text-xs font-mono bg-black/40 rounded px-3 py-1.5">
                    <span className="text-violet-400">{k}: </span>{v}
                  </p>
                ))}
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ---- Review Panel ---- */
function ReviewPanel({ review }: { review: Review }) {
  const scoreColor = review.score >= 75 ? "text-emerald-400" : review.score >= 50 ? "text-yellow-400" : "text-red-400";
  const assessColor = review.overall_assessment === "STRONG" ? "emerald" :
    review.overall_assessment === "VIABLE" ? "blue" :
    review.overall_assessment === "NEEDS_WORK" ? "yellow" : "red";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Score */}
      <div className="flex gap-4">
        <div className={cn(
          "flex-1 rounded-xl p-6 border text-center",
          assessColor === "emerald" ? "bg-emerald-500/10 border-emerald-500/20" :
          assessColor === "blue" ? "bg-blue-500/10 border-blue-500/20" :
          assessColor === "yellow" ? "bg-yellow-500/10 border-yellow-500/20" :
          "bg-red-500/10 border-red-500/20"
        )}>
          <p className={cn("text-4xl font-bold", scoreColor)}>{review.score}</p>
          <p className="text-sm text-muted-foreground mt-1">/100 score</p>
        </div>
        <div className="flex-1 bg-card border border-border rounded-xl p-6 flex flex-col justify-center">
          <span className={cn(
            "text-lg font-bold",
            assessColor === "emerald" ? "text-emerald-400" :
            assessColor === "blue" ? "text-blue-400" :
            assessColor === "yellow" ? "text-yellow-400" : "text-red-400"
          )}>
            {review.overall_assessment}
          </span>
          <p className="text-sm text-muted-foreground mt-1">{review.timeline_assessment}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Gaps */}
        <Card title="Gaps Found">
          <div className="space-y-2">
            {review.gaps?.map((g, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className={cn(
                  "text-xs px-1.5 py-0.5 rounded shrink-0 mt-0.5",
                  g.severity === "high" ? "bg-red-500/10 text-red-400" :
                  g.severity === "medium" ? "bg-yellow-500/10 text-yellow-400" :
                  "bg-blue-500/10 text-blue-400"
                )}>
                  {g.severity}
                </span>
                <div>
                  <span className="text-xs font-medium">{g.area}</span>
                  <p className="text-xs text-muted-foreground">{g.issue}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Green flags */}
        <Card title="Green Flags">
          <ul className="space-y-2">
            {review.green_flags?.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" /> {f}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card title="Recommendations">
        <ol className="space-y-2">
          {review.recommendations?.map((r, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-xs shrink-0 mt-0.5">{i + 1}</span>
              {r}
            </li>
          ))}
        </ol>
      </Card>

      {review.missing_components?.length > 0 && (
        <Card title="Missing Components" accent="yellow">
          <ul className="space-y-1">
            {review.missing_components.map((c, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 mt-0.5 shrink-0" /> {c}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

/* ---- Delivery Panel ---- */
function DeliveryPanel({ delivery }: { delivery: Delivery }) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* One-liner */}
      <div className="bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-500/20 rounded-xl p-6 text-center">
        <p className="text-lg font-semibold">{delivery.one_liner}</p>
      </div>

      {/* Pitch points */}
      <Card title="Pitch Points">
        <ol className="space-y-2">
          {delivery.pitch_points?.map((p, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-xs shrink-0 mt-0.5">{i + 1}</span>
              {p}
            </li>
          ))}
        </ol>
      </Card>

      {/* Demo script */}
      <Card title="Demo Script">
        <div className="space-y-3">
          {delivery.demo_script?.map((step, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-400 shrink-0">
                {step.step}
              </div>
              <div>
                <p className="text-sm font-medium">{step.action}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Expected: {step.expected}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Build checklist */}
      <Card title="Build Checklist">
        <div className="space-y-1">
          {["setup", "core", "polish", "launch"].map((phase) => {
            const items = delivery.build_checklist?.filter((i) => i.phase === phase) || [];
            if (!items.length) return null;
            return (
              <div key={phase} className="mb-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">{phase}</p>
                {items.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 py-1.5">
                    <div className="w-4 h-4 rounded border border-border flex items-center justify-center">
                      {item.done && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                    </div>
                    <span className="text-sm">{item.item}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </Card>

      {/* README */}
      {delivery.readme && (
        <Card title="README.md">
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed font-mono overflow-x-auto max-h-96">
            {delivery.readme}
          </pre>
        </Card>
      )}
    </div>
  );
}

/* ---- Reusable Card ---- */
function Card({
  title,
  children,
  accent,
}: {
  title: string;
  children: React.ReactNode;
  accent?: "emerald" | "red" | "yellow" | "blue";
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h3 className={cn(
        "text-sm font-semibold mb-4",
        accent === "emerald" ? "text-emerald-400" :
        accent === "red" ? "text-red-400" :
        accent === "yellow" ? "text-yellow-400" :
        accent === "blue" ? "text-blue-400" :
        "text-foreground"
      )}>
        {title}
      </h3>
      {children}
    </div>
  );
}

/* ---- Export ---- */
function downloadAll(artifacts: Artifacts) {
  const data = JSON.stringify(artifacts, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "forgeflow-artifacts.json";
  a.click();
  URL.revokeObjectURL(url);
}
