import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PublicLayout } from "@/components/PublicLayout";
import { fetchSiteContent, fetchProducts, c } from "@/lib/content";
import { ArrowRight } from "lucide-react";
import heroImg from "@/assets/hero-mill.jpg";
import yarn from "@/assets/product-yarn.jpg";
import shirting from "@/assets/product-shirting.jpg";
import denim from "@/assets/product-denim.jpg";
import blend from "@/assets/product-blend.jpg";

const fallbackImgs = [yarn, shirting, denim, blend];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RB Textile Mills — Industrial Textile Manufacturing" },
      {
        name: "description",
        content:
          "Precision-spun yarns and woven fabrics from Bangladesh. Vertically integrated textile manufacturing for global apparel programs.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { data: content } = useQuery({ queryKey: ["site_content"], queryFn: fetchSiteContent });
  const { data: products } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const map = content ?? {};

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative bg-ink text-background overflow-hidden">
        <img
          src={heroImg}
          alt="RB Textile Mills factory floor"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/70" />
        <div className="relative container-x py-24 md:py-40 max-w-5xl">
          <div className="text-[10px] uppercase tracking-[0.32em] text-beige mb-6 fade-in-up">
            {c(
              map,
              "home",
              "hero_eyebrow",
              `Est. ${c(map, "about", "year_established", "1998")} — Narayanganj, Bangladesh`,
            )}
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-[0.95] fade-in-up">
            {c(map, "hero", "headline", "Engineered Textiles. Built in Bangladesh.")}
          </h1>
          <p className="mt-8 max-w-2xl text-base md:text-lg text-background/80 leading-relaxed fade-in-up">
            {c(map, "hero", "subheadline", "")}
          </p>
          <div className="mt-10 flex flex-wrap gap-4 fade-in-up">
            <Link
              to="/contact"
              className="inline-flex items-center gap-3 bg-beige text-ink px-8 py-4 text-xs font-bold uppercase tracking-[0.22em] hover:bg-background transition-colors"
            >
              {c(map, "hero", "cta_label", "Request a Quote")} <ArrowRight size={16} />
            </Link>
            <Link
              to="/products"
              className="inline-flex items-center gap-3 border border-background/40 text-background px-8 py-4 text-xs font-bold uppercase tracking-[0.22em] hover:bg-background hover:text-ink transition-colors"
            >
              {c(map, "home", "cta_secondary", "Capabilities")}
            </Link>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="bg-beige">
        <div className="container-x grid grid-cols-2 md:grid-cols-4 divide-x divide-ink/15 border-y border-ink/15">
          {[
            { k: "stat_looms", labelKey: "stat_looms_label", fallback: "Industrial Looms" },
            { k: "stat_capacity", labelKey: "stat_capacity_label", fallback: "Annual Capacity" },
            { k: "stat_workforce", labelKey: "stat_workforce_label", fallback: "Workforce" },
            { k: "year_established", labelKey: "stat_year_label", fallback: "Established" },
          ].map((s) => (
            <div key={s.k} className="py-10 px-6">
              <div className="text-3xl md:text-5xl font-black tracking-tight">
                {c(map, "about", s.k, "—")}
              </div>
              <div className="mt-3 text-[10px] uppercase tracking-[0.25em] text-ink/60">
                {c(map, "home", s.labelKey, s.fallback)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Capabilities preview */}
      <section className="container-x py-24 md:py-32">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 border-b border-ink pb-6">
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-ink/50 mb-3">
              {c(map, "home", "eyebrow_capabilities", "01 / Capabilities")}
            </div>
            <h2 className="text-3xl md:text-5xl">
              {c(map, "home", "section_capabilities", "Products & Manufacturing")}
            </h2>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold uppercase tracking-[0.22em] underline underline-offset-4"
          >
            {c(map, "home", "view_all", "View all →")}
          </Link>
        </div>
        <div className="grid gap-px bg-ink/10 md:grid-cols-2 lg:grid-cols-4">
          {(products ?? []).slice(0, 4).map((p, i) => (
            <article key={p.id} className="bg-background p-6 flex flex-col">
              <div className="aspect-[4/5] bg-muted mb-5 overflow-hidden">
                <img
                  src={p.image_url || fallbackImgs[i % 4]}
                  alt={p.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-ink/50">0{i + 1}</div>
              <h3 className="text-lg mt-1">{p.name}</h3>
              <p className="text-sm text-ink/70 mt-2 leading-relaxed">{p.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* About teaser */}
      <section className="bg-ink text-background">
        <div className="container-x py-24 md:py-32 grid md:grid-cols-2 gap-12 items-start">
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-beige mb-3">
              {c(map, "home", "eyebrow_company", "02 / Company")}
            </div>
            <h2 className="text-3xl md:text-5xl text-background">
              {c(map, "home", "section_company", "A vertically integrated textile mill.")}
            </h2>
          </div>
          <div>
            <p className="text-base text-background/80 leading-relaxed">
              {c(map, "about", "body", "")}
            </p>
            <Link
              to="/about"
              className="mt-8 inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-beige hover:text-background"
            >
              {c(map, "home", "about_cta", "About RB Textile")} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
