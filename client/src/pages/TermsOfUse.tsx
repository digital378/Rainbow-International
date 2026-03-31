import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Terms of Use - Rainbow International School"
        description="Terms of Use for Rainbow International School's website. Understand the rules and guidelines for using our site."
        canonical="https://rainbowinternationalschool.in/term-of-use/"
      />
      <Navbar />
      <PageBanner
        title="Terms of Use"
        breadcrumb={[{ label: "Terms of Use" }]}
      />

      <main className="flex-grow py-16 bg-background">
        <div className="container mx-auto px-4 max-w-3xl text-muted-foreground space-y-6">
          <p className="text-sm text-muted-foreground">Last updated: October 2025</p>

          <h2 className="text-xl font-serif font-bold text-primary mt-8">1. Acceptance of Terms</h2>
          <p>By accessing or using the Rainbow International School website (rainbowinternationalschool.in), you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use our website.</p>

          <h2 className="text-xl font-serif font-bold text-primary mt-8">2. Use of the Website</h2>
          <p>You agree to use this website only for lawful purposes and in a manner that does not infringe the rights of others. You must not:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Use the site for any fraudulent or unlawful purpose.</li>
            <li>Attempt to gain unauthorized access to any part of the website.</li>
            <li>Transmit any harmful, offensive, or disruptive content.</li>
            <li>Reproduce or distribute content from this website without written permission.</li>
          </ul>

          <h2 className="text-xl font-serif font-bold text-primary mt-8">3. Intellectual Property</h2>
          <p>All content on this website — including text, images, logos, graphics, and videos — is the property of Rainbow International School and is protected by applicable copyright and intellectual property laws. Unauthorized use is strictly prohibited.</p>

          <h2 className="text-xl font-serif font-bold text-primary mt-8">4. Disclaimer</h2>
          <p>The information on this website is provided for general information purposes only. Rainbow International School makes no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, or suitability of the information.</p>

          <h2 className="text-xl font-serif font-bold text-primary mt-8">5. Links to Other Websites</h2>
          <p>Our website may contain links to external websites. These links are provided for your convenience and do not imply endorsement. Rainbow International School has no control over the content or privacy practices of linked websites.</p>

          <h2 className="text-xl font-serif font-bold text-primary mt-8">6. Changes to Terms</h2>
          <p>We reserve the right to modify these Terms of Use at any time. Changes will be effective immediately upon posting to the website. Your continued use of the website after changes constitutes your acceptance of the new terms.</p>

          <h2 className="text-xl font-serif font-bold text-primary mt-8">7. Governing Law</h2>
          <p>These terms shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Thane, Maharashtra.</p>

          <h2 className="text-xl font-serif font-bold text-primary mt-8">8. Contact Us</h2>
          <p>For questions about these Terms of Use, please contact us at:</p>
          <ul className="list-none space-y-1">
            <li>Email: <a href="mailto:info@rainbowinternationalschool.in" className="text-primary underline">info@rainbowinternationalschool.in</a></li>
            <li>Phone: <a href="tel:+918655003366" className="text-primary underline">+91 86550 03366</a></li>
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
}
