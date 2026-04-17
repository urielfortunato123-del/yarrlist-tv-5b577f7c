import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type AdminRequest = {
  password?: string;
  version?: string;
  action?: "verify" | "update";
};

const json = (body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { password, version, action = "update" } = (await req.json()) as AdminRequest;
    const adminPassword = Deno.env.get("ADMIN_PASSWORD");

    if (!adminPassword || !password || password !== adminPassword) {
      return json({ success: false, error: "Senha incorreta" });
    }

    if (action === "verify") {
      return json({ success: true });
    }

    const newVersion = version || `${Date.now()}`;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error } = await supabase
      .from("app_version")
      .update({ version: newVersion, updated_at: new Date().toISOString() })
      .eq("id", 1);

    if (error) {
      return json({ success: false, error: error.message });
    }

    return json({ success: true, version: newVersion });
  } catch (e) {
    return json({ success: false, error: (e as Error).message || "Erro interno" });
  }
});
