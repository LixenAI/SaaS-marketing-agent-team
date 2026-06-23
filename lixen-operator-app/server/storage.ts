// This operator app is read-mostly and serves static, in-memory data from
// routes.ts (catalog, autopilot queues, audit log). No persistent storage
// interface is required.
export interface IStorage {}

export class MemStorage implements IStorage {}

export const storage = new MemStorage();
