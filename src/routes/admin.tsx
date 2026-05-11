import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminDashboard from "@/components/admin/AdminDashboard";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "Admin — Pragathi 2026" },
      { name: "description", content: "Admin dashboard for Pragathi College Union 2026." },
    ],
  }),
});

type AuthState = "loading" | "unauthenticated" | "authenticated-non-admin" | "admin";

function AdminPage() {
  const [state, setState] = useState<AuthState>("loading");

  const verifyAdmin = async (userId: string | null) => {
    if (!userId) {
      setState("unauthenticated");
      return;
    }
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (error || !data) {
      setState("authenticated-non-admin");
    } else {
      setState("admin");
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // Defer the role lookup to avoid running auth queries inside the callback.
      setTimeout(() => verifyAdmin(session?.user?.id ?? null), 0);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      verifyAdmin(session?.user?.id ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (state === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="w-8 h-8 rounded-full border-2 border-sunset-orange border-t-transparent animate-spin" />
      </div>
    );
  }

  if (state === "unauthenticated") {
    return <AdminLogin onLogin={() => setState("loading")} />;
  }

  if (state === "authenticated-non-admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <h1 className="text-2xl font-extrabold text-foreground mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-6 max-w-md">
          Your account does not have admin privileges. If you believe this is a mistake, please contact the site administrator.
        </p>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            setState("unauthenticated");
          }}
          className="px-4 py-2 rounded-lg bg-gradient-sunset text-primary-foreground text-sm font-semibold"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return <AdminDashboard onLogout={() => setState("unauthenticated")} />;
}
