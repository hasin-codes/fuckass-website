import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PublicLayout } from "@/components/PublicLayout";
import { fetchGallery, fetchSiteContent, c } from "@/lib/content";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — RB Textile Mills" },
      { name: "description", content: "Inside the mill: machinery, fabric, and craft." },
    ],
  }),
  component: GalleryPage,
});

function getYoutubeEmbed(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

function GalleryPage() {
  const { data: items, isLoading } = useQuery({ queryKey: ["gallery"], queryFn: fetchGallery });
  const { data: content } = useQuery({ queryKey: ["site_content"], queryFn: fetchSiteContent });
  const map = content ?? {};

  return (
    <PublicLayout>
      <section className="bg-ink text-background">
        <div className="container-x py-20 md:py-28">
          <div className="text-[10px] uppercase tracking-[0.3em] text-beige mb-4">
            {c(map, "gallery", "eyebrow", "Gallery")}
          </div>
          <h1 className="text-4xl md:text-6xl text-background max-w-3xl">
            {c(map, "gallery", "h1", "Inside the mill.")}
          </h1>
        </div>
      </section>
      <section className="bg-ink py-16">
        <div className="container-x">
          {isLoading && <p className="text-background/60 text-sm">Loading…</p>}
          {items && items.length === 0 && (
            <p className="text-background/60 text-sm uppercase tracking-[0.18em]">
              {c(map, "gallery", "empty", "No gallery items yet. Add them from the admin portal.")}
            </p>
          )}
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
            {(items ?? []).map((it) => {
              const yt = it.type === "video" ? getYoutubeEmbed(it.url) : null;
              return (
                <figure key={it.id} className="mb-4 break-inside-avoid bg-background/5">
                  {it.type === "image" ? (
                    <img src={it.url} alt={it.caption ?? ""} className="w-full" loading="lazy" />
                  ) : yt ? (
                    <div className="aspect-video">
                      <iframe
                        src={yt}
                        title={it.caption ?? "Video"}
                        className="w-full h-full"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <video src={it.url} controls className="w-full" />
                  )}
                  {it.caption && (
                    <figcaption className="text-[11px] uppercase tracking-[0.18em] text-background/60 p-3">
                      {it.caption}
                    </figcaption>
                  )}
                </figure>
              );
            })}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
