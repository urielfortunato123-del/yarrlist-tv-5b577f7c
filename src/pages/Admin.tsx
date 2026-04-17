import { useState, useEffect } from "react";
import { Lock, Zap, Check, AlertCircle, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "ancora-admin-pw";

export default function Admin() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [currentVersion, setCurrentVersion] = useState<string>("");

  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) {
      setPassword(saved);
      setAuthed(true);
    }
    supabase.from("app_version").select("version").eq("id", 1).single()
      .then(({ data }) => data && setCurrentVersion(data.version));
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim().length < 4) {
      setStatus({ type: "error", msg: "Digite a senha de admin." });
      return;
    }
    sessionStorage.setItem(SESSION_KEY, password);
    setAuthed(true);
    setStatus(null);
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
    try {
      const { data, error } = await supabase.functions.invoke("force-update", {
        body: { password },
      });
      if (error || data?.error) {
        const msg = data?.error || error?.message || "Erro ao atualizar";
        setStatus({ type: "error", msg });
        if (msg.toLowerCase().includes("senha")) {
          sessionStorage.removeItem(SESSION_KEY);
          setAuthed(false);
        }
      } else {
        setStatus({ type: "success", msg: `Atualização disparada! Versão: ${data.version}` });
        setCurrentVersion(data.version);
      }
    } catch (e) {
      setStatus({ type: "error", msg: (e as Error).message });
    } finally {
      setLoading(false);
    }
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
              <p className="mt-1 font-body text-sm text-muted-foreground">
                Painel restrito
              </p>
            </div>

            {!authed ? (
              <form onSubmit={handleLogin} className="space-y-4">
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
                  className="w-full rounded-xl bg-primary px-4 py-3 font-body text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
                >
                  Entrar
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="rounded-xl border border-border bg-secondary/50 px-4 py-3">
                  <p className="font-body text-xs text-muted-foreground">Versão atual</p>
                  <p className="font-display text-lg font-bold text-foreground">
                    {currentVersion || "—"}
                  </p>
                </div>

                <button
                  onClick={forceUpdate}
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
