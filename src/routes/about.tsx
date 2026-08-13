import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PublicLayout } from "@/components/PublicLayout";
import { fetchSiteContent, c } from "@/lib/content";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — RB Textile Mills" },
      {
        name: "description",
        content: "Three decades of disciplined textile manufacturing from Narayanganj, Bangladesh.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { data } = useQuery({ queryKey: ["site_content"], queryFn: fetchSiteContent });
  const map = data ?? {};

  return (
    <PublicLayout>
      <section className="container-x py-20 md:py-32">
        <div className="text-[10px] uppercase tracking-[0.3em] text-ink/50 mb-4">About</div>
        <h1 className="text-4xl md:text-6xl max-w-4xl">
          A vertically integrated textile mill, since {c(map, "about", "year_established", "1998")}.
        </h1>
        <div className="mt-16 grid md:grid-cols-2 gap-12 border-t border-ink pt-12">
          <p className="text-base md:text-lg leading-relaxed text-ink/80">
            {c(map, "about", "body", "")}
          </p>
          <div className="grid grid-cols-2 gap-px bg-ink/15 border border-ink/15">
            {[
              { k: "stat_looms", label: "Looms" },
              { k: "stat_capacity", label: "Capacity" },
              { k: "stat_workforce", label: "Workforce" },
              { k: "year_established", label: "Founded" },
            ].map((s) => (
              <div key={s.k} className="bg-background p-8">
                <div className="text-3xl font-black">{c(map, "about", s.k, "—")}</div>
                <div className="mt-2 text-[10px] uppercase tracking-[0.25em] text-ink/60">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
