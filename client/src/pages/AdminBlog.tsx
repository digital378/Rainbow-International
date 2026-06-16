import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "wouter";

const NAVY = "#091a4f";
const AMBER = "#f59e0b";
const ADMIN_AUTH_KEY = "ris_admin_auth";

type Section = { heading?: string; body: string; list?: string[] };
type InternalLink = { label: string; href: string };
type Faq = { q: string; a: string };

type BlogPost = {
  id: string;
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  date: string;
  cat: string;
  thumbUrl?: string | null;
  heroUrl: string;
  intro: string;
  sections: Section[];
  conclusion: string;
  relatedSlugs: string[];
  internalLinks: InternalLink[];
  faqs: Faq[];
  publishedAt: string;
};

const BLANK_POST: Omit<BlogPost, "id" | "publishedAt"> = {
  slug: "",
  title: "",
  metaTitle: "",
  metaDescription: "",
  keywords: "",
  date: new Date().toISOString().slice(0, 10),
  cat: "",
  thumbUrl: "",
  heroUrl: "",
  intro: "",
  sections: [],
  conclusion: "",
  relatedSlugs: [],
  internalLinks: [],
  faqs: [],
};

function getToken() {
  try { return sessionStorage.getItem(ADMIN_AUTH_KEY) || ""; } catch { return ""; }
}

function AdminGate({ onSuccess }: { onSuccess: (token: string) => void }) {
  const [token, setToken] = useState("");
  const [error, setError] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/blog-posts", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      try { sessionStorage.setItem(ADMIN_AUTH_KEY, token); } catch {}
      onSuccess(token);
    } else {
      setError(true); setToken("");
      setTimeout(() => setError(false), 600);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: NAVY }}>
      <form onSubmit={submit} className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm border-t-4 border-amber-400">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-md flex items-center justify-center font-black text-sm" style={{ background: AMBER, color: NAVY }}>RIS</div>
          <div>
            <div className="font-black text-lg" style={{ color: NAVY }}>Blog Admin</div>
            <div className="text-xs text-slate-500">Blog Management · Internal</div>
          </div>
        </div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Admin Token</label>
        <input
          type="password"
          value={token}
          onChange={e => setToken(e.target.value)}
          placeholder="Enter admin token"
          className={`w-full px-4 py-3 rounded-lg border-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 ${error ? "border-red-500 bg-red-50" : "border-slate-300"}`}
          data-testid="input-admin-token"
        />
        {error && <div className="mt-2 text-sm text-red-600" data-testid="text-auth-error">Invalid token</div>}
        <button type="submit" className="mt-4 w-full py-3 rounded-lg font-bold text-white" style={{ background: NAVY }} data-testid="button-admin-login">
          Unlock
        </button>
      </form>
    </div>
  );
}

export default function AdminBlog() {
  const [token, setToken] = useState<string | null>(() => {
    const t = getToken(); return t || null;
  });
  if (!token) return <AdminGate onSuccess={t => setToken(t)} />;
  return <BlogManagement token={token} onLogout={() => { try { sessionStorage.removeItem(ADMIN_AUTH_KEY); } catch {} setToken(null); }} />;
}

type View = "list" | "form";

