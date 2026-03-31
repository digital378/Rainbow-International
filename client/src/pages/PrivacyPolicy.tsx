import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
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

      <main className="flex-grow py-16 bg-background">
        <div className="container mx-auto px-4 max-w-3xl prose prose-sm max-w-none text-muted-foreground space-y-6">
          <p className="text-sm text-muted-foreground">Last updated: October 2025</p>

          <h2 className="text-xl font-serif font-bold text-primary mt-8">1. Introduction</h2>
          <p>Rainbow International School ("we", "us", or "our") operates the website rainbowinternationalschool.in. This page informs you of our policies regarding the collection, use, and disclosure of Personal Information when you use our website.</p>
          <p>By using the website, you agree to the collection and use of information in accordance with this policy.</p>

          <h2 className="text-xl font-serif font-bold text-primary mt-8">2. Information We Collect</h2>
          <p>We collect several types of information for various purposes to provide and improve our service to you:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Personal Data:</strong> Name, email address, phone number, and grade when you submit an inquiry form.</li>
            <li><strong>Usage Data:</strong> Information about how you access and use the website, including your browser type, IP address, pages visited, and time spent.</li>
            <li><strong>Cookies:</strong> We use cookies and similar tracking technologies to track activity and improve your experience.</li>
          </ul>

          <h2 className="text-xl font-serif font-bold text-primary mt-8">3. How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>To respond to your inquiries and provide admission-related information.</li>
            <li>To send newsletters, updates, and important school notifications (you can opt out at any time).</li>
            <li>To improve our website and services.</li>
            <li>To comply with legal obligations.</li>
          </ul>

          <h2 className="text-xl font-serif font-bold text-primary mt-8">4. Cookie Policy</h2>
          <p>Cookies are small files placed on your device. We use cookies to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Remember your preferences and settings.</li>
            <li>Analyze website traffic (via Google Analytics).</li>
            <li>Improve website functionality.</li>
          </ul>
          <p>You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, some features of our website may not function properly without cookies.</p>

          <h2 className="text-xl font-serif font-bold text-primary mt-8">5. Data Security</h2>
          <p>We take the security of your data seriously and implement appropriate technical and organizational measures to protect it. However, no method of transmission over the internet is 100% secure.</p>

          <h2 className="text-xl font-serif font-bold text-primary mt-8">6. Third-Party Links</h2>
          <p>Our website may contain links to third-party websites. We have no control over the content and practices of those sites and are not responsible for their privacy policies.</p>

          <h2 className="text-xl font-serif font-bold text-primary mt-8">7. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at:</p>
          <ul className="list-none space-y-1">
            <li>Email: <a href="mailto:info@rainbowinternationalschool.in" className="text-primary underline">info@rainbowinternationalschool.in</a></li>
            <li>Phone: <a href="tel:+918655003366" className="text-primary underline">+91 86550 03366</a></li>
            <li>Address: Anand Nagar, Thane West, Maharashtra, India</li>
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
}
