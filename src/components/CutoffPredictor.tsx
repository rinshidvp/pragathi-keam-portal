import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Check, ChevronsUpDown, GraduationCap, Loader2, Search, Sparkles, Target, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const KEAM_BRANCHES = [
  "Electronics and communication",
  "Electrical and electronics",
  "Electrical and Computer engineering",
  "Mechanical engineering",
  "Computer Science & Engineering (Artificial Intelligence)",
  "Civil and Environmental Engineering",
  "Dairy Technology",
  "Food Technology",
  "Instrumentation & Control Engg.",
  "Industrial Engineering",
  "Information Technology",
  "Production Engineering",
  "Robotics and Artificial Intelligence",
  "Artificial Intelligence and Data Science",
  "Bio Technology and Biochemical Engineering",
  "Computer Science and Engineering (Artificial Intelligence and Machine Learning)",
  "Computer Science and Business Systems",
  "Computer Science and Engineering (Cyber Security)",
  "Electronics & Biomedical Engg",
  "Electronics and Computer Science",
  "Electronics Engineering (VLSI Design & Technology)",
  "Mechanical (Automobile)",
  "Polymer Engg.",
  "Printing Technology",
  "Artificial Intelligence",
  "B.Tech Agricultural Engineering",
  "Aeronautical Engineering",
  "Automobile Engineering",
  "Computer Science & Engineering and Business Systems",
  "Bio Medical Engineering",
  "Biomedical & Robotic Engineering",
  "Bio Technology",
  "Electronics & Instrumentation",
  "Safety & Fire Engineering",
  "Computer Science & Engineering (Internet of Things & Cyber Security including Block Chain)",
  "Computer Science and Engineering (Artificial Intelligence and Data Science)",
  "Internet of Things",
  "Metallurgical and Materials Engineering",
  "Mechatronics Engineering",
  "Robotics and Automation Engineering",
  "Naval Arch. & Ship Building Engineering",
];

const CATEGORIES = ["SM", "EZ", "MU", "BH", "LA", "BX", "KU", "SC", "ST", "EW"] as const;

interface CutoffRow {
  id: string;
  college_name: string;
  department_name: string;
  category: string;
  cutoff_rank: number;
  phase: string;
}

