import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PublicLayout } from "@/components/PublicLayout";
import { fetchSiteContent, c } from "@/lib/content";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — RB Textile Mills" },
      { name: "description", content: "Request a quote or technical information." },
    ],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  company: z.string().trim().max(150).optional(),
  email: z.string().trim().email("Valid email required").max(255),
  phone: z.string().trim().max(40).optional(),
  message: z.string().trim().min(5, "Tell us a bit more").max(2000),
});

function ContactPage() {
  const { data } = useQuery({ queryKey: ["site_content"], queryFn: fetchSiteContent });
  const map = data ?? {};
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      name: fd.get("name"),
      company: fd.get("company") || undefined,
      email: fd.get("email"),
      phone: fd.get("phone") || undefined,
      message: fd.get("message"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("contact_submissions").insert(parsed.data);
    setSubmitting(false);
    if (error) {
      toast.error("Could not send. Please try again.");
      return;
    }
    toast.success("Message received. We'll be in touch.");
    (e.target as HTMLFormElement).reset();
  }

  const fields: {
    name: string;
    labelKey: string;
    fallback: string;
    type?: string;
    required?: boolean;
  }[] = [
    { name: "name", labelKey: "name_label", fallback: "Name", required: true },
    { name: "company", labelKey: "company_label", fallback: "Company" },
    {
      name: "email",
      labelKey: "email_field_label",
      fallback: "Email",
      type: "email",
      required: true,
    },
    { name: "phone", labelKey: "phone_field_label", fallback: "Phone" },
  ];

  return (
    <PublicLayout>
      <section className="bg-beige">
        <div className="container-x py-20 md:py-28">
          <div className="text-[10px] uppercase tracking-[0.3em] text-ink/60 mb-4">
            {c(map, "contact", "eyebrow", "Contact")}
          </div>
          <h1 className="text-4xl md:text-6xl max-w-3xl">
            {c(map, "contact", "h1", "Request a quote.")}
          </h1>
        </div>
      </section>
      <section className="container-x py-20 grid md:grid-cols-[1fr_380px] gap-16">
        <form onSubmit={onSubmit} className="space-y-5">
          {fields.map((f) => (
            <div key={f.name}>
              <label className="block text-[10px] uppercase tracking-[0.25em] text-ink/60 mb-2">
                {c(map, "contact", f.labelKey, f.fallback)}
                {f.required && " *"}
              </label>
              <input
                name={f.name}
                type={f.type ?? "text"}
                required={f.required}
                className="w-full border border-ink/30 bg-background px-4 py-3 text-sm focus:outline-none focus:border-ink"
              />
            </div>
          ))}
          <div>
            <label className="block text-[10px] uppercase tracking-[0.25em] text-ink/60 mb-2">
              {c(map, "contact", "message_label", "Message")} *
            </label>
            <textarea
              name="message"
              required
              rows={6}
              className="w-full border border-ink/30 bg-background px-4 py-3 text-sm focus:outline-none focus:border-ink resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="bg-ink text-background px-10 py-4 text-xs font-bold uppercase tracking-[0.22em] hover:bg-ink/85 disabled:opacity-60"
          >
            {submitting
              ? c(map, "contact", "submitting_label", "Sending…")
              : c(map, "contact", "submit_label", "Send Inquiry")}
          </button>
        </form>
        <aside className="border-l border-ink/15 pl-8 space-y-8">
          {[
            {
              labelKey: "address_label",
              fallback: "Address",
              value: c(map, "contact_info", "address", ""),
            },
            {
              labelKey: "phone_label",
              fallback: "Phone",
              value: c(map, "contact_info", "phone", ""),
            },
            {
              labelKey: "email_label",
              fallback: "Email",
              value: c(map, "contact_info", "email", ""),
            },
          ].map((b) => (
            <div key={b.labelKey}>
              <div className="text-[10px] uppercase tracking-[0.25em] text-ink/50 mb-2">
                {c(map, "contact", b.labelKey, b.fallback)}
              </div>
              <p className="text-sm leading-relaxed">{b.value}</p>
            </div>
          ))}
        </aside>
      </section>
    </PublicLayout>
  );
}
