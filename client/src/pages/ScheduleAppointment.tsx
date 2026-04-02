import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";
import { SEO } from "@/components/SEO";
import ScrollProgress from "@/components/home/ScrollProgress";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

const timeSlots = [
  "9:00 AM – 10:00 AM", "10:00 AM – 11:00 AM",
  "11:00 AM – 12:00 PM", "12:00 PM – 1:00 PM",
  "2:00 PM – 3:00 PM", "3:00 PM – 4:00 PM",
  "4:00 PM – 5:00 PM",
];

const purposes = [
  "Campus tour & admissions enquiry",
  "Meet the Principal",
  "Fee structure & scholarship discussion",
  "Transfer admission discussion",
  "General school information",
  "Other",
];

const contactDetails = [
  { icon: Phone, label: "Phone", value: "+91 82915 68972", href: "tel:+918291568972" },
  { icon: Mail, label: "Email", value: "info@rainbowinternationalschool.in", href: "mailto:info@rainbowinternationalschool.in" },
  { icon: MapPin, label: "Address", value: "Cosmos Arcade, Brahmand Phase 4, Thane West, Maharashtra" },
  { icon: Clock, label: "Hours", value: "Monday – Saturday: 9:00 AM – 6:00 PM" },
];

export default function ScheduleAppointment() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: "", phone: "", email: "", purpose: "", date: "", timeSlot: "", message: "",
  });

  const mutation = useMutation({
    mutationFn: async (data: typeof form) =>
      apiRequest("POST", "/api/inquiries", {
        parentName: data.name,
        studentName: "N/A",
        phone: data.phone,
        email: data.email,
        grade: "Appointment",
        preferredTime: data.timeSlot,
        message: `Appointment Request | Purpose: ${data.purpose} | Date: ${data.date} | Time: ${data.timeSlot} | Notes: ${data.message}`,
      }),
    onSuccess: () => navigate("/thank-you"),
    onError: () => toast({ title: "Submission failed", description: "Please call us directly.", variant: "destructive" }),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); mutation.mutate(form); };

  const inputCls = "w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";
  const labelCls = "block text-sm font-semibold text-gray-700 mb-1";

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SEO
        title="Schedule an Appointment | Rainbow International School Thane"
        description="Book a campus visit or appointment with the Rainbow International School admissions team. Meet our faculty, tour the campus, and learn about admissions for 2026–27."
        keywords="schedule appointment Rainbow International School, campus visit CBSE school Thane, book school visit Brahmand Thane"
        canonical="/schedule-appointment"
      />
      <ScrollProgress />
      <Navbar />
      <PageBanner
        title="Schedule an Appointment"
        subtitle="We'd love to show you the Rainbow campus — book your visit today"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Schedule an Appointment" }]}
        bgImage="https://rainbowinternationalschool.in/wp-content/uploads/2022/09/04-copy.jpeg"
      />

      <main className="flex-1 py-16 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Contact sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#091a4f] mb-2">Get in Touch</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Fill the form and our admissions coordinator will confirm your appointment within one working day —
                or call us directly during school hours.
              </p>
            </div>
            <div className="space-y-4">
              {contactDetails.map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-3 bg-[#f8faff] rounded-xl p-4 border border-blue-100">
                  <div className="w-9 h-9 bg-[#0d3b86] rounded-lg flex items-center justify-center shrink-0">
                    <Icon className="text-white" size={16} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">{label}</div>
                    {href ? (
                      <a href={href} className="text-sm font-medium text-[#0d3b86] hover:underline">{value}</a>
                    ) : (
                      <div className="text-sm font-medium text-gray-700">{value}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <a
              href="https://wa.me/918291568972"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl text-sm transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
              Chat on WhatsApp
            </a>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-sm p-8 space-y-5">
            <h3 className="text-lg font-bold text-[#091a4f] mb-2">Book Your Campus Visit</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>Your Name *</label>
                <input name="name" value={form.name} onChange={handleChange} required placeholder="Full name" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Mobile Number *</label>
                <input type="tel" name="phone" value={form.phone} onChange={handleChange} required placeholder="+91 XXXXX XXXXX" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Email Address</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="your@email.com" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Purpose of Visit *</label>
                <select name="purpose" value={form.purpose} onChange={handleChange} required className={inputCls}>
                  <option value="">Select purpose</option>
                  {purposes.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Preferred Date *</label>
                <input type="date" name="date" value={form.date} onChange={handleChange} required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Preferred Time Slot *</label>
                <select name="timeSlot" value={form.timeSlot} onChange={handleChange} required className={inputCls}>
                  <option value="">Select time</option>
                  {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className={labelCls}>Additional Notes</label>
              <textarea name="message" value={form.message} onChange={handleChange} rows={3} placeholder="Any specific questions or topics you'd like to discuss..." className={inputCls + " resize-none"} />
            </div>
            <button
              type="submit"
              disabled={mutation.isPending}
              data-testid="button-schedule-appointment"
              className="w-full bg-[#0d3b86] hover:bg-[#091a4f] text-white font-bold py-4 rounded-xl text-sm tracking-wide transition-colors disabled:opacity-60"
            >
              {mutation.isPending ? "Booking..." : "Confirm Appointment Request"}
            </button>
            <p className="text-center text-xs text-gray-500">Mon – Sat, 9 AM – 6 PM. We confirm within one working day.</p>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
