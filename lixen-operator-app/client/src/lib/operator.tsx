import { createContext, useContext, useState, ReactNode } from "react";

const API_BASE = "__PORT_5000__".startsWith("__") ? "" : "__PORT_5000__";

// ---- Operator auth context. Token lives ONLY in React state. ----
// No localStorage / sessionStorage / indexedDB / cookies are used anywhere.
interface OperatorCtx {
  token: string | null;
  status: StatusResponse | null;
  setSession: (token: string, status: StatusResponse) => void;
  logout: () => void;
}

export interface StatusResponse {
  ok: boolean;
  app: string;
  role: string;
  usingPreviewFallbackToken: boolean;
  time: string;
  modules: string[];
}

const Ctx = createContext<OperatorCtx | null>(null);

export function OperatorProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusResponse | null>(null);

  return (
    <Ctx.Provider
      value={{
        token,
        status,
        setSession: (t, s) => {
          setToken(t);
          setStatus(s);
        },
        logout: () => {
          setToken(null);
          setStatus(null);
        },
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useOperator() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useOperator must be used within OperatorProvider");
  return c;
}

// Authenticated GET helper — always sends the Bearer token.
export async function operatorGet<T>(url: string, token: string): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
  return (await res.json()) as T;
}

// Attempt login: hit the protected status endpoint with the supplied token.
export async function attemptLogin(token: string): Promise<StatusResponse> {
  const res = await fetch(`${API_BASE}/api/status`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) {
    throw new Error("Invalid operator token.");
  }
  if (!res.ok) {
    throw new Error(`${res.status}: ${(await res.text()) || res.statusText}`);
  }
  return (await res.json()) as StatusResponse;
}
