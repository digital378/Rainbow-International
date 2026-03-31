import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import ScrollProgress from "@/components/home/ScrollProgress";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title="Privacy Policy & Cookie Policy - Rainbow International School"
        description="Rainbow International School's Privacy Policy and Cookie Policy. Learn how we collect, use, and protect your personal information."
        canonical="https://rainbowinternationalschool.in/privacy-policy-and-cookie-policy/"
      />
      <Navbar />
      <PageBanner
        title="Privacy Policy & Cookie Policy"
        breadcrumb={[{ label: "Privacy Policy" }]}
      />

      <main className="flex-grow py-16 bg-white">
        <div className="container mx-auto px-4 max-w-3xl space-y-6">
          <p className="text-sm text-gray-500">Last updated: October 2025</p>

          {[
            { title: "1. Introduction", content: "Rainbow International School (\"we\", \"us\", or \"our\") operates the website rainbowinternationalschool.in. This page informs you of our policies regarding the collection, use, and disclosure of Personal Information when you use our website. By using the website, you agree to the collection and use of information in accordance with this policy." },
            { title: "2. Information We Collect", content: null },
            { title: "3. How We Use Your Information", content: null },
            { title: "4. Cookie Policy", content: "Cookies are small files placed on your device. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, some features of our website may not function properly without cookies." },
            { title: "5. Data Security", content: "We take the security of your data seriously and implement appropriate technical and organizational measures to protect it. However, no method of transmission over the internet is 100% secure." },
            { title: "6. Third-Party Links", content: "Our website may contain links to third-party websites. We have no control over the content and practices of those sites and are not responsible for their privacy policies." },
          ].map((section, i) => (
            <div key={i}>
              <h2 className="text-xl font-black mt-8 mb-3" style={{ color: "#0d3b86" }}>{section.title}</h2>
              {section.content && <p className="text-gray-600 text-sm leading-relaxed">{section.content}</p>}
              {section.title === "2. Information We Collect" && (
                <ul className="list-disc pl-6 space-y-2 text-gray-600 text-sm">
                  <li><strong>Personal Data:</strong> Name, email address, phone number, and grade when you submit an inquiry form.</li>
                  <li><strong>Usage Data:</strong> Information about how you access and use the website, including your browser type, IP address, pages visited, and time spent.</li>
                  <li><strong>Cookies:</strong> We use cookies and similar tracking technologies to track activity and improve your experience.</li>
                </ul>
              )}
              {section.title === "3. How We Use Your Information" && (
                <ul className="list-disc pl-6 space-y-2 text-gray-600 text-sm">
                  <li>To respond to your inquiries and provide admission-related information.</li>
                  <li>To send newsletters, updates, and important school notifications (you can opt out at any time).</li>
                  <li>To improve our website and services.</li>
                  <li>To comply with legal obligations.</li>
                </ul>
              )}
              {section.title === "4. Cookie Policy" && (
                <ul className="list-disc pl-6 space-y-2 text-gray-600 text-sm mt-2">
                  <li>Remember your preferences and settings.</li>
                  <li>Analyze website traffic (via Google Analytics).</li>
                  <li>Improve website functionality.</li>
                </ul>
              )}
            </div>
          ))}

          <div>
            <h2 className="text-xl font-black mt-8 mb-3" style={{ color: "#0d3b86" }}>7. Contact Us</h2>
            <p className="text-gray-600 text-sm mb-2">If you have any questions about this Privacy Policy, please contact us at:</p>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>Email: <a href="mailto:info@rainbowinternationalschool.in" className="underline" style={{ color: "#0d3b86" }}>info@rainbowinternationalschool.in</a></li>
              <li>Phone: <a href="tel:+918655003366" className="underline" style={{ color: "#0d3b86" }}>+91 86550 03366</a></li>
              <li>Address: Cosmos Arcade, Brahmand Phase 4, Thane West, Maharashtra, India</li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