function BlogManagement({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("list");
  const [editPost, setEditPost] = useState<BlogPost | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    document.title = "Blog Management | Rainbow International School";
    let meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!meta) { meta = document.createElement("meta"); meta.name = "robots"; document.head.appendChild(meta); }
    meta.setAttribute("content", "noindex, nofollow");
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/blog-posts", { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setPosts(await res.json());
    setLoading(false);
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditPost(null); setView("form"); };
  const openEdit = (p: BlogPost) => { setEditPost(p); setView("form"); };
  const backToList = () => { setEditPost(null); setView("list"); load(); };

  const handleDelete = async (slug: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/blog-posts/${encodeURIComponent(slug)}`, {
      method: "DELETE", headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) load();
    else alert("Failed to delete post.");
  };

  const filtered = posts.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.slug.toLowerCase().includes(search.toLowerCase()) ||
    p.cat.toLowerCase().includes(search.toLowerCase())
  );

  if (view === "form") {
    return <PostForm post={editPost} token={token} onDone={backToList} onCancel={backToList} />;
  }

  return (
    <div className="min-h-screen" style={{ background: "#f1f5f9" }}>
      <div className="text-white py-4 px-6 flex flex-wrap items-center justify-between gap-3 border-b-4 border-amber-400" style={{ background: NAVY }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md flex items-center justify-center font-black text-sm" style={{ background: AMBER, color: NAVY }}>RIS</div>
          <div>
            <div className="font-black text-lg leading-tight">Blog Management</div>
            <div className="text-xs text-blue-200">Content Editor · Admin</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/ras">
            <a className="px-3 py-1.5 rounded border border-white/30 text-white text-xs font-semibold hover:bg-white/10" data-testid="link-ra-admin">RA Admin</a>
          </Link>
          <a href="/blogs" target="_blank" rel="noopener" className="px-3 py-1.5 rounded border border-white/30 text-white text-xs font-semibold hover:bg-white/10" data-testid="link-view-blog">View Blog</a>
          <button onClick={onLogout} className="px-3 py-1.5 rounded border border-white/30 text-white text-xs font-semibold hover:bg-white/10" data-testid="button-logout">Logout</button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xl font-black" style={{ color: NAVY }}>All Posts</div>
          <div className="text-xs text-slate-500">{posts.length} post{posts.length !== 1 ? "s" : ""} in database</div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search posts…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 w-48"
            data-testid="input-search"
          />
          <button
            onClick={openAdd}
            className="px-4 py-2 rounded-lg font-bold text-white text-sm"
            style={{ background: NAVY }}
            data-testid="button-new-post"
          >
            + New Post
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-10">
        {loading ? (
          <div className="text-center py-16 text-slate-400 text-sm">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm">{search ? "No posts match your search." : "No blog posts yet. Create your first one!"}</div>
        ) : (
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Title</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">Slug</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden sm:table-cell">Category</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden lg:table-cell">Date</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr key={p.id} className={`border-b border-slate-50 hover:bg-slate-50 ${i % 2 === 0 ? "" : "bg-slate-50/50"}`} data-testid={`row-post-${p.slug}`}>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800 leading-tight line-clamp-2 max-w-xs">{p.title}</div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">{p.slug}</span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">{p.cat}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-slate-500 text-xs">{p.date}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/blog/${p.slug}`}
                          target="_blank"
                          rel="noopener"
                          className="px-2 py-1 rounded text-xs font-semibold text-blue-600 hover:bg-blue-50"
                          data-testid={`link-view-${p.slug}`}
                        >View</a>
                        <button
                          onClick={() => openEdit(p)}
                          className="px-2 py-1 rounded text-xs font-semibold hover:bg-amber-50"
                          style={{ color: NAVY }}
                          data-testid={`button-edit-${p.slug}`}
                        >Edit</button>
                        <button
                          onClick={() => handleDelete(p.slug, p.title)}
                          className="px-2 py-1 rounded text-xs font-semibold text-red-600 hover:bg-red-50"
                          data-testid={`button-delete-${p.slug}`}
                        >Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function ImageUploadField({
  label,
  value,
  onChange,
  placeholder,
  token,
  testId,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  token: string;
  testId?: string;
  required?: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setUploadError("Only JPEG, PNG, and WebP images are allowed.");
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File too large. Maximum size is 5 MB.");
      e.target.value = "";
      return;
    }
    setUploadError("");
    setUploading(true);
    try {
      const form = new FormData();
      form.append("image", file);
      const res = await fetch("/api/admin/upload-image", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");
      onChange(data.url);
    } catch (err: any) {
      setUploadError(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1">
        {label}{required && " *"}
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          data-testid={testId}
        />
        <button
          type="button"
          onClick={() => { setUploadError(""); fileRef.current?.click(); }}
          disabled={uploading}
          className="px-3 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 whitespace-nowrap flex items-center gap-1.5"
          data-testid={testId ? `${testId}-upload-btn` : undefined}
          title="Upload image from your device (JPEG, PNG, or WebP, max 5 MB)"
        >
          {uploading ? (
            <>
              <svg className="animate-spin w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Uploading…
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload
            </>
          )}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
          data-testid={testId ? `${testId}-file-input` : undefined}
        />
      </div>
      {uploadError && (
        <div className="mt-1 text-xs text-red-600" data-testid={testId ? `${testId}-upload-error` : undefined}>
          {uploadError}
        </div>
      )}
      {value && !uploadError && (
        <div className="mt-2 flex items-center gap-2">
          <img
            src={value}
            alt="Preview"
            className="w-20 h-12 object-cover rounded border border-slate-200 bg-slate-50"
            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
            data-testid={testId ? `${testId}-preview` : undefined}
          />
          <span className="text-xs text-slate-400 truncate max-w-xs">{value}</span>
        </div>
      )}
    </div>
  );
}

/* ─── Structured editor sub-components ─── */

function SectionsEditor({
  sections,
  onChange,
  sectionErrors = {},
  onClearError,
}: {
  sections: Section[];
  onChange: (s: Section[]) => void;
  sectionErrors?: Record<number, string>;
  onClearError?: (i: number) => void;
}) {
  const add = () => onChange([...sections, { heading: "", body: "", list: [] }]);

  const update = (i: number, patch: Partial<Section>) =>
    onChange(sections.map((s, idx) => idx === i ? { ...s, ...patch } : s));

  const remove = (i: number) => onChange(sections.filter((_, idx) => idx !== i));

  const move = (i: number, dir: -1 | 1) => {
    const next = [...sections];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  const addListItem = (i: number) => update(i, { list: [...(sections[i].list ?? []), ""] });

  const updateListItem = (si: number, li: number, val: string) => {
    const list = [...(sections[si].list ?? [])];
    list[li] = val;
    update(si, { list });
  };

  const removeListItem = (si: number, li: number) =>
    update(si, { list: (sections[si].list ?? []).filter((_, idx) => idx !== li) });

  return (
    <div className="space-y-3">
      {sections.map((s, i) => (
        <div key={i} className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3" data-testid={`section-card-${i}`}>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Section {i + 1}</span>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0}
                className="px-2 py-1 text-xs rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-30"
                data-testid={`section-move-up-${i}`} title="Move up">↑</button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === sections.length - 1}
                className="px-2 py-1 text-xs rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-30"
                data-testid={`section-move-down-${i}`} title="Move down">↓</button>
              <button type="button" onClick={() => remove(i)}
                className="px-2 py-1 text-xs rounded border border-red-200 text-red-600 bg-white hover:bg-red-50"
                data-testid={`section-remove-${i}`}>Remove</button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Heading <span className="font-normal text-slate-400">(optional)</span></label>
            <input
              type="text"
              value={s.heading ?? ""}
              onChange={e => update(i, { heading: e.target.value })}
              placeholder="Section heading"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
              data-testid={`section-heading-${i}`}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Body text *</label>
            <textarea
              value={s.body}
              onChange={e => {
                update(i, { body: e.target.value });
                if (e.target.value.trim()) onClearError?.(i);
              }}
              rows={4}
              placeholder="Paragraph content for this section"
              className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-y bg-white ${sectionErrors[i] ? "border-red-400 focus:ring-red-300" : "border-slate-300"}`}
              data-testid={`section-body-${i}`}
            />
            {sectionErrors[i] && (
              <div className="mt-1 text-xs text-red-600 font-medium" data-testid={`section-body-error-${i}`}>
                {sectionErrors[i]}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-600">Bullet list items <span className="font-normal text-slate-400">(optional)</span></label>
              <button type="button" onClick={() => addListItem(i)}
                className="text-xs px-2 py-0.5 rounded border border-slate-300 bg-white hover:bg-slate-100 text-slate-600"
                data-testid={`section-add-list-${i}`}>+ Add item</button>
            </div>
            {(s.list ?? []).map((item, li) => (
              <div key={li} className="flex items-center gap-2 mb-1">
                <span className="text-slate-400 text-sm">•</span>
                <input
                  type="text"
                  value={item}
                  onChange={e => updateListItem(i, li, e.target.value)}
                  placeholder="Bullet item text"
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                  data-testid={`section-list-item-${i}-${li}`}
                />
                <button type="button" onClick={() => removeListItem(i, li)}
                  className="text-red-500 hover:text-red-700 text-sm px-1"
                  data-testid={`section-list-remove-${i}-${li}`}>×</button>
              </div>
            ))}
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="w-full py-2 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 text-sm font-semibold hover:border-amber-400 hover:text-amber-600 transition-colors"
        data-testid="button-add-section"
      >
        + Add Section
      </button>
    </div>
  );
}

function FaqsEditor({ faqs, onChange }: { faqs: Faq[]; onChange: (f: Faq[]) => void }) {
  const add = () => onChange([...faqs, { q: "", a: "" }]);
  const update = (i: number, patch: Partial<Faq>) =>
    onChange(faqs.map((f, idx) => idx === i ? { ...f, ...patch } : f));
  const remove = (i: number) => onChange(faqs.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3">
      {faqs.map((f, i) => (
        <div key={i} className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3" data-testid={`faq-card-${i}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">FAQ {i + 1}</span>
            <button type="button" onClick={() => remove(i)}
              className="px-2 py-1 text-xs rounded border border-red-200 text-red-600 bg-white hover:bg-red-50"
              data-testid={`faq-remove-${i}`}>Remove</button>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Question *</label>
            <input
              type="text"
              value={f.q}
              onChange={e => update(i, { q: e.target.value })}
              placeholder="What is …?"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
              data-testid={`faq-question-${i}`}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Answer *</label>
            <textarea
              value={f.a}
              onChange={e => update(i, { a: e.target.value })}
              rows={3}
              placeholder="Detailed answer…"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-y bg-white"
              data-testid={`faq-answer-${i}`}
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="w-full py-2 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 text-sm font-semibold hover:border-amber-400 hover:text-amber-600 transition-colors"
        data-testid="button-add-faq"
      >
        + Add FAQ
      </button>
    </div>
  );
}

function InternalLinksEditor({ links, onChange }: { links: InternalLink[]; onChange: (l: InternalLink[]) => void }) {
  const add = () => onChange([...links, { label: "", href: "" }]);
  const update = (i: number, patch: Partial<InternalLink>) =>
    onChange(links.map((l, idx) => idx === i ? { ...l, ...patch } : l));
  const remove = (i: number) => onChange(links.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-2">
      {links.map((l, i) => (
        <div key={i} className="flex items-center gap-2" data-testid={`link-row-${i}`}>
          <input
            type="text"
            value={l.label}
            onChange={e => update(i, { label: e.target.value })}
            placeholder="Link label"
            className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            data-testid={`link-label-${i}`}
          />
          <input
            type="text"
            value={l.href}
            onChange={e => update(i, { href: e.target.value })}
            placeholder="/page-path or https://…"
            className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            data-testid={`link-href-${i}`}
          />
          <button type="button" onClick={() => remove(i)}
            className="px-2 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-sm"
            data-testid={`link-remove-${i}`}>×</button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="w-full py-2 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 text-sm font-semibold hover:border-amber-400 hover:text-amber-600 transition-colors"
        data-testid="button-add-link"
      >
        + Add Internal Link
      </button>
    </div>
  );
}

/* ─── JSON Preview toggle ─── */
function JsonPreview({ label, value }: { label: string; value: unknown }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="text-xs text-slate-400 hover:text-slate-600 underline underline-offset-2"
        data-testid={`toggle-json-${label.toLowerCase().replace(/\s+/g, "-")}`}
      >
        {open ? "Hide" : "Show"} JSON preview
      </button>
      {open && (
        <pre className="mt-2 p-3 bg-slate-900 text-green-400 text-xs rounded-lg overflow-auto max-h-48 font-mono leading-relaxed">
          {JSON.stringify(value, null, 2)}
        </pre>
      )}
    </div>
  );
}

/* ─── PostForm ─── */
function PostForm({ post, token, onDone, onCancel }: { post: BlogPost | null; token: string; onDone: () => void; onCancel: () => void }) {
  const isEdit = !!post;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [sectionErrors, setSectionErrors] = useState<Record<number, string>>({});

  const [slug, setSlug] = useState(post?.slug ?? "");
  const [title, setTitle] = useState(post?.title ?? "");
  const [metaTitle, setMetaTitle] = useState(post?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(post?.metaDescription ?? "");
  const [keywords, setKeywords] = useState(post?.keywords ?? "");
  const [date, setDate] = useState(post?.date ?? new Date().toISOString().slice(0, 10));
  const [cat, setCat] = useState(post?.cat ?? "");
  const [thumbUrl, setThumbUrl] = useState(post?.thumbUrl ?? "");
  const [heroUrl, setHeroUrl] = useState(post?.heroUrl ?? "");
  const [intro, setIntro] = useState(post?.intro ?? "");
  const [conclusion, setConclusion] = useState(post?.conclusion ?? "");

  const [sections, setSections] = useState<Section[]>(post?.sections ?? []);
  const [relatedSlugsRaw, setRelatedSlugsRaw] = useState(() => (post?.relatedSlugs ?? []).join(", "));
  const [internalLinks, setInternalLinks] = useState<InternalLink[]>(post?.internalLinks ?? []);
  const [faqs, setFaqs] = useState<Faq[]>(post?.faqs ?? []);

  const autoSlug = (t: string) => t.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleTitleChange = (v: string) => {
    setTitle(v);
    if (!isEdit && !slug) setSlug(autoSlug(v));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const emptyBodyIndexes: Record<number, string> = {};
    sections.forEach((s, i) => {
      if (!s.body.trim()) emptyBodyIndexes[i] = "Body text is required.";
    });
    if (Object.keys(emptyBodyIndexes).length > 0) {
      setSectionErrors(emptyBodyIndexes);
      return;
    }
    setSectionErrors({});

    const relatedSlugs = relatedSlugsRaw.split(",").map(s => s.trim()).filter(Boolean);

    const body = {
      slug: slug.trim(),
      title: title.trim(),
      metaTitle: metaTitle.trim() || title.trim(),
      metaDescription: metaDescription.trim(),
      keywords: keywords.trim(),
      date,
      cat: cat.trim(),
      thumbUrl: thumbUrl.trim() || null,
      heroUrl: heroUrl.trim(),
      intro: intro.trim(),
      sections,
      conclusion: conclusion.trim(),
      relatedSlugs,
      internalLinks,
      faqs,
    };

    setSaving(true);
    try {
      const url = isEdit
        ? `/api/admin/blog-posts/${encodeURIComponent(post!.slug)}`
        : "/api/admin/blog-posts";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message || "Failed to save");
      }
      onDone();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const field = (label: string, children: React.ReactNode, hint?: string) => (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1">{label}</label>
      {hint && <div className="text-xs text-slate-400 mb-1">{hint}</div>}
      {children}
    </div>
  );

  const input = (value: string, onChange: (v: string) => void, props?: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
      {...props}
    />
  );

  return (
    <div className="min-h-screen" style={{ background: "#f1f5f9" }}>
      <div className="text-white py-4 px-6 flex flex-wrap items-center justify-between gap-3 border-b-4 border-amber-400" style={{ background: NAVY }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md flex items-center justify-center font-black text-sm" style={{ background: AMBER, color: NAVY }}>RIS</div>
          <div>
            <div className="font-black text-lg leading-tight">{isEdit ? "Edit Post" : "New Post"}</div>
            <div className="text-xs text-blue-200">Blog Management · Admin</div>
          </div>
        </div>
        <button onClick={onCancel} className="px-3 py-1.5 rounded border border-white/30 text-white text-xs font-semibold hover:bg-white/10" data-testid="button-cancel">
          ← Back to List
        </button>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm" data-testid="text-form-error">{error}</div>
        )}

        {/* Core Fields */}
        <div className="bg-white rounded-2xl shadow p-6 space-y-4">
          <div className="font-bold text-slate-700 text-sm uppercase tracking-wide border-b pb-2">Core Fields</div>
          {field("Title *", input(title, handleTitleChange, { placeholder: "Post title", required: true, "data-testid": "input-title" } as any))}
          {field(
            "Slug *",
            isEdit
              ? <div className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono bg-slate-50 text-slate-500 select-all" data-testid="input-slug">{slug}</div>
              : input(slug, setSlug, { placeholder: "url-friendly-slug", required: true, "data-testid": "input-slug" } as any),
            isEdit ? "Slug is locked after creation — changing it would break existing links." : "Auto-generated from title. Must be unique."
          )}
          <div className="grid grid-cols-2 gap-4">
            {field("Date *", input(date, setDate, { type: "date", required: true, "data-testid": "input-date" } as any))}
            {field("Category *", input(cat, setCat, { placeholder: "e.g. Education", required: true, "data-testid": "input-cat" } as any))}
          </div>
        </div>

        {/* SEO */}
        <div className="bg-white rounded-2xl shadow p-6 space-y-4">
          <div className="font-bold text-slate-700 text-sm uppercase tracking-wide border-b pb-2">SEO</div>
          {field("Meta Title", input(metaTitle, setMetaTitle, { placeholder: "Defaults to title if empty", "data-testid": "input-meta-title" } as any))}
          {field("Meta Description", <textarea value={metaDescription} onChange={e => setMetaDescription(e.target.value)} rows={2} placeholder="150-160 chars for best SEO" className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-y" data-testid="input-meta-description" />)}
          {field("Keywords", input(keywords, setKeywords, { placeholder: "comma separated keywords", "data-testid": "input-keywords" } as any))}
        </div>

        {/* Images */}
        <div className="bg-white rounded-2xl shadow p-6 space-y-4">
          <div className="font-bold text-slate-700 text-sm uppercase tracking-wide border-b pb-2">Images</div>
          <div className="text-xs text-slate-400">Paste a URL or click Upload to choose a file (JPEG, PNG, WebP · max 5 MB)</div>
          <ImageUploadField
            label="Hero Image URL"
            value={heroUrl}
            onChange={setHeroUrl}
            placeholder="https://…"
            token={token}
            testId="input-hero-url"
            required
          />
          <ImageUploadField
            label="Thumbnail URL"
            value={thumbUrl}
            onChange={setThumbUrl}
            placeholder="https://… (optional, defaults to hero)"
            token={token}
            testId="input-thumb-url"
          />
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow p-6 space-y-4">
          <div className="font-bold text-slate-700 text-sm uppercase tracking-wide border-b pb-2">Content</div>
          {field("Intro", <textarea value={intro} onChange={e => setIntro(e.target.value)} rows={4} placeholder="Opening paragraph(s)" className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-y" data-testid="input-intro" />)}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Sections</label>
            <div className="text-xs text-slate-400 mb-3">Add body sections with optional headings and bullet lists. Drag to reorder using ↑↓ buttons.</div>
            <SectionsEditor
              sections={sections}
              onChange={setSections}
              sectionErrors={sectionErrors}
              onClearError={i => setSectionErrors(prev => { const next = { ...prev }; delete next[i]; return next; })}
            />
            <JsonPreview label="Sections" value={sections} />
          </div>

          {field("Conclusion", <textarea value={conclusion} onChange={e => setConclusion(e.target.value)} rows={3} placeholder="Closing paragraph(s)" className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-y" data-testid="input-conclusion" />)}
        </div>

        {/* Related & Links */}
        <div className="bg-white rounded-2xl shadow p-6 space-y-4">
          <div className="font-bold text-slate-700 text-sm uppercase tracking-wide border-b pb-2">Related & Links</div>
          {field("Related Slugs", input(relatedSlugsRaw, setRelatedSlugsRaw, { placeholder: "slug-one, slug-two (comma separated)", "data-testid": "input-related-slugs" } as any))}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Internal Links</label>
            <div className="text-xs text-slate-400 mb-3">Label and destination URL for each in-site link shown at the bottom of the post.</div>
            <InternalLinksEditor links={internalLinks} onChange={setInternalLinks} />
            <JsonPreview label="Internal Links" value={internalLinks} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">FAQs</label>
            <div className="text-xs text-slate-400 mb-3">Question and answer pairs for the FAQ section and FAQ structured data.</div>
            <FaqsEditor faqs={faqs} onChange={setFaqs} />
            <JsonPreview label="FAQs" value={faqs} />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pb-8">
          <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-lg border border-slate-300 text-sm font-semibold text-slate-600 hover:bg-slate-50" data-testid="button-cancel-form">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-lg font-bold text-white text-sm disabled:opacity-60"
            style={{ background: NAVY }}
            data-testid="button-save"
          >
            {saving ? "Saving…" : isEdit ? "Update Post" : "Create Post"}
          </button>
        </div>
      </form>
    </div>
  );
}
