import { useState } from "react";
import { useOperator, attemptLogin } from "@/lib/operator";
import { LogoMark } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Loader2, ShieldCheck } from "lucide-react";

export default function Login() {
  const { setSession } = useOperator();
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const status = await attemptLogin(token.trim());
      setSession(token.trim(), status);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0D3070] relative overflow-hidden px-4">
      {/* subtle brand backdrop */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, #60AAFF 0, transparent 40%), radial-gradient(circle at 80% 70%, #1E5BA8 0, transparent 45%)",
        }}
      />
      <div className="relative w-full max-w-[420px]">
        <div className="flex flex-col items-center mb-8 text-center">
          <LogoMark size={56} className="mb-4 drop-shadow" />
          <h1 className="text-white text-xl font-semibold tracking-tight" data-testid="text-app-title">
            Lixen.AI Marketing Agent OS
          </h1>
          <p className="text-[#60AAFF] text-sm mt-1">Operator Console</p>
        </div>

        <form
          onSubmit={onSubmit}
          className="bg-white rounded-xl shadow-2xl p-7 border border-[#EBF2FA]"
          data-testid="form-login"
        >
          <div className="flex items-center gap-2 text-[#0D3070] mb-1">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-sm font-semibold">Operator sign-in</span>
          </div>
          <p className="text-[13px] text-muted-foreground mb-5">
            Enter your operator token to unlock the console. The token is held in
            memory only — it is never written to browser storage.
          </p>

          <Label htmlFor="token" className="text-[13px] font-medium">
            Operator token
          </Label>
          <div className="relative mt-1.5 mb-1">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="token"
              type="password"
              autoComplete="off"
              placeholder="••••••••••••"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="pl-9"
              data-testid="input-operator-token"
            />
          </div>

          {error && (
            <p className="text-[13px] text-destructive mt-2" data-testid="text-login-error">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading || !token.trim()}
            className="w-full mt-5 bg-[#0D3070] hover:bg-[#1E5BA8]"
            data-testid="button-login"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Verifying…
              </>
            ) : (
              "Unlock console"
            )}
          </Button>

          <p className="text-[11px] text-muted-foreground mt-5 leading-relaxed">
            Preview builds without an <code className="text-[#1E5BA8]">OPERATOR_TOKEN</code> env
            var accept the documented fallback token{" "}
            <code className="text-[#1E5BA8]">lixen-operator-preview</code>. Set a real token in
            Render for production.
          </p>
        </form>

        <p className="text-center text-[#60AAFF]/70 text-[11px] mt-6">
          You close. We build, deploy, and deliver.
        </p>
      </div>
    </div>
  );
}
