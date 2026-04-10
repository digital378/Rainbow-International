import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import ScrollProgress from "@/components/home/ScrollProgress";

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title="Terms of Use - Rainbow International School"
        description="Terms of Use for Rainbow International School's website. Understand the rules and guidelines for using our site."
        keywords="terms of use, website terms, Rainbow International School, user agreement, school website terms"
        canonical="https://www.rainbowinternationalschool.in/term-of-use"
      />
      <Navbar />
      <PageBanner
        title="Terms of Use"
        breadcrumb={[{ label: "Terms of Use" }]}
      />

      <main className="flex-grow py-16 bg-white">
        <div className="container mx-auto px-4 max-w-3xl text-gray-600 space-y-6">
          <p className="text-sm text-gray-500">Last updated: October 2025</p>

          <div>
            <h2 className="text-xl font-black mt-8 mb-3" style={{ color: "#0d3b86" }}>1. Acceptance of Terms</h2>
            <p className="text-sm leading-relaxed">By accessing or using the Rainbow International School website (rainbowinternationalschool.in), you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use our website.</p>
          </div>

          <div>
            <h2 className="text-xl font-black mt-8 mb-3" style={{ color: "#0d3b86" }}>2. Use of the Website</h2>
            <p className="text-sm leading-relaxed mb-3">You agree to use this website only for lawful purposes and in a manner that does not infringe the rights of others. You must not:</p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Use the site for any fraudulent or unlawful purpose.</li>
              <li>Attempt to gain unauthorized access to any part of the website.</li>
              <li>Transmit any harmful, offensive, or disruptive content.</li>
              <li>Reproduce or distribute content from this website without written permission.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-black mt-8 mb-3" style={{ color: "#0d3b86" }}>3. Intellectual Property</h2>
            <p className="text-sm leading-relaxed">All content on this website — including text, images, logos, graphics, and videos — is the property of Rainbow International School and is protected by applicable copyright and intellectual property laws. Unauthorized use is strictly prohibited.</p>
          </div>

          <div>
            <h2 className="text-xl font-black mt-8 mb-3" style={{ color: "#0d3b86" }}>4. Disclaimer</h2>
            <p className="text-sm leading-relaxed">The information on this website is provided for general information purposes only. Rainbow International School makes no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, or suitability of the information.</p>
          </div>

          <div>
            <h2 className="text-xl font-black mt-8 mb-3" style={{ color: "#0d3b86" }}>5. Links to Other Websites</h2>
            <p className="text-sm leading-relaxed">Our website may contain links to external websites. These links are provided for your convenience and do not imply endorsement. Rainbow International School has no control over the content or privacy practices of linked websites.</p>
          </div>

          <div>
            <h2 className="text-xl font-black mt-8 mb-3" style={{ color: "#0d3b86" }}>6. Changes to Terms</h2>
            <p className="text-sm leading-relaxed">We reserve the right to modify these Terms of Use at any time. Changes will be effective immediately upon posting to the website. Your continued use of the website after changes constitutes your acceptance of the new terms.</p>
          </div>

          <div>
            <h2 className="text-xl font-black mt-8 mb-3" style={{ color: "#0d3b86" }}>7. Governing Law</h2>
            <p className="text-sm leading-relaxed">These terms shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Thane, Maharashtra.</p>
          </div>

          <div>
            <h2 className="text-xl font-black mt-8 mb-3" style={{ color: "#0d3b86" }}>8. Contact Us</h2>
            <p className="text-sm mb-2">For questions about these Terms of Use, please contact us at:</p>
            <ul className="space-y-1 text-sm">
              <li>Email: <a href="mailto:info@rainbowinternationalschool.in" className="underline" style={{ color: "#0d3b86" }}>info@rainbowinternationalschool.in</a></li>
              <li>Phone: <a href="tel:+918655003366" className="underline" style={{ color: "#0d3b86" }}>+91 86550 03366</a></li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
