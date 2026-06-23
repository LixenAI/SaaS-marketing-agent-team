import { z } from "zod";

// This operator app is read-mostly: catalog data is static and autopilot
// queues are seeded in-memory. No persistent DB tables are required.

export const catalogItemSchema = z.object({
  id: z.string(),
  category: z.string(),
  folder: z.string(),
  filename: z.string(),
  kind: z.enum(["markdown", "yaml"]),
  title: z.string(),
  summary: z.string(),
  sections: z.array(z.string()),
  lines: z.number(),
  bytes: z.number(),
  repoPath: z.string(),
  seeded: z.boolean().optional(),
});
export type CatalogItem = z.infer<typeof catalogItemSchema>;

export type AutopilotLane = "auto" | "approval" | "blocked";

export interface AutopilotTask {
  id: string;
  title: string;
  agent: string;
  action: string;
  lane: AutopilotLane;
  reason: string;
}

export interface AuditEntry {
  id: string;
  ts: string;
  actor: string;
  event: string;
  detail: string;
  level: "info" | "warn" | "block";
}
