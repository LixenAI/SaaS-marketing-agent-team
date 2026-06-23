import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { AutopilotTask, AuditEntry } from "@shared/schema";

// Resolve catalog.json relative to the running file. In dev (tsx/ESM) this
// module lives in server/; in the bundled prod build (esbuild CJS) it lives in
// dist/ alongside the copied catalog.json. We probe a couple of candidates so
// both environments work without relying on import.meta (empty under CJS).
function resolveCatalogPath(): string {
  const candidates = [
    join(process.cwd(), "dist", "catalog.json"),
    join(process.cwd(), "server", "catalog.json"),
    join(process.cwd(), "catalog.json"),
  ];
  for (const c of candidates) if (existsSync(c)) return c;
  return candidates[1];
}

/**
 * OPERATOR TOKEN
 * In production set process.env.OPERATOR_TOKEN (managed in Render as a private
 * app password). If no env var is present we fall back to a clearly documented
 * preview token so the deployed preview is testable. This fallback is NOT a
 * secret and must be overridden in any real deployment.
 */
const PREVIEW_FALLBACK_TOKEN = "lixen-operator-preview";
const OPERATOR_TOKEN = process.env.OPERATOR_TOKEN || PREVIEW_FALLBACK_TOKEN;
const USING_FALLBACK = !process.env.OPERATOR_TOKEN;

// Load ingested repo catalog (static, generated at build time from the repo).
const catalog = JSON.parse(readFileSync(resolveCatalogPath(), "utf-8"));

// ---- Integration env var contract (boolean status only, never values) ----
const ENV_KEYS = [
  { key: "OPERATOR_TOKEN", group: "Operator", required: true, note: "Operator login token (private app password in Render)." },
  { key: "GHL_LOCATION_ID", group: "HighLevel", required: true, note: "GHL sub-account / location id." },
  { key: "GHL_PRIVATE_INTEGRATION_TOKEN", group: "HighLevel", required: true, note: "HighLevel Private Integration API token." },
  { key: "GHL_API_BASE_URL", group: "HighLevel", required: false, note: "LeadConnector API base URL." },
  { key: "GHL_API_VERSION", group: "HighLevel", required: false, note: "Core API version header." },
  { key: "GHL_OPPORTUNITIES_API_VERSION", group: "HighLevel", required: false, note: "Opportunities API version header." },
  { key: "LIXEN_CUSTOM_DOMAIN", group: "Lixen", required: false, note: "Custom domain bound to Render." },
  { key: "LIXEN_BOOKING_LINK", group: "Lixen", required: false, note: "Partner booking widget link." },
  { key: "LIXEN_SUPPORT_EMAIL", group: "Lixen", required: false, note: "Support contact email." },
];

// Default values (non-secret) used to pre-fill the Render setup block in the UI.
const ENV_DEFAULTS: Record<string, string> = {
  GHL_LOCATION_ID: "C7e7ReTQ4FXMZp9TjxzU",
  GHL_API_BASE_URL: "https://services.leadconnectorhq.com",
  GHL_API_VERSION: "2021-07-28",
  GHL_OPPORTUNITIES_API_VERSION: "2023-02-21",
  LIXEN_CUSTOM_DOMAIN: "marketing-agent.lixenai.com",
  LIXEN_BOOKING_LINK: "https://link.lixen.ai/widget/booking/W0BVrWmszScBAjQhN631",
  LIXEN_SUPPORT_EMAIL: "support@lixen.ai",
};

