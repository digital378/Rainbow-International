import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertInquirySchema, type InsertInquiry } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

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

      toast.success("Thank you for your inquiry! We'll get back to you soon.");
      reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit inquiry");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif font-bold text-primary mb-4">Get in Touch</h2>
            <p className="text-lg text-muted-foreground">
              Have questions about admissions or want to learn more? We'd love to hear from you!
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-card p-8 rounded-xl shadow-lg border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="parentName" className="text-sm font-medium">
                  Parent/Guardian Name <span className="text-destructive">*</span>
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
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address <span className="text-destructive">*</span>
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
                <Label htmlFor="phone" className="text-sm font-medium">
                  Phone Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  data-testid="input-phone"
                  {...register("phone")}
                  className="mt-1.5"
                  placeholder="(123) 456-7890"
                />
                {errors.phone && (
                  <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="studentName" className="text-sm font-medium">
                  Student Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="studentName"
                  data-testid="input-student-name"
                  {...register("studentName")}
                  className="mt-1.5"
                  placeholder="Enter student's name"
                />
                {errors.studentName && (
                  <p className="text-sm text-destructive mt-1">{errors.studentName.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="grade" className="text-sm font-medium">
                Grade/Class Interested In <span className="text-destructive">*</span>
              </Label>
              <Input
                id="grade"
                data-testid="input-grade"
                {...register("grade")}
                className="mt-1.5"
                placeholder="e.g., Grade 1, Kindergarten"
              />
              {errors.grade && (
                <p className="text-sm text-destructive mt-1">{errors.grade.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="message" className="text-sm font-medium">
                Message <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="message"
                data-testid="input-message"
                {...register("message")}
                className="mt-1.5 min-h-[120px]"
                placeholder="Tell us about your inquiry or any questions you have..."
              />
              {errors.message && (
                <p className="text-sm text-destructive mt-1">{errors.message.message}</p>
              )}
            </div>

            <div className="flex justify-center pt-4">
              <Button
                type="submit"
                data-testid="button-submit-inquiry"
                disabled={isSubmitting}
                size="lg"
                className="px-12 bg-primary hover:bg-primary/90 text-white font-semibold shadow-md"
              >
                {isSubmitting ? "Submitting..." : "Submit Inquiry"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
