import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Save, Trash2, Upload, X, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AnswerKey {
  id: string;
  year: number;
  paper_name: string;
  file_url: string;
  created_at: string;
}

export default function ManageAnswerKeys() {
  const [items, setItems] = useState<AnswerKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ year: new Date().getFullYear().toString(), paper_name: "", file_url: "" });
  const [uploading, setUploading] = useState(false);

  const fetchItems = async () => {
    const { data } = await supabase
      .from("answer_keys")
      .select("*")
      .order("year", { ascending: false })
      .order("paper_name");
    setItems((data as AnswerKey[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const reset = () => setForm({ year: new Date().getFullYear().toString(), paper_name: "", file_url: "" });

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("answer-keys").upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from("answer-keys").getPublicUrl(path);
      setForm((p) => ({ ...p, file_url: data.publicUrl }));
      toast.success("File uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.paper_name.trim() || !form.file_url.trim() || !form.year) {
      toast.error("All fields are required");
      return;
    }
    const { error } = await supabase.from("answer_keys").insert({
      year: parseInt(form.year, 10),
      paper_name: form.paper_name.trim(),
      file_url: form.file_url.trim(),
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Answer key added");
    reset();
    setAdding(false);
    fetchItems();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this answer key?")) return;
    await supabase.from("answer_keys").delete().eq("id", id);
    fetchItems();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground">Manage Answer Keys</h2>
          <p className="text-sm text-muted-foreground mt-1">Upload PDF files or paste a URL.</p>
        </div>
        <Button onClick={() => { setAdding(!adding); reset(); }} className="bg-gradient-sunset text-primary-foreground">
          <Plus className="w-4 h-4 mr-1.5" /> Add Answer Key
        </Button>
      </div>

      {adding && (
        <div className="bg-card border border-border rounded-xl p-5 mb-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label>Year</Label>
              <Input type="number" value={form.year} onChange={(e) => setForm((p) => ({ ...p, year: e.target.value }))} />
            </div>
            <div className="sm:col-span-2">
              <Label>Paper Name</Label>
              <Input value={form.paper_name} onChange={(e) => setForm((p) => ({ ...p, paper_name: e.target.value }))} placeholder="e.g. Paper 1 — Physics & Chemistry" />
            </div>
          </div>

          <div>
            <Label>File</Label>
            <div className="flex gap-2 items-center">
              <Input value={form.file_url} onChange={(e) => setForm((p) => ({ ...p, file_url: e.target.value }))} placeholder="Paste file URL or upload below" className="flex-1" />
              <Button variant="outline" asChild disabled={uploading}>
                <label className="cursor-pointer">
                  <Upload className="w-4 h-4 mr-1.5" />
                  {uploading ? "Uploading..." : "Upload"}
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }}
                  />
                </label>
              </Button>
            </div>
            {form.file_url && (
              <p className="text-xs text-muted-foreground mt-1 truncate">✓ {form.file_url}</p>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => { setAdding(false); reset(); }}>
              <X className="w-4 h-4 mr-1.5" /> Cancel
            </Button>
            <Button onClick={handleSave} className="bg-gradient-sunset text-primary-foreground">
              <Save className="w-4 h-4 mr-1.5" /> Save
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="h-32 bg-muted rounded-xl animate-pulse" />
      ) : items.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-xl">
          <FileText className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No answer keys yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-card border border-border rounded-xl">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Paper</th>
                <th className="text-left px-4 py-3 font-semibold">Year</th>
                <th className="text-left px-4 py-3 font-semibold hidden sm:table-cell">File</th>
                <th className="text-right px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{item.paper_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{item.year}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <a href={item.file_url} target="_blank" rel="noopener noreferrer" className="text-sunset-orange hover:underline text-xs truncate inline-block max-w-[300px]">
                      {item.file_url}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(item.id)} className="text-destructive hover:text-destructive/80">
                      <Trash2 className="w-4 h-4 inline" />
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
