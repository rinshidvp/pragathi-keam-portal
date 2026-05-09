import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Save, Trash2, X } from "lucide-react";

interface DeptContact {
  id: string;
  department: string;
  name: string;
  phone: string;
  created_at: string;
}

export default function ManageDeptHelpDesk() {
  const [items, setItems] = useState<DeptContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ department: "", name: "", phone: "" });

  const fetchItems = async () => {
    const { data } = await supabase
      .from("department_contacts" as never)
      .select("*")
      .order("department");
    setItems((data as unknown as DeptContact[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const reset = () => setForm({ department: "", name: "", phone: "" });

  const handleAdd = async () => {
    if (!form.department.trim() || !form.name.trim() || !form.phone.trim()) return;
    await supabase.from("department_contacts" as never).insert({
      department: form.department.trim(),
      name: form.name.trim(),
      phone: form.phone.trim(),
    } as never);
    reset(); setAdding(false); fetchItems();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return;
    await supabase.from("department_contacts" as never).delete().eq("id", id);
    fetchItems();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground">Manage Dept Help Desk</h2>
          <p className="text-sm text-muted-foreground">Department-wise senior volunteers shown publicly.</p>
        </div>
        <button
          onClick={() => { setAdding(!adding); reset(); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-sunset text-primary-foreground text-sm font-semibold"
        >
          <Plus className="w-4 h-4" /> Add Contact
        </button>
      </div>

      {adding && (
        <div className="bg-card border border-border rounded-xl p-4 mb-6 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              placeholder="Department (e.g. CS, Mech) *"
              value={form.department}
              onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
              className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
            />
            <input
              placeholder="Volunteer Name *"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
            />
            <input
              placeholder="Phone (e.g. +91 9999999999) *"
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-sunset text-primary-foreground text-sm font-semibold"
            >
              <Save className="w-4 h-4" /> Save
            </button>
            <button
              onClick={() => { setAdding(false); reset(); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-sm font-semibold"
            >
              <X className="w-4 h-4" /> Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="h-32 bg-muted rounded-xl animate-pulse" />
      ) : items.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-xl text-muted-foreground">
          No department contacts yet. Add the first one above.
        </div>
      ) : (
        <div className="overflow-x-auto bg-card border border-border rounded-xl">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Department</th>
                <th className="text-left px-4 py-3 font-semibold">Volunteer</th>
                <th className="text-left px-4 py-3 font-semibold hidden sm:table-cell">Phone</th>
                <th className="text-right px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-border">
                  <td className="px-4 py-3 font-bold text-sunset-orange">{item.department}</td>
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{item.phone}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(item.id, item.name)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      aria-label={`Delete ${item.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
