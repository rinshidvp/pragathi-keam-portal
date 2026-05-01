import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Check, ChevronsUpDown, GraduationCap, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

const CATEGORIES = ["SM", "EZ", "MU", "BH", "LA", "BX", "KU", "SC", "ST"] as const;

interface College { id: string; name: string; code: string; }
interface Department { id: string; name: string; }
interface CutoffRow {
  id: string;
  category: string;
  rank: number | null;
  year: number;
  college_department_id: string;
  college_departments: {
    id: string;
    college_id: string;
    department_id: string;
    colleges: { id: string; name: string; code: string };
    departments: { id: string; name: string };
  } | null;
}

export default function CutoffPredictor() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [cutoffs, setCutoffs] = useState<CutoffRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [collegeId, setCollegeId] = useState<string | null>(null);
  const [departmentId, setDepartmentId] = useState<string | null>(null);
  const [collegeOpen, setCollegeOpen] = useState(false);
  const [deptOpen, setDeptOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase.from("colleges").select("*").order("name"),
      supabase.from("departments").select("*").order("name"),
    ]).then(([c, d]) => {
      setColleges((c.data as College[]) ?? []);
      setDepartments((d.data as Department[]) ?? []);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!collegeId) {
      setCutoffs([]);
      return;
    }
    supabase
      .from("cutoffs")
      .select(`
        id, category, rank, year, college_department_id,
        college_departments!inner (
          id, college_id, department_id,
          colleges!inner ( id, name, code ),
          departments!inner ( id, name )
        )
      `)
      .eq("college_departments.college_id", collegeId)
      .then(({ data }) => {
        setCutoffs((data as unknown as CutoffRow[]) ?? []);
      });
  }, [collegeId]);

  // Group cutoffs by department, optionally filter by departmentId
  const grouped = useMemo(() => {
    const filtered = departmentId
      ? cutoffs.filter((c) => c.college_departments?.department_id === departmentId)
      : cutoffs;

    const map = new Map<string, { deptName: string; year: number; ranks: Record<string, number | null> }>();
    for (const row of filtered) {
      const key = `${row.college_department_id}-${row.year}`;
      const deptName = row.college_departments?.departments.name ?? "Unknown";
      if (!map.has(key)) {
        map.set(key, { deptName, year: row.year, ranks: {} });
      }
      map.get(key)!.ranks[row.category] = row.rank;
    }
    return Array.from(map.values()).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return a.deptName.localeCompare(b.deptName);
    });
  }, [cutoffs, departmentId]);

  const selectedCollege = colleges.find((c) => c.id === collegeId);
  const selectedDept = departments.find((d) => d.id === departmentId);

  return (
    <section id="cutoffs" className="py-16 sm:py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="inline-block px-3 py-1 rounded-full bg-sunset-orange/10 text-sunset-orange text-xs font-bold tracking-wide uppercase mb-3">
            Predict Your College
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-gradient-sunset">
            KEAM Cut-Off Finder
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Pick a college and (optionally) a branch to see historical category-wise cut-off ranks.
          </p>
        </div>

        {/* Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 max-w-4xl mx-auto">
          {/* College */}
          <Popover open={collegeOpen} onOpenChange={setCollegeOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={collegeOpen}
                className="h-14 justify-between text-left bg-card border-2 hover:border-sunset-orange/50 hover:bg-card transition-all rounded-xl shadow-sm"
                disabled={loading}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-gradient-sunset/10 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-5 h-5 text-sunset-orange" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">College</div>
                    <div className="text-sm font-semibold truncate">
                      {selectedCollege ? selectedCollege.name : "Search college..."}
                    </div>
                  </div>
                </div>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search college..." />
                <CommandList>
                  <CommandEmpty>No college found.</CommandEmpty>
                  <CommandGroup>
                    {colleges.map((c) => (
                      <CommandItem
                        key={c.id}
                        value={`${c.name} ${c.code}`}
                        onSelect={() => {
                          setCollegeId(c.id === collegeId ? null : c.id);
                          setDepartmentId(null);
                          setCollegeOpen(false);
                        }}
                      >
                        <Check className={cn("mr-2 h-4 w-4", collegeId === c.id ? "opacity-100" : "opacity-0")} />
                        <span className="font-medium">{c.name}</span>
                        <span className="ml-auto text-xs text-muted-foreground">{c.code}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Department (optional) */}
          <Popover open={deptOpen} onOpenChange={setDeptOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={deptOpen}
                className="h-14 justify-between text-left bg-card border-2 hover:border-sunset-orange/50 hover:bg-card transition-all rounded-xl shadow-sm"
                disabled={loading}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-gradient-sunset/10 flex items-center justify-center shrink-0">
                    <Search className="w-5 h-5 text-sunset-orange" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Branch (optional)</div>
                    <div className="text-sm font-semibold truncate">
                      {selectedDept ? selectedDept.name : "All branches"}
                    </div>
                  </div>
                </div>
                {departmentId ? (
                  <X
                    className="ml-2 h-4 w-4 shrink-0 opacity-60 hover:opacity-100"
                    onClick={(e) => { e.stopPropagation(); setDepartmentId(null); }}
                  />
                ) : (
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search branch..." />
                <CommandList>
                  <CommandEmpty>No branch found.</CommandEmpty>
                  <CommandGroup>
                    {departments.map((d) => (
                      <CommandItem
                        key={d.id}
                        value={d.name}
                        onSelect={() => {
                          setDepartmentId(d.id === departmentId ? null : d.id);
                          setDeptOpen(false);
                        }}
                      >
                        <Check className={cn("mr-2 h-4 w-4", departmentId === d.id ? "opacity-100" : "opacity-0")} />
                        {d.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {!collegeId ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16 border-2 border-dashed border-border rounded-2xl bg-card/40 max-w-3xl mx-auto"
            >
              <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground font-medium">
                Select a college and branch to view historical cutoffs.
              </p>
            </motion.div>
          ) : grouped.length === 0 ? (
            <motion.div
              key="no-data"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16 border-2 border-dashed border-border rounded-2xl bg-card/40 max-w-3xl mx-auto"
            >
              <p className="text-muted-foreground font-medium">
                No cut-off data available yet for this selection.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="overflow-x-auto bg-card border border-border rounded-2xl shadow-lg"
            >
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-sunset-yellow/10 via-sunset-orange/10 to-sunset-red/10 border-b border-border">
                    <th className="text-left px-4 py-4 font-bold text-foreground sticky left-0 bg-card z-10">Branch</th>
                    <th className="text-center px-3 py-4 font-bold text-muted-foreground">Year</th>
                    {CATEGORIES.map((cat) => (
                      <th key={cat} className="text-center px-3 py-4 font-bold text-foreground">{cat}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {grouped.map((row, idx) => (
                    <motion.tr
                      key={`${row.deptName}-${row.year}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="border-t border-border hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3.5 font-semibold text-foreground sticky left-0 bg-card z-10">
                        {row.deptName}
                      </td>
                      <td className="text-center px-3 py-3.5 text-muted-foreground font-medium">{row.year}</td>
                      {CATEGORIES.map((cat) => (
                        <td key={cat} className="text-center px-3 py-3.5 text-muted-foreground tabular-nums">
                          {row.ranks[cat]?.toLocaleString() ?? "—"}
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-xs text-muted-foreground mt-4">
          * Ranks are based on previous year KEAM allotment data. Actual cut-offs may vary.
        </p>
      </div>
    </section>
  );
}
