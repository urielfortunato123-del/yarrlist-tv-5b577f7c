import { useState, useEffect, useCallback } from "react";
import { Lock, Zap, Check, AlertCircle, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "ancora-admin-pw";

type AdminResponse = {
  success: boolean;
  version?: string;
  error?: string;
};

export default function Admin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [currentVersion, setCurrentVersion] = useState<string>("");

  const callAdminFunction = useCallback(async (action: "verify" | "update", providedPassword: string) => {
    const { data, error } = await supabase.functions.invoke("force-update", {
      body: { password: providedPassword, action },
    });

    const response = data as AdminResponse | null;

    if (error && !response) {
      return {
        success: false,
        error: "Não foi possível falar com o backend.",
      } satisfies AdminResponse;
    }

    return response ?? { success: false, error: "Erro ao processar a solicitação." };
  }, []);

  useEffect(() => {
    supabase
      .from("app_version")
      .select("version")
      .eq("id", 1)
      .single()
      .then(({ data }) => data && setCurrentVersion(data.version));
  }, []);

  useEffect(() => {
    const restoreSession = async () => {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (!saved) {
        setCheckingSession(false);
        return;
      }

      setPassword(saved);
      const result = await callAdminFunction("verify", saved);

      if (result.success) {
        setAuthed(true);
      } else {
        sessionStorage.removeItem(SESSION_KEY);
        setPassword("");
      }

      setCheckingSession(false);
    };

    void restoreSession();
  }, [callAdminFunction]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        sessionStorage.removeItem(SESSION_KEY);
        navigate("/");
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.trim().length < 4) {
      setStatus({ type: "error", msg: "Digite a senha de admin." });
      return;
    }

    setLoading(true);
    setStatus(null);

    const result = await callAdminFunction("verify", password);

    if (!result.success) {
      sessionStorage.removeItem(SESSION_KEY);
      setAuthed(false);
      setStatus({ type: "error", msg: result.error || "Senha incorreta." });
      setLoading(false);
      return;
    }

    sessionStorage.setItem(SESSION_KEY, password);
    setAuthed(true);
    setStatus(null);
    setLoading(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setPassword("");
    setAuthed(false);
    setStatus(null);
  };

  const forceUpdate = async () => {
    setLoading(true);
    setStatus(null);

    const result = await callAdminFunction("update", password);

    if (!result.success) {
      if (result.error?.toLowerCase().includes("senha")) {
        sessionStorage.removeItem(SESSION_KEY);
        setAuthed(false);
      }
      setStatus({ type: "error", msg: result.error || "Erro ao atualizar." });
      setLoading(false);
      return;
    }

    if (result.version) {
      setCurrentVersion(result.version);
    }

    setStatus({
      type: "success",
      msg: `Atualização disparada! Versão: ${result.version}`,
    });
    setLoading(false);
  };

  return (
    <div className="bg-wallpaper min-h-screen">
      <div className="min-h-screen bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex min-h-screen max-w-md items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel w-full rounded-2xl border border-border p-6 shadow-2xl"
          >
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Lock className="h-7 w-7 text-primary" />
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground">Admin Âncora TV</h1>
              <p className="mt-1 font-body text-sm text-muted-foreground">Painel restrito</p>
            </div>

            {checkingSession ? (
              <div className="rounded-xl border border-border bg-secondary/50 px-4 py-6 text-center font-body text-sm text-muted-foreground">
                Verificando acesso...
              </div>
            ) : !authed ? (
              <form onSubmit={(e) => void handleLogin(e)} className="space-y-4">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Senha de administrador"
                  autoFocus
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
                {status?.type === "error" && (
                  <p className="flex items-center gap-2 rounded-xl bg-destructive/10 px-3 py-2 font-body text-xs text-destructive">
                    <AlertCircle className="h-4 w-4" /> {status.msg}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-primary px-4 py-3 font-body text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? "Entrando..." : "Entrar"}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 font-body text-xs font-medium text-primary">
                  <Check className="h-4 w-4" /> Senha validada — acesso liberado
                </div>

                <div className="rounded-xl border border-border bg-secondary/50 px-4 py-3">
                  <p className="font-body text-xs text-muted-foreground">Versão atual</p>
                  <p className="font-display text-lg font-bold text-foreground">{currentVersion || "—"}</p>
                </div>

                <button
                  onClick={() => void forceUpdate()}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 font-body text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
                >
                  <Zap className="h-4 w-4" />
                  {loading ? "Disparando..." : "Forçar atualização global"}
                </button>

                <p className="font-body text-xs text-muted-foreground">
                  Todos os dispositivos conectados receberão a atualização e recarregarão automaticamente.
                </p>

                {status?.type === "success" && (
                  <p className="flex items-center gap-2 rounded-xl bg-primary/10 px-3 py-2 font-body text-xs text-primary">
                    <Check className="h-4 w-4" /> {status.msg}
                  </p>
                )}
                {status?.type === "error" && (
                  <p className="flex items-center gap-2 rounded-xl bg-destructive/10 px-3 py-2 font-body text-xs text-destructive">
                    <AlertCircle className="h-4 w-4" /> {status.msg}
                  </p>
                )}

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-secondary px-4 py-2.5 font-body text-xs font-medium text-secondary-foreground transition-all hover:bg-accent"
                >
                  <LogOut className="h-3.5 w-3.5" /> Sair
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
