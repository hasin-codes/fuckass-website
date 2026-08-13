import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PublicLayout } from "@/components/PublicLayout";
import { fetchProducts, fetchSiteContent, c } from "@/lib/content";
import yarn from "@/assets/product-yarn.jpg";
import shirting from "@/assets/product-shirting.jpg";
import denim from "@/assets/product-denim.jpg";
import blend from "@/assets/product-blend.jpg";

const fallbackImgs = [yarn, shirting, denim, blend];

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Products & Capabilities — RB Textile Mills" },
      {
        name: "description",
        content: "Yarns, woven fabrics, denim, and blends manufactured at scale.",
      },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });
  const { data: content } = useQuery({ queryKey: ["site_content"], queryFn: fetchSiteContent });
  const map = content ?? {};

  return (
    <PublicLayout>
      <section className="container-x py-20 md:py-32">
        <div className="text-[10px] uppercase tracking-[0.3em] text-ink/50 mb-4">
          {c(map, "products", "eyebrow", "Capabilities")}
        </div>
        <h1 className="text-4xl md:text-6xl max-w-3xl">
          {c(map, "products", "h1", "Engineered for global apparel programs.")}
        </h1>
        <div className="mt-16 grid gap-px bg-ink/15 md:grid-cols-2 lg:grid-cols-3 border border-ink/15">
          {isLoading &&
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-background p-6">
                <div className="aspect-[4/5] bg-muted animate-pulse" />
                <div className="h-5 mt-4 bg-muted animate-pulse w-1/2" />
              </div>
            ))}
          {(products ?? []).map((p, i) => (
            <article key={p.id} className="bg-background p-6 flex flex-col">
              <div className="aspect-[4/5] bg-muted overflow-hidden mb-5">
                <img
                  src={p.image_url || fallbackImgs[i % 4]}
                  alt={p.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
              </div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-ink/50">
                0{(i + 1).toString().padStart(2, "0")}
              </div>
              <h3 className="text-xl mt-1">{p.name}</h3>
              <p className="text-sm text-ink/70 mt-3 leading-relaxed">{p.description}</p>
            </article>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
