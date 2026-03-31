import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import ScrollProgress from "@/components/home/ScrollProgress";

export default function ContactUs() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollProgress />
      <SEO
        title="Contact Us - Rainbow International School Thane"
        description="Connect with Rainbow International School, Thane West. Call +91 86550 03366, email info@rainbowinternationalschool.in. Admissions open for Nursery to Class 11."
        keywords="contact Rainbow International School, Rainbow school Thane phone number, Rainbow school admission contact, school address Thane West"
        canonical="https://rainbowinternationalschool.in/contact-us/"
      />
      <Navbar />
      <PageBanner
        title="Connect with Us"
        subtitle="Do you have a Question? Feel free to reach out — we'd be glad to solve your queries."
        breadcrumb={[{ label: "Contact Us" }]}
      />

      <main className="flex-grow">
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-black mb-6" style={{ color: "#0d3b86" }}>Get in Touch</h2>
                  <p className="text-gray-600 leading-relaxed mb-8">
                    At Rainbow International School, we make our best efforts to provide excellent services. Feel free to reach out — our admissions team will be happy to assist you.
                  </p>
                </div>

                <div className="space-y-5">
                  {[
                    { icon: MapPin, label: "Address", content: "Cosmos Arcade, Brahmand Phase 4, Thane West, Maharashtra, India" },
                    { icon: Phone, label: "Phone", content: "+91 86550 03366", href: "tel:+918655003366" },
                    { icon: Mail, label: "Email", content: "info@rainbowinternationalschool.in", href: "mailto:info@rainbowinternationalschool.in" },
                    { icon: Clock, label: "Office Hours", content: "Monday – Saturday: 9:00 AM – 6:00 PM" },
                  ].map(({ icon: Icon, label, content, href }, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "#f0f4ff" }}>
                        <Icon size={20} style={{ color: "#0d3b86" }} />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1" style={{ color: "#0d3b86" }}>{label}</h3>
                        {href ? (
                          <a href={href} className="text-gray-600 text-sm hover:underline transition-colors">{content}</a>
                        ) : (
                          <p className="text-gray-600 text-sm">{content}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-3xl overflow-hidden shadow-sm border border-gray-100">
                  <iframe
                    title="Rainbow International School Location"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3767.1631567591!2d72.96988!3d19.2183!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7b9b9b9b9b9b9%3A0x9b9b9b9b9b9b9b9b!2sRainbow+International+School%2C+Thane!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin"
                    width="100%"
                    height="250"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-black mb-6" style={{ color: "#0d3b86" }}>Send Inquiries</h2>
                <p className="text-gray-600 text-sm mb-6">
                  Kindly fill the inquiry form to enroll your child at Rainbow International School. Once received, our Admission Counsellor will connect with you shortly.
                </p>
                <a
                  href="#contact"
                  className="inline-block text-white font-bold py-3 px-8 rounded-full shadow-md hover:opacity-90 transition-opacity"
                  style={{ background: "#0d3b86" }}
                >
                  Fill Inquiry Form Below
                </a>
              </div>
            </div>
          </div>
        </section>
        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
