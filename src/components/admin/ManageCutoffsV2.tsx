import { useEffect, useRef, useState } from "react";
import Papa from "papaparse";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const PHASES = ["Phase 1", "Phase 2"] as const;
const CATEGORY_KEYS = ["SM", "EZ", "MU", "BH", "LA", "BX", "KU", "SC", "ST", "EW"] as const;
type CategoryKey = typeof CATEGORY_KEYS[number];

interface CutoffRow {
  id: string;
  college_name: string;
  department_name: string;
  phase: string;
  SM: number | null;
  EZ: number | null;
  MU: number | null;
  BH: number | null;
  LA: number | null;
  BX: number | null;
  KU: number | null;
  SC: number | null;
  ST: number | null;
  EW: number | null;
}

type InsertRow = {
  college_name: string;
  department_name: string;
  phase: string;
} & Partial<Record<CategoryKey, number | null>>;

function parseRank(raw: unknown): number | null {
  if (raw === null || raw === undefined) return null;
  const s = String(raw).trim();
  if (!s || s === "-" || s.toLowerCase() === "na" || s.toLowerCase() === "n/a") return null;
  const n = parseInt(s.replace(/,/g, ""), 10);
  return Number.isNaN(n) ? null : n;
}

export default function ManageCutoffsV2() {
  const [phase, setPhase] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [recent, setRecent] = useState<CutoffRow[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadStats = async () => {
    const { count } = await supabase
      .from("cutoffs")
      .select("*", { count: "exact", head: true });
    setTotalCount(count ?? 0);

    const { data } = await supabase
      .from("cutoffs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    setRecent((data as CutoffRow[]) ?? []);
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleUpload = async () => {
    if (!file) return toast.error("Please choose a CSV file.");
    if (!phase) return toast.error("Please select a phase first.");

    setUploading(true);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      complete: async (parsed) => {
        try {
          const rows: InsertRow[] = [];

          for (const r of parsed.data) {
            const collegeKey = Object.keys(r).find((k) => /^college$|^college[_ ]?name$/i.test(k));
            const deptKey = Object.keys(r).find((k) => /^department$|^branch$|^dept$|^department[_ ]?name$/i.test(k));

            const cleanText = (v: string | undefined) =>
              (v ?? "").replace(/\s+/g, " ").trim().replace(/[.\s]+$/, "").trim();
            const college = cleanText(collegeKey ? r[collegeKey] : "");
            const dept = cleanText(deptKey ? r[deptKey] : "");
            if (!college || !dept) continue;

            const row: InsertRow = {
              college_name: college,
              department_name: dept,
              phase,
            };

            for (const cat of CATEGORY_KEYS) {
              const matchKey = Object.keys(r).find((k) => k.toUpperCase() === cat);
              row[cat] = matchKey ? parseRank(r[matchKey]) : null;
            }

            rows.push(row);
          }

          if (rows.length === 0) {
            toast.error("No valid rows found. Required columns: College, Department, plus any of SM, EZ, MU, BH, LA, BX, KU, SC, ST, EW.");
            setUploading(false);
            return;
          }

          const chunkSize = 500;
          let inserted = 0;
          for (let i = 0; i < rows.length; i += chunkSize) {
            const chunk = rows.slice(i, i + chunkSize);
            const { error } = await supabase.from("cutoffs").insert(chunk);
            if (error) throw error;
            inserted += chunk.length;
          }

          toast.success(`Uploaded ${inserted} cutoff rows for ${phase}`);
          setFile(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
          loadStats();
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Unknown error";
          toast.error(`Upload failed: ${msg}`);
        } finally {
          setUploading(false);
        }
      },
      error: (err) => {
        toast.error(`CSV parse error: ${err.message}`);
        setUploading(false);
      },
    });
  };

  const handleClearAll = async () => {
    const { error } = await supabase.from("cutoffs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) {
      toast.error(`Failed to clear: ${error.message}`);
      return;
    }
    toast.success("All cutoffs cleared.");
    loadStats();
  };

  const handleDeleteRow = async (id: string) => {
    const { error } = await supabase.from("cutoffs").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Row deleted");
    loadStats();
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gradient-sunset">Manage Cutoffs</h1>
        <p className="text-sm text-muted-foreground">
          Bulk upload KEAM cutoff data from CSV files. Total rows in DB:{" "}
          <span className="font-bold text-foreground">{totalCount.toLocaleString()}</span>
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border-2 border-dashed border-sunset-orange/30 bg-card/60 backdrop-blur p-6 sm:p-8 space-y-5"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-sunset/10 flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5 text-sunset-orange" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Bulk CSV Upload</h2>
            <p className="text-xs text-muted-foreground">
              Expected columns: College, Department, SM, EZ, MU, BH, LA, BX, KU, SC, ST, EW. Empty / "-" cells become NULL.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider">Select Phase for this Data *</Label>
            <Select value={phase} onValueChange={setPhase}>
              <SelectTrigger className="h-12 bg-background border-2">
                <SelectValue placeholder="Choose phase..." />
              </SelectTrigger>
              <SelectContent>
                {PHASES.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider">CSV File *</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full h-12 px-3 text-sm rounded-md border-2 border-input bg-background file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-sunset-orange/10 file:text-sunset-orange file:font-semibold cursor-pointer"
            />
          </div>
        </div>

        {phase && (
          <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg bg-sunset-orange/10 text-sunset-orange">
            <CheckCircle2 className="w-4 h-4" />
            All rows in this CSV will be tagged as <span className="font-bold">{phase}</span>.
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleUpload}
            disabled={uploading || !file || !phase}
            className="bg-gradient-sunset text-white hover:opacity-95 h-11 px-6 font-bold"
          >
            {uploading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</>
            ) : (
              <><Upload className="mr-2 h-4 w-4" /> Upload CSV</>
            )}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="h-11 px-6 font-bold">
                <Trash2 className="mr-2 h-4 w-4" /> Clear All Cutoffs
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  Delete ALL cutoff data?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all {totalCount.toLocaleString()} cutoff rows from the database.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearAll}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Yes, delete everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </motion.div>

      <div>
        <h3 className="font-bold text-base mb-3">Recent Entries (latest 20)</h3>
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-3 py-2 font-bold">College</th>
                <th className="text-left px-3 py-2 font-bold">Branch</th>
                <th className="text-center px-3 py-2 font-bold">Phase</th>
                {CATEGORY_KEYS.map((c) => (
                  <th key={c} className="text-right px-2 py-2 font-bold">{c}</th>
                ))}
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 ? (
                <tr><td colSpan={4 + CATEGORY_KEYS.length} className="text-center py-8 text-muted-foreground">No data yet — upload a CSV to begin.</td></tr>
              ) : recent.map((r) => (
                <tr key={r.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-3 py-2 font-medium truncate max-w-[180px]">{r.college_name}</td>
                  <td className="px-3 py-2 text-muted-foreground truncate max-w-[180px]">{r.department_name}</td>
                  <td className="px-3 py-2 text-center">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-sunset-orange/10 text-sunset-orange font-semibold">{r.phase}</span>
                  </td>
                  {CATEGORY_KEYS.map((c) => (
                    <td key={c} className="px-2 py-2 text-right tabular-nums">
                      {r[c] !== null && r[c] !== undefined ? r[c]!.toLocaleString() : <span className="text-muted-foreground/40">—</span>}
                    </td>
                  ))}
                  <td className="px-3 py-2 text-right">
                    <Button size="icon" variant="ghost" onClick={() => handleDeleteRow(r.id)} className="h-7 w-7 text-destructive hover:bg-destructive/10">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