// ---- Autopilot queues: classify by action class, never auto-execute risk ----
const AUTOPILOT_TASKS: AutopilotTask[] = [
  { id: "ap-1", title: "Read this week's pipeline snapshot", agent: "Marketing Director", action: "read", lane: "auto", reason: "Read-only retrieval. Safe to run unattended." },
  { id: "ap-2", title: "Check content QA checklist against latest drafts", agent: "QA", action: "check", lane: "auto", reason: "Validation/check only. No external writes." },
  { id: "ap-3", title: "Draft 10 LinkedIn DM scripts for high-ticket closers", agent: "Partner Acquisition", action: "draft", lane: "auto", reason: "Draft generation stays in workspace; nothing is sent." },
  { id: "ap-4", title: "Generate weekly marketing readiness report", agent: "Marketing Director", action: "report", lane: "auto", reason: "Reporting only. Compiles existing data." },
  { id: "ap-5", title: "Send Apollo cold sequence to net-new closers", agent: "Partner Acquisition", action: "send", lane: "approval", reason: "Outbound send. Cold outreach lane = Apollo/Instantly only, requires operator approval." },
  { id: "ap-6", title: "Publish founder post to LinkedIn", agent: "Social Media", action: "publish", lane: "approval", reason: "Publishing live content requires explicit approval and human review." },
  { id: "ap-7", title: "Enroll qualified partners into GHL nurture workflow", agent: "Sales Enablement", action: "enroll", lane: "approval", reason: "CRM enrollment / workflow trigger. Warm CRM only via GHL LC Email; no bulk enrollment without approval." },
  { id: "ap-8", title: "Increase Meta ad spend on partner recruitment set", agent: "Ads Manager", action: "spend", lane: "approval", reason: "Ad spend change. Paid acquisition gated until proof + readiness; needs approval." },
  { id: "ap-9", title: "Write opportunity stage update to GHL pipeline", agent: "Sales Enablement", action: "crm_write", lane: "approval", reason: "CRM write to GoHighLevel opportunities. Requires approval." },
  { id: "ap-10", title: "Rotate GHL_PRIVATE_INTEGRATION_TOKEN", agent: "System", action: "credential", lane: "blocked", reason: "Credential operation. Blocked from autopilot — managed in Render env only." },
  { id: "ap-11", title: "Send cold outreach through GoHighLevel", agent: "Partner Acquisition", action: "send", lane: "blocked", reason: "Safety blocker: never run cold outreach through GHL. Cold lane is Apollo/Instantly only." },
  { id: "ap-12", title: "Bulk-enroll full list into workflow + send live test SMS", agent: "Sales Enablement", action: "enroll", lane: "blocked", reason: "Safety blocker: no bulk enrollment, workflow publishing, live test messages, or SMS without explicit approval." },
];

// ---- Seeded audit log ----
const AUDIT_LOG: AuditEntry[] = [
  { id: "au-1", ts: "2026-06-22T21:40:00Z", actor: "operator", event: "auth.success", detail: "Operator unlocked console.", level: "info" },
  { id: "au-2", ts: "2026-06-22T21:41:12Z", actor: "Marketing Director", event: "task.auto", detail: "Generated weekly marketing readiness report (read/report).", level: "info" },
  { id: "au-3", ts: "2026-06-22T21:43:05Z", actor: "QA", event: "task.auto", detail: "Ran content QA checklist; 2 items flagged for human review.", level: "info" },
  { id: "au-4", ts: "2026-06-22T21:44:50Z", actor: "Partner Acquisition", event: "task.approval", detail: "Apollo cold sequence held for approval (send lane).", level: "warn" },
  { id: "au-5", ts: "2026-06-22T21:45:30Z", actor: "System", event: "task.blocked", detail: "Blocked: cold outreach attempt through GoHighLevel.", level: "block" },
  { id: "au-6", ts: "2026-06-22T21:46:10Z", actor: "Ads Manager", event: "task.approval", detail: "Meta ad spend increase held for approval (spend lane).", level: "warn" },
];

function requireOperator(req: Request, res: Response, next: NextFunction) {
  const header = req.header("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  const token = match ? match[1].trim() : "";
  if (!token || token !== OPERATOR_TOKEN) {
    return res.status(401).json({ message: "Unauthorized: valid operator token required." });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  // Protected: simple status / auth verification endpoint.
  app.get("/api/status", requireOperator, (_req, res) => {
    res.json({
      ok: true,
      app: "Lixen.AI Marketing Agent OS",
      role: "operator",
      usingPreviewFallbackToken: USING_FALLBACK,
      time: new Date().toISOString(),
      modules: ["Dashboard", "Agent Library", "Autopilot Engine", "Workflow Launch", "Integrations", "Audit Log"],
    });
  });

  // Protected: ingested repo catalog.
  app.get("/api/catalog", requireOperator, (_req, res) => {
    res.json(catalog);
  });

  // Protected: integration env status (boolean only — never the values).
  app.get("/api/integrations", requireOperator, (_req, res) => {
    const items = ENV_KEYS.map((e) => ({
      key: e.key,
      group: e.group,
      required: e.required,
      note: e.note,
      configured: typeof process.env[e.key] === "string" && process.env[e.key]!.length > 0,
      defaultValue: ENV_DEFAULTS[e.key] ?? null,
    }));
    res.json({ items, usingPreviewFallbackToken: USING_FALLBACK });
  });

  // Protected: autopilot queues.
  app.get("/api/autopilot", requireOperator, (_req, res) => {
    res.json({
      tasks: AUTOPILOT_TASKS,
      lanes: {
        auto: { label: "Auto Queue", classes: ["read", "check", "draft", "report"] },
        approval: { label: "Approval Queue", classes: ["send", "publish", "spend", "enroll", "crm_write"] },
        blocked: { label: "Blocked Queue", classes: ["credential", "safety_blocker"] },
      },
    });
  });

  // Protected: audit log.
  app.get("/api/audit", requireOperator, (_req, res) => {
    res.json({ entries: AUDIT_LOG });
  });

  return httpServer;
}
