import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertInquirySchema, type InsertInquiry } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const timeSlots = [
  "9:00 AM - 11:00 AM",
  "11:00 AM - 1:00 PM",
  "1:00 PM - 3:00 PM",
  "3:00 PM - 5:00 PM",
  "5:00 PM - 7:00 PM",
];

const classOptions = [
  "Nursery",
  "Jr. KG",
  "Sr. KG",
  "Class I",
  "Class II",
  "Class III",
  "Class IV",
  "Class V",
  "Class VI",
  "Class VII",
  "Class VIII",
  "Class IX",
  "Class X",
  "Class XI",
];

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InsertInquiry>({
    resolver: zodResolver(insertInquirySchema),
  });

  const onSubmit = async (data: InsertInquiry) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit inquiry");
      }

      toast.success("Thank you for contacting Rainbow International School! Our Admission Counsellor will connect with you shortly.");
      reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit inquiry");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-secondary font-bold tracking-widest uppercase text-sm">Admissions</span>
            <h2 className="text-4xl font-serif font-bold text-primary mt-3 mb-4">Send Inquiries</h2>
            <p className="text-lg text-muted-foreground">
              Thank you for contacting Rainbow International School. Kindly fill the inquiry form to enroll your child at the Best International School in Thane. Once received, our Admission Counsellor will connect with you shortly.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-card p-8 rounded-xl shadow-lg border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="parentName" className="text-sm font-medium">
                  Parent's Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="parentName"
                  data-testid="input-parent-name"
                  {...register("parentName")}
                  className="mt-1.5"
                  placeholder="Enter your name"
                />
                {errors.parentName && (
                  <p className="text-sm text-destructive mt-1">{errors.parentName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="studentName" className="text-sm font-medium">
                  Child's Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="studentName"
                  data-testid="input-student-name"
                  {...register("studentName")}
                  className="mt-1.5"
                  placeholder="Enter child's name"
                />
                {errors.studentName && (
                  <p className="text-sm text-destructive mt-1">{errors.studentName.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="phone" className="text-sm font-medium">
                  Phone Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  data-testid="input-phone"
                  {...register("phone")}
                  className="mt-1.5"
                  placeholder="Your phone number"
                />
                {errors.phone && (
                  <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-medium">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  data-testid="input-email"
                  {...register("email")}
                  className="mt-1.5"
                  placeholder="your.email@example.com"
                />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="preferredTime" className="text-sm font-medium">
                  Preferred Time to Connect
                </Label>
                <select
                  id="preferredTime"
                  data-testid="select-preferred-time"
                  {...register("preferredTime")}
                  className="mt-1.5 w-full border border-input bg-background rounded-md px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="">Select a time slot</option>
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="grade" className="text-sm font-medium">
                  Select Class <span className="text-destructive">*</span>
                </Label>
                <select
                  id="grade"
                  data-testid="select-grade"
                  {...register("grade")}
                  className="mt-1.5 w-full border border-input bg-background rounded-md px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="">Select class</option>
                  {classOptions.map((cls) => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
                {errors.grade && (
                  <p className="text-sm text-destructive mt-1">{errors.grade.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="message" className="text-sm font-medium">
                Message
              </Label>
              <Textarea
                id="message"
                data-testid="input-message"
                {...register("message")}
                className="mt-1.5 min-h-[100px]"
                placeholder="Any additional questions or information..."
              />
            </div>

            <div className="flex justify-center pt-4">
              <Button
                type="submit"
                data-testid="button-submit-inquiry"
                disabled={isSubmitting}
                size="lg"
                className="px-12 bg-primary hover:bg-primary/90 text-white font-semibold shadow-md"
              >
                {isSubmitting ? "Submitting..." : "Send"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