export default function CutoffPredictor() {
  const [rank, setRank] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [collegeFilter, setCollegeFilter] = useState<string>("__all__");
  const [branchFilter, setBranchFilter] = useState<string>("__all__");

  const [colleges, setColleges] = useState<string[]>([]);
  const [branches, setBranches] = useState<string[]>([]);

  const [results, setResults] = useState<CutoffRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Load distinct colleges + merge branches with the canonical KEAM list
  useEffect(() => {
    supabase
      .from("cutoffs")
      .select("college_name, department_name")
      .limit(10000)
      .then(({ data }) => {
        if (!data) return;
        setColleges(Array.from(new Set(data.map((d) => d.college_name))).sort());
        const dbBranches = data.map((d) => d.department_name);
        setBranches(Array.from(new Set([...KEAM_BRANCHES, ...dbBranches])).sort());
      });
  }, []);

  const canPredict = rank.trim() !== "" && category !== "" && Number(rank) > 0;

  const handlePredict = async () => {
    if (!canPredict) return;
    setLoading(true);
    setHasSearched(true);

    let query = supabase
      .from("cutoffs")
      .select("*")
      .eq("category", category)
      .gte("cutoff_rank", Number(rank))
      .order("cutoff_rank", { ascending: true })
      .limit(500);

    if (collegeFilter !== "__all__") query = query.eq("college_name", collegeFilter);
    if (branchFilter !== "__all__") query = query.eq("department_name", branchFilter);

    const { data } = await query;
    setResults((data as CutoffRow[]) ?? []);
    setLoading(false);
  };

  const isEmpty = useMemo(
    () => hasSearched && !loading && (results?.length ?? 0) === 0,
    [hasSearched, loading, results],
  );

  return (
    <section id="cutoffs" className="py-16 sm:py-24 bg-gradient-to-b from-cream to-background relative overflow-hidden">
      {/* decorative blobs */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-sunset-orange/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-sunset-yellow/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sunset-orange/10 text-sunset-orange text-xs font-bold tracking-wide uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5" /> KEAM 2026 Predictor
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-gradient-sunset">
            College Predictor
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Enter your KEAM rank and category — we'll show every college & branch where you historically had a chance.
          </p>
        </div>

        {/* Glassmorphism predictor card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative rounded-3xl p-6 sm:p-8 mb-10 backdrop-blur-xl bg-card/60 border border-white/30 shadow-2xl shadow-sunset-orange/10"
          style={{
            backgroundImage:
              "linear-gradient(135deg, color-mix(in oklab, var(--card) 80%, transparent) 0%, color-mix(in oklab, var(--card) 60%, transparent) 100%)",
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Target className="w-3 h-3 text-sunset-orange" /> Your KEAM Rank *
              </Label>
              <Input
                type="number"
                inputMode="numeric"
                placeholder="e.g. 4500"
                value={rank}
                onChange={(e) => setRank(e.target.value)}
                className="h-12 text-base bg-background/70 border-2 focus-visible:border-sunset-orange"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Category *
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-12 text-base bg-background/70 border-2">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Search College
              </Label>
              <SearchableCombobox
                value={collegeFilter}
                onChange={setCollegeFilter}
                options={colleges}
                allLabel="All colleges"
                placeholder="Search college..."
                emptyText="No college found."
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Search Branch
              </Label>
              <SearchableCombobox
                value={branchFilter}
                onChange={setBranchFilter}
                options={branches}
                allLabel="All branches"
                placeholder="Search branch..."
                emptyText="No branch found."
              />
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <Button
              onClick={handlePredict}
              disabled={!canPredict || loading}
              size="lg"
              className="h-14 px-10 text-base font-bold rounded-xl bg-gradient-sunset hover:opacity-95 text-white shadow-lg shadow-sunset-orange/30 transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Predicting...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" /> Predict My Chances
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {!hasSearched ? (
            <motion.div
              key="initial"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12 border-2 border-dashed border-border rounded-2xl bg-card/40 max-w-3xl mx-auto"
            >
              <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground font-medium">
                Enter your rank & category, then hit "Predict My Chances".
              </p>
            </motion.div>
          ) : isEmpty ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-12 border-2 border-dashed border-sunset-orange/30 rounded-2xl bg-card/40 max-w-3xl mx-auto"
            >
              <Search className="w-12 h-12 mx-auto text-sunset-orange/60 mb-4" />
              <p className="text-foreground font-semibold mb-1">No matches found for this specific filter.</p>
              <p className="text-sm text-muted-foreground">
                Try removing the College/Branch filters to see all possibilities.
              </p>
            </motion.div>
          ) : results && results.length > 0 ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center justify-between mb-4 px-1">
                <p className="text-sm text-muted-foreground font-medium">
                  Showing <span className="font-bold text-foreground">{results.length}</span> eligible options for category{" "}
                  <span className="font-bold text-sunset-orange">{category}</span>
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.map((r, idx) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.02, 0.5) }}
                    className="group relative rounded-2xl p-5 bg-card/70 backdrop-blur-md border border-border hover:border-sunset-orange/50 shadow-md hover:shadow-xl hover:shadow-sunset-orange/10 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-sunset-orange/10 text-sunset-orange">
                        <Trophy className="w-3 h-3" /> {r.phase}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-muted text-muted-foreground">
                        {r.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-foreground leading-snug mb-1 line-clamp-2">
                      {r.college_name}
                    </h3>
                    <p className="text-sm text-muted-foreground font-medium mb-4 line-clamp-2">
                      {r.department_name}
                    </p>
                    <div className="flex items-end justify-between pt-3 border-t border-border">
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Cutoff Rank</div>
                        <div className="text-2xl font-extrabold text-gradient-sunset tabular-nums">
                          {r.cutoff_rank.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Your Rank</div>
                        <div className="text-sm font-bold text-foreground tabular-nums">{Number(rank).toLocaleString()}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <p className="text-center text-xs text-muted-foreground mt-6">
          * Predictions are based on historical KEAM allotment data. Actual cut-offs may vary year to year.
        </p>
      </div>
    </section>
  );
}
