import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import { ContactForm } from "@/components/home/ContactForm";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export default function ContactUs() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
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
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-serif font-bold text-primary mb-6">Get in Touch</h2>
                  <p className="text-muted-foreground leading-relaxed mb-8">
                    At Rainbow International School, we make our best efforts to provide excellent services. Feel free to reach out — our admissions team will be happy to assist you.
                  </p>
                </div>

                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <MapPin className="text-primary" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary mb-1">Address</h3>
                      <p className="text-muted-foreground text-sm">Anand Nagar, Thane West, Maharashtra, India</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <Phone className="text-primary" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary mb-1">Phone</h3>
                      <a href="tel:+918655003366" className="text-muted-foreground text-sm hover:text-primary transition-colors">+91 86550 03366</a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <Mail className="text-primary" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary mb-1">Email</h3>
                      <a href="mailto:info@rainbowinternationalschool.in" className="text-muted-foreground text-sm hover:text-primary transition-colors">info@rainbowinternationalschool.in</a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <Clock className="text-primary" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary mb-1">Office Hours</h3>
                      <p className="text-muted-foreground text-sm">Monday – Saturday: 9:00 AM – 5:00 PM</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl overflow-hidden shadow border">
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
                <h2 className="text-3xl font-serif font-bold text-primary mb-6">Send Inquiries</h2>
                <p className="text-muted-foreground text-sm mb-6">
                  Kindly fill the inquiry form to enroll your child at Rainbow International School. Once received, our Admission Counsellor will connect with you shortly.
                </p>
                <a
                  href="#contact"
                  className="inline-block bg-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-primary/90 transition-colors shadow-md"
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
