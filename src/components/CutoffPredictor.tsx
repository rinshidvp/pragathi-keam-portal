import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Check, ChevronLeft, ChevronRight, ChevronsUpDown, GraduationCap, Loader2, Search, Sparkles, Target, Trophy } from "lucide-react";
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
const PAGE_SIZE = 50;
const COOLDOWN_MS = 2000;
const STALE_TIME = 30 * 60 * 1000; // 30 minutes

interface CutoffResult {
  id: string;
  college_name: string;
  department_name: string;
  phase: string;
  matched_rank: number;
}

interface SearchParams {
  rank: number;
  category: Category;
  phaseFilter: string;
  collegeFilter: string;
  branchFilter: string;
}

async function fetchFilters() {
  const { data } = await supabase
    .from("cutoffs")
    .select("college_name, department_name")
    .limit(20000);
  const collegeSet = new Map<string, string>();
  const branchSet = new Map<string, string>();
  // Map of lowercased college name -> Map of lowercased branch -> display branch
  const collegeToBranches = new Map<string, Map<string, string>>();
  for (const row of data ?? []) {
    if (row.college_name) collegeSet.set(row.college_name.toLowerCase(), row.college_name);
    if (row.department_name) branchSet.set(row.department_name.toLowerCase(), row.department_name);
    if (row.college_name && row.department_name) {
      const key = row.college_name.toLowerCase();
      if (!collegeToBranches.has(key)) collegeToBranches.set(key, new Map());
      collegeToBranches.get(key)!.set(row.department_name.toLowerCase(), row.department_name);
    }
  }
  return {
    colleges: Array.from(collegeSet.values()).sort(),
    branches: Array.from(branchSet.values()).sort(),
    collegeToBranches,
  };
}

async function fetchPredictions(params: SearchParams, page: number): Promise<{ results: CutoffResult[]; total: number }> {
  const { rank, category, phaseFilter, collegeFilter, branchFilter } = params;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("cutoffs")
    .select(`id, college_name, department_name, phase, ${category}`, { count: "exact" })
    .gte(category, rank)
    .not(category, "is", null)
    .order(category, { ascending: true })
    .range(from, to);

  if (phaseFilter !== "All Phases") query = query.eq("phase", phaseFilter);
  if (collegeFilter !== "__all__") query = query.ilike("college_name", collegeFilter);
  if (branchFilter !== "__all__") query = query.ilike("department_name", branchFilter);

  const { data, error, count } = await query;
  if (error) throw error;

  const results: CutoffResult[] = (data ?? []).map((r: Record<string, unknown>) => ({
    id: String(r.id),
    college_name: String(r.college_name),
    department_name: String(r.department_name),
    phase: String(r.phase),
    matched_rank: Number(r[category]),
  }));
  return { results, total: count ?? 0 };
}

