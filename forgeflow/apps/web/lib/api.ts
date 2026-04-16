import { API_URL } from "./utils";

export interface GenerateRequest {
  idea: string;
  stack: string;
  team_size: number;
  deadline: string;
  constraints: string;
}

export interface Project {
  id: string;
  title: string;
  idea: string;
  stack: string;
  team_size: number;
  deadline: string;
  constraints: string;
  status: string;
  artifacts: Artifacts;
  created_at: string;
  updated_at: string;
}

export interface Artifacts {
  parsed_input?: ParsedInput;
  scope?: Scope;
  architecture?: Architecture;
  scaffold?: Scaffold;
  review?: Review;
  delivery?: Delivery;
}

export interface ParsedInput {
  product_type: string;
  core_problem: string;
  target_users: string;
  key_features: string[];
  tech_stack: string[];
  timeline_days: number | null;
  team_size: number;
  constraints: string[];
  complexity: string;
}

export interface Scope {
  mvp_name: string;
  one_liner: string;
  in_scope: string[];
  out_of_scope: string[];
  milestones: { day: number; title: string; deliverables: string[] }[];
  success_metrics: string[];
  risks: string[];
}

export interface Architecture {
  overview: string;
  components: { name: string; role: string; technology: string }[];
  db_schema: { table: string; columns: { name: string; type: string; notes: string }[] }[];
  api_routes: { method: string; path: string; description: string }[];
  data_flow: string;
  tech_decisions: { decision: string; reason: string }[];
}

export interface Scaffold {
  folder_tree: string;
  key_files: { path: string; description: string; starter_code: string }[];
  env_vars: { name: string; description: string; example: string }[];
  setup_commands: string[];
  dev_commands: { frontend?: string; backend?: string; [key: string]: string | undefined };
}

export interface Review {
  overall_assessment: string;
  score: number;
  gaps: { area: string; issue: string; severity: string }[];
  scope_concerns: string[];
  missing_components: string[];
  timeline_assessment: string;
  recommendations: string[];
  green_flags: string[];
}

export interface Delivery {
  readme: string;
  demo_script: { step: number; action: string; expected: string }[];
  build_checklist: { item: string; phase: string; done: boolean }[];
  pitch_points: string[];
  one_liner: string;
}

export async function startGeneration(req: GenerateRequest): Promise<{ project_id: string; status: string }> {
  const res = await fetch(`${API_URL}/api/generate/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getProject(projectId: string): Promise<Project> {
  const res = await fetch(`${API_URL}/api/projects/${projectId}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function listProjects(): Promise<Project[]> {
  const res = await fetch(`${API_URL}/api/projects/`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
