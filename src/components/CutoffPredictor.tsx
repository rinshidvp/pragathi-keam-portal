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

const CATEGORIES = ["SM", "EZ", "MU", "BH", "LA", "BX", "KU", "SC", "ST", "EW"] as const;
type Category = typeof CATEGORIES[number];

const PHASE_OPTIONS = ["All Phases", "Phase 1", "Phase 2"] as const;

interface CutoffResult {
  id: string;
  college_name: string;
  department_name: string;
  phase: string;
  matched_rank: number;
}

export default function CutoffPredictor() {
  const [rank, setRank] = useState<string>("");
  const [category, setCategory] = useState<Category | "">("");
  const [phaseFilter, setPhaseFilter] = useState<string>("All Phases");
  const [collegeFilter, setCollegeFilter] = useState<string>("__all__");
  const [branchFilter, setBranchFilter] = useState<string>("__all__");

  const [colleges, setColleges] = useState<string[]>([]);
  const [branches, setBranches] = useState<string[]>([]);

  const [results, setResults] = useState<CutoffResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Fetch DISTINCT colleges & branches directly from cutoffs table
  useEffect(() => {
    supabase
      .from("cutoffs")
      .select("college_name, department_name")
      .limit(20000)
      .then(({ data }) => {
        if (!data) return;
        const collegeSet = new Map<string, string>();
        const branchSet = new Map<string, string>();
        for (const row of data) {
          if (row.college_name) collegeSet.set(row.college_name.toLowerCase(), row.college_name);
          if (row.department_name) branchSet.set(row.department_name.toLowerCase(), row.department_name);
        }
        setColleges(Array.from(collegeSet.values()).sort());
        setBranches(Array.from(branchSet.values()).sort());
      });
  }, []);

  const canPredict = rank.trim() !== "" && category !== "" && Number(rank) > 0;

  const handlePredict = async () => {
    if (!canPredict || !category) return;
    setLoading(true);
    setHasSearched(true);

    let query = supabase
      .from("cutoffs")
      .select(`id, college_name, department_name, phase, ${category}`)
      .gte(category, Number(rank))
      .not(category, "is", null)
      .order(category, { ascending: true })
      .limit(500);

    if (phaseFilter !== "All Phases") query = query.eq("phase", phaseFilter);
    if (collegeFilter !== "__all__") query = query.ilike("college_name", collegeFilter);
    if (branchFilter !== "__all__") query = query.ilike("department_name", branchFilter);

    const { data, error } = await query;
    if (error) {
      console.error("Predictor query error:", error);
      setResults([]);
      setLoading(false);
      return;
    }

    const mapped: CutoffResult[] = (data ?? []).map((r: Record<string, unknown>) => ({
      id: String(r.id),
      college_name: String(r.college_name),
      department_name: String(r.department_name),
      phase: String(r.phase),
      matched_rank: Number(r[category]),
    }));
    setResults(mapped);
    setLoading(false);
  };

  const isEmpty = useMemo(
    () => hasSearched && !loading && (results?.length ?? 0) === 0,
    [hasSearched, loading, results],
  );

  return (
    <section id="cutoffs" className="py-16 sm:py-24 bg-gradient-to-b from-cream to-background relative overflow-hidden">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
              <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
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
                Select Phase *
              </Label>
              <Select value={phaseFilter} onValueChange={setPhaseFilter}>
                <SelectTrigger className="h-12 text-base bg-background/70 border-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PHASE_OPTIONS.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
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
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Predicting...</>
              ) : (
                <><Sparkles className="mr-2 h-5 w-5" /> Predict My Chances</>
              )}
            </Button>
          </div>
        </motion.div>

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
                Try changing the Phase or removing the College/Branch filters to see all possibilities.
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
                  {phaseFilter !== "All Phases" && <> · <span className="font-bold text-foreground">{phaseFilter}</span></>}
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
                        {category}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-foreground leading-snug mb-1 line-clamp-2">
                      {r.college_name}
                    </h3>
                    <p className="text-sm text-muted-foreground font-medium mb-4 line-clamp-2">
                      {r.department_name}
                    </p>
                    <div className="flex items-end justify-between pt-3 border-t border-border">
                      <div className="rounded-lg px-2 py-1 bg-sunset-orange/10 ring-1 ring-sunset-orange/30">
                        <div className="text-[10px] uppercase tracking-wider text-sunset-orange font-bold">Matched Cutoff</div>
                        <div className="text-2xl font-extrabold text-gradient-sunset tabular-nums">
                          {r.matched_rank.toLocaleString()}
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

interface SearchableComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  allLabel: string;
  placeholder: string;
  emptyText: string;
}

function SearchableCombobox({ value, onChange, options, allLabel, placeholder, emptyText }: SearchableComboboxProps) {
  const [open, setOpen] = useState(false);
  const display = value === "__all__" ? allLabel : value;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-12 w-full justify-between text-base bg-background/70 border-2 font-normal"
        >
          <span className={cn("truncate", value === "__all__" && "text-muted-foreground")}>{display}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder={placeholder} className="h-10" />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              <CommandItem value={allLabel} onSelect={() => { onChange("__all__"); setOpen(false); }}>
                <Check className={cn("mr-2 h-4 w-4", value === "__all__" ? "opacity-100" : "opacity-0")} />
                {allLabel}
              </CommandItem>
              {options.map((opt) => (
                <CommandItem key={opt} value={opt} onSelect={() => { onChange(opt); setOpen(false); }}>
                  <Check className={cn("mr-2 h-4 w-4", value === opt ? "opacity-100" : "opacity-0")} />
                  {opt}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