export default function CutoffPredictor() {
  const [rank, setRank] = useState<string>("");
  const [category, setCategory] = useState<Category | "">("");
  const [phaseFilter, setPhaseFilter] = useState<string>("All Phases");
  const [collegeFilter, setCollegeFilter] = useState<string>("__all__");
  const [branchFilter, setBranchFilter] = useState<string>("__all__");

  const [search, setSearch] = useState<SearchParams | null>(null);
  const [page, setPage] = useState(1);
  const [cooldown, setCooldown] = useState(false);
  const lastClickRef = useRef(0);

  const filtersQuery = useQuery({
    queryKey: ["cutoffs", "filters"],
    queryFn: fetchFilters,
    staleTime: STALE_TIME,
  });
  const colleges = filtersQuery.data?.colleges ?? [];
  const allBranches = filtersQuery.data?.branches ?? [];
  const collegeToBranches = filtersQuery.data?.collegeToBranches;

  // Cascading: if a specific college is selected, only show branches offered there
  const branches = useMemo(() => {
    if (collegeFilter === "__all__" || !collegeToBranches) return allBranches;
    const map = collegeToBranches.get(collegeFilter.toLowerCase());
    return map ? Array.from(map.values()).sort() : allBranches;
  }, [collegeFilter, collegeToBranches, allBranches]);

  const handleCollegeChange = (next: string) => {
    setCollegeFilter(next);
    // If the currently selected branch is not offered by the new college, reset it
    if (next !== "__all__" && branchFilter !== "__all__" && collegeToBranches) {
      const map = collegeToBranches.get(next.toLowerCase());
      if (!map || !map.has(branchFilter.toLowerCase())) {
        setBranchFilter("__all__");
      }
    }
  };
    queryKey: ["cutoffs", "predict", search, page],
    queryFn: () => fetchPredictions(search!, page),
    enabled: !!search,
    staleTime: STALE_TIME,
    placeholderData: keepPreviousData,
  });

  const canPredict = rank.trim() !== "" && category !== "" && Number(rank) > 0;
  const loading = predictionQuery.isFetching;

  const handlePredict = () => {
    if (!canPredict || !category) return;
    const now = Date.now();
    if (now - lastClickRef.current < COOLDOWN_MS) return;
    if (loading) return;
    lastClickRef.current = now;
    setCooldown(true);
    setTimeout(() => setCooldown(false), COOLDOWN_MS);
    setPage(1);
    setSearch({
      rank: Number(rank),
      category,
      phaseFilter,
      collegeFilter,
      branchFilter,
    });
  };

  const results = predictionQuery.data?.results ?? [];
  const total = predictionQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasSearched = !!search;
  const isEmpty = useMemo(
    () => hasSearched && !loading && results.length === 0,
    [hasSearched, loading, results.length],
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
              disabled={!canPredict || loading || cooldown}
              size="lg"
              className="h-14 px-10 text-base font-bold rounded-xl bg-gradient-sunset hover:opacity-95 text-white shadow-lg shadow-sunset-orange/30 transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              {loading ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Predicting...</>
              ) : cooldown ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Please wait...</>
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
          ) : results.length > 0 && search ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center justify-between mb-4 px-1 flex-wrap gap-2">
                <p className="text-sm text-muted-foreground font-medium">
                  Showing <span className="font-bold text-foreground">{(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, total)}</span> of{" "}
                  <span className="font-bold text-foreground">{total.toLocaleString()}</span> options for category{" "}
                  <span className="font-bold text-sunset-orange">{search.category}</span>
                  {search.phaseFilter !== "All Phases" && <> · <span className="font-bold text-foreground">{search.phaseFilter}</span></>}
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
                        {search.category}
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
                        <div className="text-sm font-bold text-foreground tabular-nums">{search.rank.toLocaleString()}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {totalPages > 1 && (
                <PaginationBar
                  page={page}
                  totalPages={totalPages}
                  onChange={(p) => {
                    setPage(p);
                    document.getElementById("cutoffs")?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                />
              )}
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

interface PaginationBarProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

function PaginationBar({ page, totalPages, onChange }: PaginationBarProps) {
  const pages = useMemo(() => {
    const out: (number | "...")[] = [];
    const window = 1;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - window && i <= page + window)) {
        out.push(i);
      } else if (out[out.length - 1] !== "...") {
        out.push("...");
      }
    }
    return out;
  }, [page, totalPages]);

  return (
    <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
      <p className="text-sm text-muted-foreground font-medium">
        Page <span className="font-bold text-foreground">{page}</span> of <span className="font-bold text-foreground">{totalPages}</span>
      </p>
      <div className="flex items-center gap-1 flex-wrap justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="h-9 gap-1"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </Button>
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`e${i}`} className="px-2 text-muted-foreground">…</span>
          ) : (
            <Button
              key={p}
              variant={p === page ? "default" : "outline"}
              size="sm"
              onClick={() => onChange(p)}
              className={cn("h-9 min-w-9", p === page && "bg-gradient-sunset text-white border-transparent")}
            >
              {p}
            </Button>
          ),
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="h-9 gap-1"
        >
          Next <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
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
