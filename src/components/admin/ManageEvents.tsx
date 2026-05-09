import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Plus, Pencil, Trash2, Save, X, Upload, Loader2 } from "lucide-react";

type Event = Tables<"events">;

export default function ManageEvents() {
  const [items, setItems] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", event_date: "", image_url: "", registration_link: "" });
  const [adding, setAdding] = useState(false);

  const fetchItems = async () => {
    const { data } = await supabase.from("events").select("*").order("event_date", { ascending: true });
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const resetForm = () => setForm({ title: "", description: "", event_date: "", image_url: "", registration_link: "" });

  const handleAdd = async () => {
    if (!form.title) return;
    await supabase.from("events").insert({
      title: form.title,
      description: form.description || null,
      event_date: form.event_date || null,
      image_url: form.image_url || null,
      registration_link: form.registration_link || null,
    });
    resetForm();
    setAdding(false);
    fetchItems();
  };

  const handleUpdate = async (id: string) => {
    await supabase.from("events").update({
      title: form.title,
      description: form.description || null,
      event_date: form.event_date || null,
      image_url: form.image_url || null,
      registration_link: form.registration_link || null,
    }).eq("id", id);
    setEditing(null);
    resetForm();
    fetchItems();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    await supabase.from("events").delete().eq("id", id);
    fetchItems();
  };

  const startEdit = (item: Event) => {
    setEditing(item.id);
    setForm({
      title: item.title,
      description: item.description ?? "",
      event_date: item.event_date ? item.event_date.slice(0, 16) : "",
      image_url: item.image_url ?? "",
      registration_link: item.registration_link ?? "",
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-extrabold text-foreground">Manage KEAM Alerts</h2>
        <button onClick={() => { setAdding(!adding); resetForm(); }} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-sunset text-primary-foreground text-sm font-semibold">
          <Plus className="w-4 h-4" /> Add Alert
        </button>
      </div>

      {(adding || editing) && (
        <div className="bg-card border border-border rounded-xl p-4 mb-6 space-y-3">
          <input placeholder="Title *" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" />
          <textarea placeholder="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" rows={2} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input type="datetime-local" value={form.event_date} onChange={e => setForm(p => ({ ...p, event_date: e.target.value }))} className="px-3 py-2 rounded-lg border border-input bg-background text-sm" />
            <input placeholder="Image URL" value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))} className="px-3 py-2 rounded-lg border border-input bg-background text-sm" />
            <input placeholder="Registration Link" value={form.registration_link} onChange={e => setForm(p => ({ ...p, registration_link: e.target.value }))} className="px-3 py-2 rounded-lg border border-input bg-background text-sm" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => editing ? handleUpdate(editing) : handleAdd()} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-sunset text-primary-foreground text-sm font-semibold">
              <Save className="w-4 h-4" /> {editing ? "Update" : "Save"}
            </button>
            <button onClick={() => { setEditing(null); setAdding(false); resetForm(); }} className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-sm font-semibold">
              <X className="w-4 h-4" /> Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="h-32 bg-muted rounded-xl animate-pulse" />
      ) : (
        <div className="overflow-x-auto bg-card border border-border rounded-xl">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Title</th>
                <th className="text-left px-4 py-3 font-semibold hidden sm:table-cell">Date</th>
                <th className="text-right px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{item.title}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    {item.event_date ? new Date(item.event_date).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => startEdit(item)} className="text-muted-foreground hover:text-foreground"><Pencil className="w-4 h-4 inline" /></button>
                    <button onClick={() => handleDelete(item.id)} className="text-destructive hover:text-destructive/80"><Trash2 className="w-4 h-4 inline" /></button>
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
