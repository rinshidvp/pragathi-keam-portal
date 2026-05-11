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

function AdminPage() {
  const [session, setSession] = useState<boolean | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(!!session);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (session === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="w-8 h-8 rounded-full border-2 border-sunset-orange border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <AdminLogin onLogin={() => setSession(true)} />;
  }

  return <AdminDashboard onLogout={() => setSession(false)} />;
}
