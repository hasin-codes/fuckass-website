import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchSiteContent, fetchProducts, fetchGallery } from "@/lib/content";
import { LogOut, FileText, Package, Image, Inbox, Loader2, Trash2, Upload } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

type Tab = "content" | "products" | "gallery" | "submissions";

function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<Tab>("content");

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (!session) navigate({ to: "/admin/login" });
    });
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setChecking(false);
      if (!data.session) navigate({ to: "/admin/login" });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate({ to: "/admin/login" });
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }
  if (!user) return null;

  const tabs: { id: Tab; label: string; icon: typeof FileText }[] = [
    { id: "content", label: "Site Content", icon: FileText },
    { id: "products", label: "Products", icon: Package },
    { id: "gallery", label: "Gallery", icon: Image },
    { id: "submissions", label: "Inbox", icon: Inbox },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-64 bg-ink text-background flex flex-col">
        <div className="p-6 border-b border-background/15">
          <Link to="/" className="block">
            <div className="text-[10px] uppercase tracking-[0.25em] text-beige">RB Textile</div>
            <div className="font-black tracking-wider mt-1">ADMIN</div>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] transition-colors ${
                  tab === t.id
                    ? "bg-beige text-ink"
                    : "text-background/70 hover:bg-background/10 hover:text-background"
                }`}
              >
                <Icon size={14} /> {t.label}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-background/15">
          <div className="text-[10px] text-background/40 truncate mb-2">{user.email}</div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-[0.18em] text-background/80 hover:text-background border border-background/20 hover:border-background/40"
          >
            <LogOut size={12} /> Sign Out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 md:p-12 overflow-auto">
        {tab === "content" && <ContentEditor />}
        {tab === "products" && <ProductsEditor />}
        {tab === "gallery" && <GalleryEditor />}
        {tab === "submissions" && <SubmissionsList />}
      </main>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-8 border-b border-ink pb-4">
      <h1 className="text-3xl">{children}</h1>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="border border-ink/15 p-6 bg-background">{children}</div>;
}

/* ----- Site Content ----- */
function ContentEditor() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["site_content"], queryFn: fetchSiteContent });
  const [draft, setDraft] = useState<Record<string, Record<string, string>>>({});
  const [saving, setSaving] = useState(false);
  const [deletedKeys, setDeletedKeys] = useState<{ section: string; field_key: string }[]>([]);
  const [newSection, setNewSection] = useState("");

  useEffect(() => {
    if (data) setDraft(data);
  }, [data]);

  function update(section: string, key: string, value: string) {
    setDraft((d) => ({ ...d, [section]: { ...(d[section] || {}), [key]: value } }));
  }

  function addField(section: string) {
    const key = prompt(`New field key for "${section}" (letters, numbers, underscores):`)?.trim();
    if (!key) return;
    if (!/^[a-zA-Z0-9_]+$/.test(key)) return toast.error("Use only letters, numbers, underscores.");
    if (draft[section]?.[key] !== undefined) return toast.error("Field already exists.");
    setDraft((d) => ({ ...d, [section]: { ...(d[section] || {}), [key]: "" } }));
  }

  function removeField(section: string, key: string) {
    if (!confirm(`Delete field "${key}" from "${section}"?`)) return;
    setDraft((d) => {
      const next = { ...d, [section]: { ...(d[section] || {}) } };
      delete next[section][key];
      return next;
    });
    setDeletedKeys((arr) => [...arr, { section, field_key: key }]);
  }

  function addSection() {
    const s = newSection.trim();
    if (!s) return;
    if (!/^[a-zA-Z0-9_]+$/.test(s)) return toast.error("Use only letters, numbers, underscores.");
    if (draft[s]) return toast.error("Section already exists.");
    setDraft((d) => ({ ...d, [s]: {} }));
    setNewSection("");
  }

  function removeSection(section: string) {
    if (!confirm(`Delete entire section "${section}" and all its fields?`)) return;
    const keys = Object.keys(draft[section] || {});
    setDeletedKeys((arr) => [...arr, ...keys.map((k) => ({ section, field_key: k }))]);
    setDraft((d) => {
      const next = { ...d };
      delete next[section];
      return next;
    });
  }

  async function save() {
    setSaving(true);
    const rows: { section: string; field_key: string; field_value: string }[] = [];
    for (const section of Object.keys(draft)) {
      for (const key of Object.keys(draft[section])) {
        rows.push({ section, field_key: key, field_value: draft[section][key] });
      }
    }
    if (rows.length > 0) {
      const { error } = await supabase
        .from("site_content")
        .upsert(rows, { onConflict: "section,field_key" });
      if (error) {
        setSaving(false);
        toast.error(error.message);
        return;
      }
    }
    for (const d of deletedKeys) {
      await supabase.from("site_content").delete().match(d);
    }
    setDeletedKeys([]);
    setSaving(false);
    toast.success("Content published.");
    qc.invalidateQueries({ queryKey: ["site_content"] });
  }

  if (isLoading) return <Loader2 className="animate-spin" />;

  const sections = Object.keys(draft).sort();

  return (
    <div>
      <SectionTitle>Site Content</SectionTitle>
      <div className="grid gap-6">
        {sections.map((s) => (
          <Card key={s}>
            <div className="flex items-center justify-between mb-4">
              <div className="text-[10px] uppercase tracking-[0.25em] text-ink/50">{s}</div>
              <div className="flex gap-2">
                <button
                  onClick={() => addField(s)}
                  className="text-[10px] uppercase tracking-[0.18em] border border-ink/30 px-3 py-1.5 hover:bg-muted"
                >
                  + Field
                </button>
                <button
                  onClick={() => removeSection(s)}
                  className="text-[10px] uppercase tracking-[0.18em] border border-ink/30 px-2 py-1.5 text-ink/60 hover:text-destructive"
                  title="Delete section"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
            <div className="grid gap-4">
              {Object.keys(draft[s]).map((k) => {
                const value = draft[s][k];
                const isLong = value.length > 80;
                return (
                  <div key={k}>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[11px] font-semibold uppercase tracking-[0.18em]">
                        {k}
                      </label>
                      <button
                        onClick={() => removeField(s, k)}
                        className="text-ink/40 hover:text-destructive"
                        title="Delete field"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    {isLong ? (
                      <textarea
                        value={value}
                        onChange={(e) => update(s, k, e.target.value)}
                        rows={3}
                        className="w-full border border-ink/30 px-3 py-2 text-sm focus:outline-none focus:border-ink"
                      />
                    ) : (
                      <input
                        value={value}
                        onChange={(e) => update(s, k, e.target.value)}
                        className="w-full border border-ink/30 px-3 py-2 text-sm focus:outline-none focus:border-ink"
                      />
                    )}
                  </div>
                );
              })}
              {Object.keys(draft[s]).length === 0 && (
                <div className="text-xs text-ink/40 italic">
                  No fields. Click + Field to add one.
                </div>
              )}
            </div>
          </Card>
        ))}
        <Card>
          <div className="text-[10px] uppercase tracking-[0.25em] text-ink/50 mb-3">
            Add New Section
          </div>
          <div className="flex gap-2">
            <input
              value={newSection}
              onChange={(e) => setNewSection(e.target.value)}
              placeholder="section_key"
              className="flex-1 border border-ink/30 px-3 py-2 text-sm"
            />
            <button
              onClick={addSection}
              className="bg-ink text-background px-5 py-2 text-[10px] font-bold uppercase tracking-[0.22em]"
            >
              + Section
            </button>
          </div>
        </Card>
      </div>
      <button
        onClick={save}
        disabled={saving}
        className="mt-8 bg-ink text-background px-10 py-4 text-xs font-bold uppercase tracking-[0.22em] hover:bg-ink/85 disabled:opacity-60"
      >
        {saving ? "Publishing…" : "Publish Changes"}
      </button>
    </div>
  );
}

/* ----- Products ----- */
function ProductsEditor() {
  const qc = useQueryClient();
  const { data: products, isLoading } = useQuery({
    queryKey: ["products_admin"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("order");
      if (error) throw error;
      return data;
    },
  });

  async function addProduct() {
    const { error } = await supabase.from("products").insert({
      name: "New Product",
      description: "",
      order: (products?.length ?? 0) + 1,
    });
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["products_admin"] });
    qc.invalidateQueries({ queryKey: ["products"] });
  }

  if (isLoading) return <Loader2 className="animate-spin" />;

  return (
    <div>
      <SectionTitle>Products</SectionTitle>
      <button
        onClick={addProduct}
        className="mb-6 bg-ink text-background px-6 py-3 text-xs font-bold uppercase tracking-[0.22em]"
      >
        + Add Product
      </button>
      <div className="grid gap-4">
        {(products ?? []).map((p) => (
          <ProductRow key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}

type Product = Database["public"]["Tables"]["products"]["Row"];

function ProductRow({ product }: { product: Product }) {
  const qc = useQueryClient();
  const [p, setP] = useState(product);
  const [uploading, setUploading] = useState(false);

  async function save() {
    const { error } = await supabase
      .from("products")
      .update({
        name: p.name,
        description: p.description,
        image_url: p.image_url,
        order: p.order,
        visible: p.visible,
      })
      .eq("id", p.id);
    if (error) return toast.error(error.message);
    toast.success("Saved.");
    qc.invalidateQueries({ queryKey: ["products_admin"] });
    qc.invalidateQueries({ queryKey: ["products"] });
  }

  async function remove() {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", p.id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["products_admin"] });
    qc.invalidateQueries({ queryKey: ["products"] });
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const path = `products/${crypto.randomUUID()}-${file.name}`;
    const { error } = await supabase.storage.from("rb-textile-media").upload(path, file);
    if (error) {
      setUploading(false);
      return toast.error(error.message);
    }
    const { data } = supabase.storage.from("rb-textile-media").getPublicUrl(path);
    setP({ ...p, image_url: data.publicUrl });
    setUploading(false);
  }

  return (
    <Card>
      <div className="grid md:grid-cols-[160px_1fr_auto] gap-6">
        <div>
          <div className="aspect-[4/5] bg-muted overflow-hidden mb-2">
            {p.image_url ? (
              <img src={p.image_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[10px] uppercase tracking-[0.2em] text-ink/40">
                No image
              </div>
            )}
          </div>
          <label className="flex items-center justify-center gap-2 border border-ink/30 px-2 py-2 text-[10px] uppercase tracking-[0.18em] cursor-pointer hover:bg-muted">
            <Upload size={12} /> {uploading ? "..." : "Upload"}
            <input type="file" accept="image/*" className="hidden" onChange={onFile} />
          </label>
          <input
            value={p.image_url ?? ""}
            onChange={(e) => setP({ ...p, image_url: e.target.value })}
            placeholder="or paste URL"
            className="mt-2 w-full border border-ink/20 px-2 py-1.5 text-[11px]"
          />
        </div>
        <div className="space-y-3">
          <input
            value={p.name}
            onChange={(e) => setP({ ...p, name: e.target.value })}
            className="w-full border border-ink/30 px-3 py-2 font-semibold"
          />
          <textarea
            value={p.description ?? ""}
            onChange={(e) => setP({ ...p, description: e.target.value })}
            rows={3}
            className="w-full border border-ink/30 px-3 py-2 text-sm"
          />
          <div className="flex gap-4 items-center text-xs">
            <label className="flex items-center gap-2 uppercase tracking-[0.18em]">
              Order
              <input
                type="number"
                value={p.order}
                onChange={(e) => setP({ ...p, order: parseInt(e.target.value || "0") })}
                className="w-16 border border-ink/30 px-2 py-1"
              />
            </label>
            <label className="flex items-center gap-2 uppercase tracking-[0.18em]">
              <input
                type="checkbox"
                checked={p.visible}
                onChange={(e) => setP({ ...p, visible: e.target.checked })}
              />
              Visible
            </label>
          </div>
        </div>
        <div className="flex md:flex-col gap-2">
          <button
            onClick={save}
            className="bg-ink text-background px-5 py-2 text-[10px] font-bold uppercase tracking-[0.22em]"
          >
            Save
          </button>
          <button
            onClick={remove}
            className="border border-ink/30 px-3 py-2 text-ink/70 hover:text-destructive"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </Card>
  );
}

/* ----- Gallery ----- */
function GalleryEditor() {
  const qc = useQueryClient();
  const { data: items, isLoading } = useQuery({
    queryKey: ["gallery_admin"],
    queryFn: async () => {
      const { data, error } = await supabase.from("gallery_items").select("*").order("order");
      if (error) throw error;
      return data;
    },
  });

  const [newType, setNewType] = useState<"image" | "video">("image");
  const [newUrl, setNewUrl] = useState("");
  const [newCaption, setNewCaption] = useState("");
  const [uploading, setUploading] = useState(false);

  async function add() {
    if (!newUrl) return toast.error("URL or upload required");
    const { error } = await supabase.from("gallery_items").insert({
      type: newType,
      url: newUrl,
      caption: newCaption,
      order: (items?.length ?? 0) + 1,
    });
    if (error) return toast.error(error.message);
    setNewUrl("");
    setNewCaption("");
    qc.invalidateQueries({ queryKey: ["gallery_admin"] });
    qc.invalidateQueries({ queryKey: ["gallery"] });
    toast.success("Added.");
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const path = `gallery/${crypto.randomUUID()}-${file.name}`;
    const { error } = await supabase.storage.from("rb-textile-media").upload(path, file);
    if (error) {
      setUploading(false);
      return toast.error(error.message);
    }
    const { data } = supabase.storage.from("rb-textile-media").getPublicUrl(path);
    setNewUrl(data.publicUrl);
    setUploading(false);
  }

  async function remove(id: string) {
    if (!confirm("Delete item?")) return;
    await supabase.from("gallery_items").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["gallery_admin"] });
    qc.invalidateQueries({ queryKey: ["gallery"] });
  }

  async function toggle(id: string, visible: boolean) {
    await supabase.from("gallery_items").update({ visible }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["gallery_admin"] });
    qc.invalidateQueries({ queryKey: ["gallery"] });
  }

  if (isLoading) return <Loader2 className="animate-spin" />;

  return (
    <div>
      <SectionTitle>Gallery</SectionTitle>
      <Card>
        <div className="text-[10px] uppercase tracking-[0.25em] text-ink/50 mb-4">Add Item</div>
        <div className="grid md:grid-cols-[120px_1fr_1fr_auto] gap-3 items-end">
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value as "image" | "video")}
            className="border border-ink/30 px-3 py-2 text-sm"
          >
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
          <div>
            <input
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder={newType === "image" ? "Image URL or upload" : "YouTube / video URL"}
              className="w-full border border-ink/30 px-3 py-2 text-sm"
            />
            {newType === "image" && (
              <label className="mt-2 inline-flex items-center gap-2 border border-ink/30 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] cursor-pointer">
                <Upload size={12} /> {uploading ? "..." : "Upload"}
                <input type="file" accept="image/*" className="hidden" onChange={onFile} />
              </label>
            )}
          </div>
          <input
            value={newCaption}
            onChange={(e) => setNewCaption(e.target.value)}
            placeholder="Caption"
            className="border border-ink/30 px-3 py-2 text-sm"
          />
          <button
            onClick={add}
            className="bg-ink text-background px-5 py-2 text-[10px] font-bold uppercase tracking-[0.22em]"
          >
            Add
          </button>
        </div>
      </Card>
      <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(items ?? []).map((it) => (
          <Card key={it.id}>
            <div className="aspect-video bg-muted overflow-hidden mb-3">
              {it.type === "image" ? (
                <img src={it.url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] uppercase tracking-[0.2em] text-ink/40">
                  Video · {it.url.slice(0, 30)}…
                </div>
              )}
            </div>
            <div className="text-xs mb-2 truncate">{it.caption || "—"}</div>
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.18em]">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={it.visible}
                  onChange={(e) => toggle(it.id, e.target.checked)}
                />
                Visible
              </label>
              <button onClick={() => remove(it.id)} className="text-ink/60 hover:text-destructive">
                <Trash2 size={14} />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ----- Submissions ----- */
function SubmissionsList() {
  const { data, isLoading } = useQuery({
    queryKey: ["submissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_submissions")
        .select("*")
        .order("submitted_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <Loader2 className="animate-spin" />;

  return (
    <div>
      <SectionTitle>Inbox</SectionTitle>
      {data && data.length === 0 ? (
        <p className="text-sm text-ink/50">No submissions yet.</p>
      ) : (
        <div className="space-y-3">
          {(data ?? []).map((s) => (
            <Card key={s.id}>
              <div className="flex flex-wrap justify-between gap-3 mb-2">
                <div>
                  <div className="font-bold">{s.name}</div>
                  <div className="text-xs text-ink/60">
                    {s.email}
                    {s.phone && ` · ${s.phone}`}
                    {s.company && ` · ${s.company}`}
                  </div>
                </div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-ink/50">
                  {new Date(s.submitted_at).toLocaleString()}
                </div>
              </div>
              <p className="text-sm whitespace-pre-wrap text-ink/80 border-t border-ink/10 pt-3">
                {s.message}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
