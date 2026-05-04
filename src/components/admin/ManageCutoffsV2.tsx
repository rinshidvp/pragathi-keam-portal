import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Check, ChevronsUpDown, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CATEGORIES = ["SM", "EZ", "MU", "BH", "LA", "BX", "KU", "SC", "ST"] as const;
type Category = typeof CATEGORIES[number];

interface College { id: string; name: string; code: string; }
interface Department { id: string; name: string; }

export default function ManageCutoffsV2() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  const [collegeId, setCollegeId] = useState<string | null>(null);
  const [deptId, setDeptId] = useState<string | null>(null);
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());
  const [ranks, setRanks] = useState<Record<Category, string>>(() => Object.fromEntries(CATEGORIES.map((c) => [c, ""])) as Record<Category, string>);
  const [saving, setSaving] = useState(false);

  const [collegeOpen, setCollegeOpen] = useState(false);
  const [deptOpen, setDeptOpen] = useState(false);

  // Add new modals
  const [addCollegeOpen, setAddCollegeOpen] = useState(false);
  const [addDeptOpen, setAddDeptOpen] = useState(false);
  const [newCollege, setNewCollege] = useState({ name: "", code: "" });
  const [newDept, setNewDept] = useState({ name: "" });

  const loadAll = async () => {
    const [c, d] = await Promise.all([
      supabase.from("colleges").select("*").order("name"),
      supabase.from("departments").select("*").order("name"),
    ]);
    setColleges((c.data as College[]) ?? []);
    setDepartments((d.data as Department[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  // Load existing cutoffs when college/dept/year change
  useEffect(() => {
    if (!collegeId || !deptId) return;
    (async () => {
      // Find college_department row
      const { data: cd } = await supabase
        .from("college_departments")
        .select("id")
        .eq("college_id", collegeId)
        .eq("department_id", deptId)
        .maybeSingle();
      if (!cd) {
        setRanks(Object.fromEntries(CATEGORIES.map((c) => [c, ""])) as Record<Category, string>);
        return;
      }
      const { data: existing } = await supabase
        .from("cutoffs")
        .select("category, rank")
        .eq("college_department_id", cd.id)
        .eq("year", parseInt(year, 10));
      const next = Object.fromEntries(CATEGORIES.map((c) => [c, ""])) as Record<Category, string>;
      (existing ?? []).forEach((r) => {
        if (r.rank != null) next[r.category as Category] = String(r.rank);
      });
      setRanks(next);
    })();
  }, [collegeId, deptId, year]);

  const selectedCollege = colleges.find((c) => c.id === collegeId);
  const selectedDept = departments.find((d) => d.id === deptId);
  const yearNum = useMemo(() => parseInt(year, 10), [year]);

  const handleAddCollege = async () => {
    if (!newCollege.name.trim() || !newCollege.code.trim()) return;
    const { data, error } = await supabase
      .from("colleges")
      .insert({ name: newCollege.name.trim(), code: newCollege.code.trim().toUpperCase() })
      .select()
      .single();
    if (error) { toast.error(error.message); return; }
    setColleges((prev) => [...prev, data as College].sort((a, b) => a.name.localeCompare(b.name)));
    setCollegeId((data as College).id);
    setNewCollege({ name: "", code: "" });
    setAddCollegeOpen(false);
    toast.success("College added");
  };

  const handleAddDept = async () => {
    if (!newDept.name.trim()) return;
    const { data, error } = await supabase
      .from("departments")
      .insert({ name: newDept.name.trim() })
      .select()
      .single();
    if (error) { toast.error(error.message); return; }
    setDepartments((prev) => [...prev, data as Department].sort((a, b) => a.name.localeCompare(b.name)));
    setDeptId((data as Department).id);
    setNewDept({ name: "" });
    setAddDeptOpen(false);
    toast.success("Department added");
  };

  const handleSave = async () => {
    if (!collegeId || !deptId || !yearNum) {
      toast.error("Select college, department, and year");
      return;
    }
    setSaving(true);
    try {
      // Ensure college_department exists
      let cdId: string;
      const { data: existingCd } = await supabase
        .from("college_departments")
        .select("id")
        .eq("college_id", collegeId)
        .eq("department_id", deptId)
        .maybeSingle();
      if (existingCd) {
        cdId = existingCd.id;
      } else {
        const { data: newCd, error: cdErr } = await supabase
          .from("college_departments")
          .insert({ college_id: collegeId, department_id: deptId })
          .select("id")
          .single();
        if (cdErr) throw cdErr;
        cdId = newCd.id;
      }

      // Upsert each non-empty rank
      const rows = CATEGORIES
        .filter((cat) => ranks[cat].trim() !== "")
        .map((cat) => ({
          college_department_id: cdId,
          category: cat,
          rank: parseInt(ranks[cat], 10),
          year: yearNum,
        }));

      // Delete empty ones for this combo (if any) so admins can clear values
      const emptyCats = CATEGORIES.filter((cat) => ranks[cat].trim() === "");
      if (emptyCats.length > 0) {
        await supabase
          .from("cutoffs")
          .delete()
          .eq("college_department_id", cdId)
          .eq("year", yearNum)
          .in("category", emptyCats);
      }

      if (rows.length > 0) {
        const { error } = await supabase
          .from("cutoffs")
          .upsert(rows, { onConflict: "college_department_id,category,year" });
        if (error) throw error;
      }

      toast.success("Cutoffs saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCollege = async () => {
    if (!collegeId) return;
    if (!confirm(`Delete college "${selectedCollege?.name}" and ALL its cutoff data? This cannot be undone.`)) return;
    const { data: cds } = await supabase.from("college_departments").select("id").eq("college_id", collegeId);
    const cdIds = (cds ?? []).map((r) => r.id);
    if (cdIds.length) {
      await supabase.from("cutoffs").delete().in("college_department_id", cdIds);
      await supabase.from("college_departments").delete().eq("college_id", collegeId);
    }
    const { error } = await supabase.from("colleges").delete().eq("id", collegeId);
    if (error) { toast.error(error.message); return; }
    toast.success("College deleted");
    setColleges((p) => p.filter((c) => c.id !== collegeId));
    setCollegeId(null);
  };

  const handleDeleteDept = async () => {
    if (!deptId) return;
    if (!confirm(`Delete department "${selectedDept?.name}" and ALL its cutoff data across colleges? This cannot be undone.`)) return;
    const { data: cds } = await supabase.from("college_departments").select("id").eq("department_id", deptId);
    const cdIds = (cds ?? []).map((r) => r.id);
    if (cdIds.length) {
      await supabase.from("cutoffs").delete().in("college_department_id", cdIds);
      await supabase.from("college_departments").delete().eq("department_id", deptId);
    }
    const { error } = await supabase.from("departments").delete().eq("id", deptId);
    if (error) { toast.error(error.message); return; }
    toast.success("Department deleted");
    setDepartments((p) => p.filter((d) => d.id !== deptId));
    setDeptId(null);
  };

  const handleClearYear = async () => {
    if (!collegeId || !deptId || !yearNum) return;
    if (!confirm(`Clear all ${yearNum} cutoffs for this college + branch?`)) return;
    const { data: cd } = await supabase
      .from("college_departments")
      .select("id")
      .eq("college_id", collegeId)
      .eq("department_id", deptId)
      .maybeSingle();
    if (!cd) return;
    const { error } = await supabase.from("cutoffs").delete().eq("college_department_id", cd.id).eq("year", yearNum);
    if (error) { toast.error(error.message); return; }
    setRanks(Object.fromEntries(CATEGORIES.map((c) => [c, ""])) as Record<Category, string>);
    toast.success("Cutoffs cleared");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground">Manage Cutoffs</h2>
          <p className="text-sm text-muted-foreground mt-1">Tab through category fields to enter ranks rapidly.</p>
        </div>
      </div>

      {loading ? (
        <div className="h-32 bg-muted rounded-xl animate-pulse" />
      ) : (
        <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 space-y-6">
          {/* Row 1: College + Dept selectors */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* College */}
            <div>
              <Label className="text-xs uppercase tracking-wide font-bold text-muted-foreground mb-1.5 block">College</Label>
              <div className="flex gap-2">
                <Popover open={collegeOpen} onOpenChange={setCollegeOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="flex-1 justify-between h-11">
                      <span className="truncate">{selectedCollege?.name ?? "Select college..."}</span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search college..." />
                      <CommandList>
                        <CommandEmpty>No college found.</CommandEmpty>
                        <CommandGroup>
                          {colleges.map((c) => (
                            <CommandItem key={c.id} value={`${c.name} ${c.code}`} onSelect={() => { setCollegeId(c.id); setCollegeOpen(false); }}>
                              <Check className={cn("mr-2 h-4 w-4", collegeId === c.id ? "opacity-100" : "opacity-0")} />
                              <span>{c.name}</span>
                              <span className="ml-auto text-xs text-muted-foreground">{c.code}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <Button variant="outline" size="icon" className="h-11 w-11 shrink-0" onClick={() => setAddCollegeOpen(true)} title="Add college">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Department */}
            <div>
              <Label className="text-xs uppercase tracking-wide font-bold text-muted-foreground mb-1.5 block">Department</Label>
              <div className="flex gap-2">
                <Popover open={deptOpen} onOpenChange={setDeptOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="flex-1 justify-between h-11">
                      <span className="truncate">{selectedDept?.name ?? "Select department..."}</span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search department..." />
                      <CommandList>
                        <CommandEmpty>No department found.</CommandEmpty>
                        <CommandGroup>
                          {departments.map((d) => (
                            <CommandItem key={d.id} value={d.name} onSelect={() => { setDeptId(d.id); setDeptOpen(false); }}>
                              <Check className={cn("mr-2 h-4 w-4", deptId === d.id ? "opacity-100" : "opacity-0")} />
                              {d.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <Button variant="outline" size="icon" className="h-11 w-11 shrink-0" onClick={() => setAddDeptOpen(true)} title="Add department">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Year */}
          <div className="max-w-[200px]">
            <Label className="text-xs uppercase tracking-wide font-bold text-muted-foreground mb-1.5 block">Year</Label>
            <Input type="number" value={year} onChange={(e) => setYear(e.target.value)} className="h-11" />
          </div>

          {/* Row 2: Category grid */}
          <div>
            <Label className="text-xs uppercase tracking-wide font-bold text-muted-foreground mb-2 block">Category Ranks</Label>
            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
              {CATEGORIES.map((cat) => (
                <div key={cat} className="space-y-1">
                  <div className="text-center text-[11px] font-bold text-sunset-orange tracking-wider">{cat}</div>
                  <Input
                    type="number"
                    inputMode="numeric"
                    placeholder="—"
                    value={ranks[cat]}
                    onChange={(e) => setRanks((p) => ({ ...p, [cat]: e.target.value }))}
                    className="h-11 text-center font-semibold tabular-nums"
                    disabled={!collegeId || !deptId}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={handleSave} disabled={saving || !collegeId || !deptId} className="bg-gradient-sunset text-primary-foreground font-semibold h-11 px-6">
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Cutoffs"}
            </Button>
          </div>
        </div>
      )}

      {/* Add College dialog */}
      <Dialog open={addCollegeOpen} onOpenChange={setAddCollegeOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New College</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input value={newCollege.name} onChange={(e) => setNewCollege((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. TKM College of Engineering" />
            </div>
            <div>
              <Label>Code</Label>
              <Input value={newCollege.code} onChange={(e) => setNewCollege((p) => ({ ...p, code: e.target.value }))} placeholder="e.g. TKM" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddCollegeOpen(false)}>Cancel</Button>
            <Button onClick={handleAddCollege} className="bg-gradient-sunset text-primary-foreground">Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Department dialog */}
      <Dialog open={addDeptOpen} onOpenChange={setAddDeptOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Department</DialogTitle></DialogHeader>
          <div>
            <Label>Name</Label>
            <Input value={newDept.name} onChange={(e) => setNewDept({ name: e.target.value })} placeholder="e.g. Computer Science & Engineering" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDeptOpen(false)}>Cancel</Button>
            <Button onClick={handleAddDept} className="bg-gradient-sunset text-primary-foreground">Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
