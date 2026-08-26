import type { BlogPost } from "@shared/schema";
import { resolveBlogImageUrl } from "@shared/blogImage";

/**
 * Shared building blocks for server-rendered blog pages.
 *
 * Both the standard article renderer (server/ssrBlog.ts) and the immersive
 * renderer (server/ssrBlogImmersive.ts) pull their <head> metadata and page
 * chrome from here, so the two layouts can never drift apart on SEO tags,
 * navigation, or footer content.
 */

export function e(str: string | undefined | null): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderInlineMd(text: string): string {
  return e(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[(.+?)\]\((https?:\/\/.+?)\)/g, '<a href="$2" class="text-link" target="_blank" rel="noopener">$1</a>');
}

export function toISODate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "2025-01-01";
  return d.toISOString().split("T")[0];
}

/**
 * Everything inside <head> except the page-specific <style> block:
 * analytics, meta tags, canonical, Open Graph, and all JSON-LD schema.
 *
 * This is the SEO surface. It must render identically for every layout.
 */
export function renderHeadMeta(post: BlogPost): string {
  const imageUrl = resolveBlogImageUrl(post.heroUrl);

  return `  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="google-site-verification" content="jWDe0ilooX5MO3xp-F6nSkapvxY8m9Oyq3gL4_JI0hY" />
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-DN4GB6MVJJ"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-DN4GB6MVJJ');gtag('config','AW-18140772845');</script>
  <title>${e(post.metaTitle)}</title>
  <meta name="description" content="${e(post.metaDescription)}" />
  <meta name="keywords" content="${e(post.keywords)}" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://rainbowinternationalschool.in/blog/${e(post.slug)}" />
  <meta property="og:title" content="${e(post.metaTitle)}" />
  <meta property="og:description" content="${e(post.metaDescription)}" />
  <meta property="og:image" content="${e(imageUrl)}" />
  <meta property="og:url" content="https://rainbowinternationalschool.in/blog/${e(post.slug)}" />
  <meta property="og:type" content="article" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta property="og:locale" content="en_IN" />
  <script type="application/ld+json">
  ${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.metaTitle || post.title,
    "description": post.metaDescription,
    "image": imageUrl,
    "datePublished": toISODate(post.date),
    "dateModified": toISODate(post.date),
    "author": {
      "@type": "Organization",
      "name": "Rainbow International School",
      "url": "https://rainbowinternationalschool.in"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Rainbow International School",
      "logo": {
        "@type": "ImageObject",
        "url": "https://rainbowinternationalschool.in/wp-content/uploads/2024/01/RIS-Logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://rainbowinternationalschool.in/blog/${post.slug}`
    },
    "keywords": post.keywords,
    "articleSection": post.cat
  })}
  </script>
  <script type="application/ld+json">
  ${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://rainbowinternationalschool.in/" },
      { "@type": "ListItem", "position": 2, "name": "Blogs", "item": "https://rainbowinternationalschool.in/blogs" },
      { "@type": "ListItem", "position": 3, "name": post.title, "item": `https://rainbowinternationalschool.in/blog/${post.slug}` }
    ]
  })}
  </script>
  ${post.faqs && post.faqs.length > 0 ? `<script type="application/ld+json">
  ${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": post.faqs.map((faq: { q: string; a: string }) => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  })}
  </script>` : ''}`;
}

export const META_PIXEL = `  <!-- Meta Pixel Code -->
  <script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','1280590747364170');fbq('track','PageView');</script>
  <noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=1280590747364170&ev=PageView&noscript=1"/></noscript>
  <!-- End Meta Pixel Code -->`;

export const TOPBAR_HTML = `<div class="topbar">
  <a href="tel:02269105000">
    <svg class="topbar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.14 7.74a16 16 0 006.12 6.12l1.12-1.12a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z"></path></svg>
    (022) 69105000
  </a>
  <a href="tel:+918291568972">+91 82915 68972</a>
  <span style="margin-left:auto;display:flex;align-items:center;gap:5px;">
    <svg class="topbar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
    Mon – Sat, 9:00 AM – 6:00 PM
  </span>
</div>`;

export const NAVBAR_HTML = `<nav class="navbar">
  <a class="nav-brand" href="/">
    <img src="/ris-logo.png" alt="Rainbow International School" class="nav-brand-logo" onerror="this.style.display='none'" />
    Rainbow International School
  </a>
  <ul class="nav-links">
    <li><a href="/">Home</a></li>
    <li><a href="/about-rainbow-international-school">About</a></li>
    <li><a href="/pre-primary-school-thane">Academics</a></li>
    <li><a href="/amenities">Amenities</a></li>
    <li><a href="/blogs">Blog</a></li>
    <li><a href="/contact-us">Contact</a></li>
    <li><a href="/application-form" class="nav-cta">Apply Now</a></li>
  </ul>
