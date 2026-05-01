import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Download, Calendar } from "lucide-react";

interface AnswerKey {
  id: string;
  year: number;
  paper_name: string;
  file_url: string;
}

export default function AnswerKeysSection() {
  const [keys, setKeys] = useState<AnswerKey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("answer_keys")
      .select("*")
      .order("year", { ascending: false })
      .order("paper_name")
      .then(({ data }) => {
        setKeys((data as AnswerKey[]) ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <section id="answer-keys" className="py-16 sm:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full bg-sunset-orange/10 text-sunset-orange text-xs font-bold tracking-wide uppercase mb-3">
            Post-Exam Resources
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-gradient-sunset">
            KEAM Answer Keys
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Download official and provisional answer keys, paper-wise. Verify your responses and estimate your score.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-44 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : keys.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-2xl bg-card/50">
            <FileText className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Answer keys will be published here after the exam.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {keys.map((key, idx) => (
              <motion.a
                key={key.id}
                href={key.file_url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -4 }}
                className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/70 backdrop-blur-md p-6 shadow-sm hover:shadow-2xl transition-all duration-300"
              >
                <div className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                     style={{ background: "linear-gradient(135deg, var(--sunset-yellow), var(--sunset-orange), var(--sunset-red))", filter: "blur(20px)", zIndex: -1 }} />
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-sunset opacity-10 rounded-full blur-3xl group-hover:opacity-30 transition-opacity" />

                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-sunset/10 border border-sunset-orange/20 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-sunset-orange" />
                  </div>
                  <span className="flex items-center gap-1 text-xs font-bold text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-full">
                    <Calendar className="w-3 h-3" />
                    {key.year}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-foreground mb-2 leading-snug">
                  {key.paper_name}
                </h3>
                <p className="text-xs text-muted-foreground mb-5">
                  KEAM {key.year} Official Answer Key
                </p>

                <div className="flex items-center gap-2 text-sm font-bold text-sunset-orange group-hover:text-sunset-red transition-colors">
                  <Download className="w-4 h-4" />
                  Download / View Key
                </div>
              </motion.a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
