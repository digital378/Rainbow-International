import { useState, useEffect, useCallback } from "react";
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

  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

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
      {/* Header */}
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

      {/* Toolbar */}
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

      {/* Table */}
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

function PostForm({ post, token, onDone, onCancel }: { post: BlogPost | null; token: string; onDone: () => void; onCancel: () => void }) {
  const isEdit = !!post;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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

  const [sectionsJson, setSectionsJson] = useState(() => JSON.stringify(post?.sections ?? [], null, 2));
  const [relatedSlugsRaw, setRelatedSlugsRaw] = useState(() => (post?.relatedSlugs ?? []).join(", "));
  const [internalLinksJson, setInternalLinksJson] = useState(() => JSON.stringify(post?.internalLinks ?? [], null, 2));
  const [faqsJson, setFaqsJson] = useState(() => JSON.stringify(post?.faqs ?? [], null, 2));

  const [sectionsErr, setSectionsErr] = useState("");
  const [internalLinksErr, setInternalLinksErr] = useState("");
  const [faqsErr, setFaqsErr] = useState("");

  const autoSlug = (t: string) => t.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleTitleChange = (v: string) => {
    setTitle(v);
    if (!isEdit && !slug) setSlug(autoSlug(v));
  };

  const parseJSON = (raw: string, label: string, setErr: (e: string) => void) => {
    try {
      setErr("");
      return { ok: true, value: JSON.parse(raw) };
    } catch {
      setErr(`Invalid JSON in ${label}`);
      return { ok: false, value: null };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const sectionsResult = parseJSON(sectionsJson, "Sections", setSectionsErr);
    const linksResult = parseJSON(internalLinksJson, "Internal Links", setInternalLinksErr);
    const faqsResult = parseJSON(faqsJson, "FAQs", setFaqsErr);
    if (!sectionsResult.ok || !linksResult.ok || !faqsResult.ok) return;

    const relatedSlugs = relatedSlugsRaw.split(",").map(s => s.trim()).filter(Boolean);

    const body = {
      slug: slug.trim(),
      title: title.trim(),
      metaTitle: metaTitle.trim() || title.trim(),
      metaDescription: metaDescription.trim(),
      keywords: keywords.trim(),
      date: date,
      cat: cat.trim(),
      thumbUrl: thumbUrl.trim() || null,
      heroUrl: heroUrl.trim(),
      intro: intro.trim(),
      sections: sectionsResult.value,
      conclusion: conclusion.trim(),
      relatedSlugs,
      internalLinks: linksResult.value,
      faqs: faqsResult.value,
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

  const textarea = (value: string, onChange: (v: string) => void, rows = 3, err?: string) => (
    <>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        className={`w-full px-3 py-2 rounded-lg border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-400 resize-y ${err ? "border-red-400 bg-red-50" : "border-slate-300"}`}
      />
      {err && <div className="text-xs text-red-600 mt-1">{err}</div>}
    </>
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

        <div className="bg-white rounded-2xl shadow p-6 space-y-4">
          <div className="font-bold text-slate-700 text-sm uppercase tracking-wide border-b pb-2">SEO</div>
          {field("Meta Title", input(metaTitle, setMetaTitle, { placeholder: "Defaults to title if empty", "data-testid": "input-meta-title" } as any))}
          {field("Meta Description", <textarea value={metaDescription} onChange={e => setMetaDescription(e.target.value)} rows={2} placeholder="150-160 chars for best SEO" className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-y" data-testid="input-meta-description" />)}
          {field("Keywords", input(keywords, setKeywords, { placeholder: "comma separated keywords", "data-testid": "input-keywords" } as any))}
        </div>

        <div className="bg-white rounded-2xl shadow p-6 space-y-4">
          <div className="font-bold text-slate-700 text-sm uppercase tracking-wide border-b pb-2">Images</div>
          {field("Hero Image URL", input(heroUrl, setHeroUrl, { placeholder: "https://…", "data-testid": "input-hero-url" } as any))}
          {field("Thumbnail URL", input(thumbUrl, setThumbUrl, { placeholder: "https://… (optional)", "data-testid": "input-thumb-url" } as any))}
        </div>

        <div className="bg-white rounded-2xl shadow p-6 space-y-4">
          <div className="font-bold text-slate-700 text-sm uppercase tracking-wide border-b pb-2">Content</div>
          {field("Intro", <textarea value={intro} onChange={e => setIntro(e.target.value)} rows={4} placeholder="Opening paragraph(s)" className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-y" data-testid="input-intro" />)}
          {field("Sections (JSON array)", textarea(sectionsJson, setSectionsJson, 10, sectionsErr),
            '[{"heading":"Optional heading","body":"Paragraph text","list":["optional","bullet","items"]}]')}
          {field("Conclusion", <textarea value={conclusion} onChange={e => setConclusion(e.target.value)} rows={3} placeholder="Closing paragraph(s)" className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-y" data-testid="input-conclusion" />)}
        </div>

        <div className="bg-white rounded-2xl shadow p-6 space-y-4">
          <div className="font-bold text-slate-700 text-sm uppercase tracking-wide border-b pb-2">Related & Links</div>
          {field("Related Slugs", input(relatedSlugsRaw, setRelatedSlugsRaw, { placeholder: "slug-one, slug-two (comma separated)", "data-testid": "input-related-slugs" } as any))}
          {field("Internal Links (JSON array)", textarea(internalLinksJson, setInternalLinksJson, 4, internalLinksErr),
            '[{"label":"Link text","href":"/page-path"}]')}
          {field("FAQs (JSON array)", textarea(faqsJson, setFaqsJson, 6, faqsErr),
            '[{"q":"Question?","a":"Answer."}]')}
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
