import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ArrowRight, Search } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import ScrollProgress from "@/components/home/ScrollProgress";
import { useQuery } from "@tanstack/react-query";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  date: string;
  cat: string;
  intro: string;
}

const categories = ["All", "CBSE School", "School", "Education", "Technology in Education", "Parenting", "Student Life", "Student Wellness", "Admissions", "Sports", "Study Tips", "General"];


export default function Blogs() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: allBlogs = [], isLoading } = useQuery<BlogPost[]>({
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
              {filtered.map((blog) => (
                <Link
                  key={blog.slug}
                  href={`/blog/${blog.slug}`}
                  data-testid={`card-blog-${blog.slug}`}
                  className="group block rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#f97316" }}>{blog.cat}</span>
                      <span className="text-xs text-gray-400">{blog.date}</span>
                    </div>
                    <h3 className="text-base font-bold text-gray-800 leading-snug group-hover:text-blue-800 transition-colors line-clamp-2 mb-3">
                      {blog.title}
                    </h3>
                    {blog.intro && (
                      <p className="text-sm text-gray-500 line-clamp-2 mb-3">{blog.intro}</p>
                    )}
                    <span className="inline-flex items-center gap-1 text-sm font-semibold" style={{ color: "#0d3b86" }}>
                      Read More <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              ))}
              {filtered.length === 0 && !isLoading && (
                <div className="col-span-3 text-center py-16 text-gray-400">
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
