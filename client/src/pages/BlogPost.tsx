import { useParams, Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import ScrollProgress from "@/components/home/ScrollProgress";
import { ContactForm } from "@/components/home/ContactForm";
import { getBlogPost, blogPosts } from "@/data/blogPosts";
import { Calendar, Tag, ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { BlogThumb } from "@/components/home/BlogThumb";

function renderInlineMarkdown(text: string) {
  const parts: (string | JSX.Element)[] = [];
  const regex = /\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[1]) {
      parts.push(<strong key={key++}>{match[1]}</strong>);
    } else if (match[2] && match[3]) {
      parts.push(<a key={key++} href={match[3]} className="text-blue-700 underline hover:text-blue-900">{match[2]}</a>);
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
}

export default function BlogPost() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const post = getBlogPost(slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center py-24">
          <div className="text-center">
            <h1 className="text-3xl font-black mb-4" style={{ color: "#0d3b86" }}>Article Not Found</h1>
            <p className="text-gray-600 mb-6">This blog post hasn't been added yet. Check back soon.</p>
            <Link href="/blogs" className="inline-block px-6 py-3 rounded-full text-white font-semibold" style={{ background: "#0d3b86" }}>
              Back to All Blogs
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const related = post.relatedSlugs
    .map((s) => blogPosts.find((p) => p.slug === s))
    .filter(Boolean)
    .slice(0, 3) as typeof blogPosts;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title={post.metaTitle}
        description={post.metaDescription}
        keywords={post.keywords}
        canonical={`https://rainbowinternationalschool.in/blog/${post.slug}/`}
        ogImage={post.heroUrl}
        breadcrumbs={[
          { name: "Home", href: "https://www.rainbowinternationalschool.in/" },
          { name: "Blogs", href: "https://www.rainbowinternationalschool.in/blogs" },
          { name: post.title, href: `https://rainbowinternationalschool.in/blog/${post.slug}/` },
        ]}
      />
      <Navbar />

      {/* Hero */}
      <div
        className="relative w-full flex flex-col items-center justify-center text-center px-4 py-20 md:py-28"
        style={{
          background: `linear-gradient(135deg, #091a4f 0%, #0d3b86 100%)`,
          minHeight: "320px",
        }}
      >
        {/* Background image overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: `url(${post.heroUrl})` }}
        />
        <div className="relative z-10 max-w-4xl mx-auto">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest rounded-full px-4 py-1.5 mb-5" style={{ background: "#f97316", color: "#fff" }}>
            {post.cat}
          </span>
          <h1 className="text-2xl md:text-4xl font-black text-white leading-tight mb-5">{post.title}</h1>
          <div className="flex items-center justify-center flex-wrap gap-4 text-white/70 text-sm">
            <span className="flex items-center gap-1.5"><Calendar size={14} />{post.date}</span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span className="flex items-center gap-1.5"><Tag size={14} />{post.cat}</span>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="border-b border-gray-100 bg-white">
        <div className="container mx-auto px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
          <Link href="/" className="hover:text-blue-700">Home</Link>
          <span>/</span>
          <Link href="/blogs" className="hover:text-blue-700">Blogs</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium truncate max-w-xs">{post.title}</span>
        </div>
      </div>

      <main className="flex-grow bg-white">
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-12">

            {/* Article */}
            <article className="flex-grow min-w-0">
              {/* Intro */}
              <p className="text-lg text-gray-700 leading-relaxed mb-8 font-medium border-l-4 pl-5" style={{ borderColor: "#0d3b86" }}>
                {post.intro}
              </p>

              {/* Sections */}
              {post.sections.map((section, i) => (
                <div key={i} className="mb-10">
                  {section.heading && (
                    <h2 className="text-xl md:text-2xl font-black mb-4" style={{ color: "#0d3b86" }}>
                      {section.heading}
                    </h2>
                  )}
                  {section.body.split("\n\n").map((para, j) => (
                    <p key={j} className="text-gray-700 leading-relaxed mb-4 text-base">
                      {renderInlineMarkdown(para.replace(/\n/g, " "))}
                    </p>
                  ))}
                  {section.list && section.list.length > 0 && (
                    <ul className="mt-3 space-y-2 pl-4">
                      {section.list.map((item, k) => (
                        <li key={k} className="flex items-start gap-3 text-gray-700 text-base">
                          <span className="mt-1.5 flex-shrink-0 w-2 h-2 rounded-full" style={{ background: "#f97316" }} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}

              {/* Conclusion */}
              {(() => {
                const parts = post.conclusion.split(/\n\nRIS_BACKLINK:\s*|^RIS_BACKLINK:\s*/m);
                const mainConclusion = parts[0] || "";
                const backlink = parts[1] || "";
                return (
                  <>
                    <div className="mt-10 rounded-3xl p-8" style={{ background: "#f8faff", border: "1px solid #e5eaf5" }}>
                      <h2 className="text-xl font-black mb-4" style={{ color: "#0d3b86" }}>Conclusion</h2>
                      {mainConclusion.split("\n\n").map((para, j) => (
                        <p key={j} className="text-gray-700 leading-relaxed mb-3">
                          {renderInlineMarkdown(para.replace(/\n/g, " "))}
                        </p>
                      ))}
                    </div>
                    {backlink && (
                      <div className="mt-6 rounded-2xl p-6 flex items-center gap-4" style={{ background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)", border: "1px solid #fbbf24" }}>
                        <span className="text-2xl flex-shrink-0">🌈</span>
                        <p className="text-gray-800 text-sm leading-relaxed">
                          {renderInlineMarkdown(backlink.trim())}
                        </p>
                      </div>
                    )}
                  </>
                );
              })()}

              {/* Tags */}
              <div className="mt-8 flex flex-wrap gap-2">
                {post.keywords.split(",").map((kw, i) => (
                  <span key={i} className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    {kw.trim()}
                  </span>
                ))}
              </div>

              {/* Nav */}
              <div className="mt-10 flex justify-between items-center border-t border-gray-100 pt-6">
                <Link href="/blogs" className="flex items-center gap-2 text-sm font-semibold hover:underline" style={{ color: "#0d3b86" }}>
                  <ArrowLeft size={16} /> All Blogs
                </Link>
                <Link href="/contact-us" className="flex items-center gap-2 px-5 py-2 rounded-full text-white text-sm font-semibold shadow-sm" style={{ background: "#0d3b86" }}>
                  Apply for Admissions <ArrowRight size={16} />
                </Link>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="w-full lg:w-72 flex-shrink-0 space-y-6">

              {/* Internal Links */}
              <div className="rounded-2xl border border-gray-100 shadow-sm p-6 bg-white">
                <h3 className="text-base font-black mb-4" style={{ color: "#0d3b86" }}>Explore Rainbow</h3>
                <ul className="space-y-2">
                  {post.internalLinks.map((lnk, i) => (
                    <li key={i}>
                      <Link
                        href={lnk.href}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-800 transition-colors py-1 border-b border-gray-50"
                      >
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#f97316" }} />
                        {lnk.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* RPS External Link */}
              <div className="rounded-2xl p-6 text-white" style={{ background: "#0d3b86" }}>
                <div className="bg-white rounded-lg px-3 py-2 inline-flex items-center mb-3">
                  <img src="/rps-logo.png" alt="Rainbow Preschool International" className="h-8 w-auto object-contain" width={100} height={32} loading="lazy" decoding="async" onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }} />
                </div>
                <h3 className="font-black text-base mb-2">Rainbow Preschool International</h3>
                <p className="text-white/80 text-xs leading-relaxed mb-4">
                  Explore our award-winning preschool chain — the perfect foundation before joining Rainbow International School.
                </p>
                <a
                  href="https://www.rainbowpreschools.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold px-4 py-2 rounded-full bg-white" style={{ color: "#0d3b86" }}
                >
                  Visit RPS <ExternalLink size={12} />
                </a>
              </div>

              {/* Admissions CTA */}
              <div className="rounded-2xl p-6 border border-gray-100 shadow-sm bg-white text-center">
                <div className="text-3xl mb-2">🎓</div>
                <h3 className="font-black text-base mb-2" style={{ color: "#0d3b86" }}>Admissions Open</h3>
                <p className="text-gray-500 text-xs mb-4">2026–27 admissions are now open for Nursery to Class 12.</p>
                <Link
                  href="/contact-us"
                  className="inline-block w-full py-2 rounded-full text-white text-sm font-semibold"
                  style={{ background: "#f97316" }}
                >
                  Apply Now
                </Link>
              </div>
            </aside>
          </div>

          {/* Related Posts */}
          {related.length > 0 && (
            <div className="mt-16 border-t border-gray-100 pt-12">
              <h2 className="text-2xl font-black mb-8 text-center" style={{ color: "#0d3b86" }}>Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {related.map((rel) => (
                  <Link key={rel.slug} href={`/blog/${rel.slug}`} className="group block rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow bg-white">
                    <div className="p-5">
                      <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#f97316" }}>{rel.cat}</span>
                      <h3 className="text-base font-bold mt-2 leading-snug text-gray-800 group-hover:text-blue-800 transition-colors line-clamp-3">
                        {rel.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-2">{rel.date}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <ContactForm />
      </main>

      <Footer />
    </div>
  );
}