</nav>`;

export const CONTACT_STRIP_HTML = `  <div class="contact-strip">
    <div class="contact-strip-inner">
      <a href="tel:+918291568972" class="contact-card">
        <div class="contact-icon"><svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.14 7.74a16 16 0 006.12 6.12l1.12-1.12a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z"></path></svg></div>
        <div><p class="contact-label">Call Us</p><p class="contact-val">+91 82915 68972</p></div>
      </a>
      <a href="mailto:admin@rainbowinternationalschool.in" class="contact-card">
        <div class="contact-icon"><svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg></div>
        <div><p class="contact-label">Email Us</p><p class="contact-val">admin@rainbow<br/>internationalschool.in</p></div>
      </a>
      <div class="contact-card">
        <div class="contact-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg></div>
        <div><p class="contact-label">Working Hours</p><p class="contact-val">Monday – Saturday<br/>9:00 AM – 6:00 PM</p></div>
      </div>
      <a href="https://maps.app.goo.gl/mfJjMMkksCkcXzMCA" target="_blank" rel="noopener noreferrer" class="contact-card">
        <div class="contact-icon"><svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></div>
        <div><p class="contact-label">Our Address</p><p class="contact-val">Cosmos Arcade, Brahmand Phase 4<br/>Thane, Maharashtra</p></div>
      </a>
    </div>
  </div>`;

export function renderFooter(): string {
  return `<footer>
  <div class="footer-inner">
    <div>
      <p class="footer-brand">Rainbow International School</p>
      <p class="footer-desc">CBSE-affiliated school in Thane, Maharashtra. Nursery to Class 12. Founded April 2009. Affiliation No. 1130661.</p>
      <div class="footer-socials">
        <a href="https://www.facebook.com/RainbowInternationalSchoolThane" class="footer-social-btn" target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path></svg>
        </a>
        <a href="https://www.instagram.com/rainbowschoolthane" class="footer-social-btn" target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
        </a>
        <a href="https://www.youtube.com/@rainbowinternationalschoolthane" class="footer-social-btn" target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58z"></path><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon></svg>
        </a>
      </div>
    </div>
    <div>
      <p class="footer-col-title">Quick Links</p>
      <ul class="footer-link-list">
        <li><a href="/about-rainbow-international-school">About Rainbow</a></li>
        <li><a href="/pre-primary-school-thane">Pre-Primary Section</a></li>
        <li><a href="/primary-section">Primary Section</a></li>
        <li><a href="/middle-school-section">Middle School</a></li>
        <li><a href="/secondary-section">Secondary Section</a></li>
        <li><a href="/senior-secondary-section">Senior Secondary</a></li>
        <li><a href="/academic-calendar">Academic Calendar</a></li>
      </ul>
    </div>
    <div>
      <p class="footer-col-title">Explore</p>
      <ul class="footer-link-list">
        <li><a href="/awards-achievements">Awards & Achievements</a></li>
        <li><a href="/amenities">Amenities & Facilities</a></li>
        <li><a href="/student-achievements">Student Achievements</a></li>
        <li><a href="/safety-security">Safety & Security</a></li>
        <li><a href="/beyond-the-classroom">Beyond The Classroom</a></li>
        <li><a href="/extracurriculars">Extracurriculars</a></li>
        <li><a href="/blogs">Blogs</a></li>
      </ul>
    </div>
    <div>
      <p class="footer-col-title">Contact Us</p>
      <div class="footer-contact-item">
        <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
        <span>Cosmos Arcade, Brahmand Phase 4, Thane, Maharashtra</span>
      </div>
      <div class="footer-contact-item">
        <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.14 7.74a16 16 0 006.12 6.12l1.12-1.12a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z"></path></svg>
        <span>+91 82915 68972</span>
      </div>
      <div class="footer-contact-item">
        <svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
        <a href="mailto:info@rainbowinternationalschool.in" style="color:rgba(255,255,255,0.60);text-decoration:none;">info@rainbowinternationalschool.in</a>
      </div>
    </div>
  </div>
  <div class="footer-bottom">
    <div class="footer-bottom-inner">
      <span>&copy; ${new Date().getFullYear()} Rainbow International School &middot; CBSE Affiliation No. 1130661</span>
      <div style="display:flex;gap:24px;">
        <a href="/cbse-mandatory-public-disclosures">CBSE Disclosures</a>
        <a href="/privacy-policy-and-cookie-policy">Privacy Policy</a>
      </div>
    </div>
  </div>
</footer>`;
}
