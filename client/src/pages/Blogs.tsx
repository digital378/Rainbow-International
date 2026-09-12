import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ArrowRight, Search } from "lucide-react";
import { useState } from "react";
import ScrollProgress from "@/components/home/ScrollProgress";
import { useQuery } from "@tanstack/react-query";
import { CODE_OWNED_BLOGS, type CodeOwnedBlog } from "@shared/codeOwnedBlogs";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  date: string;
  cat: string;
  intro: string;
  publishedAt?: string;
}

/** A listing card, whether it came from the database or from code. */
type BlogCard = BlogPost & Pick<CodeOwnedBlog, "accentColor" | "emoji" | "badge"> & { pinned: boolean };

const categories = ["All", "CBSE School", "School", "Education", "Technology in Education", "Parenting", "Student Life", "Student Wellness", "Admissions", "Sports", "Study Tips", "General", "Events"];

/* Code-owned pages (custom SSR / static HTML) have no blog_posts row, so the
   /api/blog-posts response never contains them. They are declared once in
   shared/codeOwnedBlogs.ts and pinned to the top of the listing here — that is
   the only reason they are visible on this page at all. */
const pinnedCards: BlogCard[] = CODE_OWNED_BLOGS.map((b) => ({
  id: `code-owned-${b.slug}`,
  slug: b.slug,
  title: b.title,
  date: b.date,
  cat: b.cat,
  intro: b.intro,
  publishedAt: b.publishedAt,
  accentColor: b.accentColor,
  emoji: b.emoji,
  badge: b.badge,
  pinned: true,
})).sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));

const pinnedSlugs = new Set(pinnedCards.map((c) => c.slug));

/** Build the canonical clean URL for a listing card. */
function cardHref(blog: BlogCard): string {
  const path = `/blog/${blog.slug}`;
  return path;
}


export default function Blogs() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: dbBlogs = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog-posts"],
    select: (posts) =>
      posts.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        date: p.date,
        cat: p.cat,
        intro: p.intro,
      })),
  });

  // Code-owned pages first, then the database posts. If a slug ever exists in
  // both places the code-owned entry wins, so a card can never appear twice.
  const allBlogs: BlogCard[] = [
    ...pinnedCards,
    ...dbBlogs
      .filter((p) => !pinnedSlugs.has(p.slug))
      .map((p) => ({ ...p, pinned: false })),
  ];

  const filtered = allBlogs.filter(b => {
    const matchesCat = activeCategory === "All" || b.cat === activeCategory;
    const matchesSearch = !searchQuery || b.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title="Blogs"
        description="Read 86+ insightful articles from Rainbow International School on education, parenting, CBSE, student wellness, admissions, sports and more."
        keywords="Rainbow school blog, education blog Thane, CBSE school blog, parenting tips school Thane, student development blog Rainbow International"
        canonical="https://rainbowinternationalschool.in/blogs"
        breadcrumbs={[
          { name: "Home", href: "https://rainbowinternationalschool.in/" },
          { name: "Blogs", href: "https://rainbowinternationalschool.in/blogs" },
        ]}
      />
      <Navbar />
      <PageBanner
        title="Blogs"
        subtitle={`${allBlogs.length} articles on education, parenting & student development.`}
        breadcrumb={[{ label: "Blogs" }]}
      />

      <main className="flex-grow py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-blog-search"
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  data-testid={`filter-category-${cat.replace(/\s+/g, "-").toLowerCase()}`}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 text-sm rounded-full font-medium border transition-colors ${
                    activeCategory === cat
                      ? "text-white border-transparent"
                      : "text-gray-600 border-gray-200 bg-white hover:border-gray-300"
                  }`}
                  style={activeCategory === cat ? { background: "#0d3b86", borderColor: "#0d3b86" } : {}}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 animate-pulse">
                  <div className="h-4 bg-gray-100 rounded w-1/3 mb-3" />
                  <div className="h-5 bg-gray-100 rounded w-full mb-2" />
                  <div className="h-5 bg-gray-100 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {/* Plain anchor: /blog/:slug is server-rendered, so these must be
                  real navigations. A wouter Link would keep the SPA mounted and
                  render the old client-side article instead. */}
              {filtered.map((blog) => (
                <a
                  key={blog.slug}
                  href={cardHref(blog)}
                  onClick={(event) => {
                    if (blog.slug === "ganesh-chaturthi-2026") {
                      event.preventDefault();
                      window.location.assign(`${cardHref(blog)}?open=1`);
                    }
                  }}
                  data-testid={`card-blog-${blog.slug}`}
                  className="group flex h-full flex-col rounded-2xl bg-white border shadow-sm hover:shadow-md transition-shadow"
                  style={
                    blog.pinned && blog.accentColor
                      ? { borderColor: "#e2e8f0", borderTop: `3px solid ${blog.accentColor}` }
                      : { borderColor: "#f3f4f6" }
                  }
                >
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wide flex items-center gap-1.5" style={{ color: "#f97316" }}>
                        {blog.emoji ? `${blog.emoji} ` : ""}{blog.cat}
                        {blog.badge && (
                          <span className="ml-1 bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{blog.badge}</span>
                        )}
                      </span>
                      <span className="shrink-0 text-xs text-gray-400">{blog.date}</span>
                    </div>
                    <h3 className="min-h-[3rem] text-base font-bold text-gray-800 leading-snug group-hover:text-blue-800 transition-colors line-clamp-2 mb-3">
                      {blog.title}
                    </h3>
                    <div className="min-h-[3rem]">
                      {blog.intro && (
                        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{blog.intro}</p>
                      )}
                    </div>
                    <span className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-semibold" style={{ color: "#0d3b86" }}>
                      Read More <ArrowRight size={14} />
                    </span>
                  </div>
                </a>
              ))}
              {filtered.length === 0 && (
                <div className="col-span-full text-center py-16 text-gray-400">
                  No articles found. Try a different search or category.
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
