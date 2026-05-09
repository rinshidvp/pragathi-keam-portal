import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, Phone, Users } from "lucide-react";

interface DeptContact {
  id: string;
  department: string;
  name: string;
  phone: string;
}

function toWhatsAppLink(phone: string): string {
  // Strip everything except digits, then ensure 91 prefix
  const digits = phone.replace(/\D/g, "");
  const normalized = digits.startsWith("91") ? digits : `91${digits}`;
  return `https://wa.me/${normalized}`;
}

export default function DeptHelpDeskSection() {
  const [items, setItems] = useState<DeptContact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("department_contacts" as never)
        .select("id, department, name, phone")
        .order("department");
      setItems((data as unknown as DeptContact[]) ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <section id="dept-helpdesk" className="py-16 sm:py-24 relative overflow-hidden bg-gradient-to-b from-background to-cream">
      <div className="absolute -top-32 left-1/3 w-96 h-96 bg-sunset-orange/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 right-1/4 w-96 h-96 bg-sunset-yellow/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sunset-orange/10 text-sunset-orange text-xs font-bold tracking-wide uppercase mb-3">
            <Users className="w-3.5 h-3.5" /> Direct Mentor Access
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-gradient-sunset">Department Help Desk</h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Tap a card to chat instantly on WhatsApp with a senior from that department.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-44 rounded-2xl bg-card/40 border border-border animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl bg-card/40 max-w-2xl mx-auto text-muted-foreground">
            Department volunteers will appear here soon.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {items.map((c, i) => (
              <motion.a
                key={c.id}
                href={toWhatsAppLink(c.phone)}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(i * 0.04, 0.3) }}
                whileHover={{ y: -4 }}
                className="group relative rounded-2xl p-5 backdrop-blur-xl bg-card/50 border border-white/30 shadow-lg hover:shadow-2xl hover:shadow-sunset-orange/20 hover:border-sunset-orange/50 transition-all overflow-hidden"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, color-mix(in oklab, var(--card) 70%, transparent) 0%, color-mix(in oklab, var(--card) 40%, transparent) 100%)",
                }}
              >
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-sunset-orange/10 rounded-full blur-2xl group-hover:bg-sunset-orange/20 transition-colors pointer-events-none" />

                <div className="relative">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-sunset-orange/15 text-sunset-orange mb-3">
                    {c.department}
                  </span>

                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg text-foreground leading-tight">{c.name}</h3>
                    <MessageCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  </div>

                  <p className="text-xs text-muted-foreground font-medium mb-4">Senior Volunteer</p>

                  <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground tabular-nums">
                      <Phone className="w-3.5 h-3.5 text-sunset-orange" />
                      {c.phone}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 group-hover:text-emerald-500">
                      Chat →
                    </span>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
