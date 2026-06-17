import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Link } from "wouter";
import ScrollProgress from "@/components/home/ScrollProgress";
import { SEO } from "@/components/SEO";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SEO title="Page Not Found | Rainbow International School" robots="noindex, follow" />
      <ScrollProgress />
      <Navbar />
      <main className="flex-grow flex items-center justify-center py-20">
        <div className="text-center px-4 max-w-lg">
          <div className="text-8xl font-black mb-4" style={{ color: "#0d3b86" }}>404</div>
          <h1 className="text-3xl font-black mb-4 text-gray-900">Page Not Found</h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            The page you're looking for doesn't exist or has been moved. Let's get you back on track.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/" className="inline-block text-white font-bold py-3 px-8 rounded-full hover:opacity-90 transition-opacity" style={{ background: "#0d3b86" }}>
              Back to Home
            </Link>
            <Link href="/contact-us" className="inline-block font-bold py-3 px-8 rounded-full border-2 transition-colors" style={{ borderColor: "#0d3b86", color: "#0d3b86" }}>
              Contact Us
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
