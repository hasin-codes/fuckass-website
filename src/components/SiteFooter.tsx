import { useQuery } from "@tanstack/react-query";
import { fetchSiteContent, c } from "@/lib/content";

export function SiteFooter() {
  const { data } = useQuery({ queryKey: ["site_content"], queryFn: fetchSiteContent });
  const map = data ?? {};

  return (
    <footer className="bg-ink text-background">
      <div className="container-x py-16 grid gap-10 md:grid-cols-3 border-t border-background/15">
        <div>
          <div className="font-black tracking-[0.15em] text-lg mb-3">
            {c(map, "brand", "name", "RB TEXTILE MILLS")}
          </div>
          <p className="text-xs text-background/60 max-w-xs leading-relaxed">
            {c(
              map,
              "brand",
              "tagline",
              "Vertically integrated textile manufacturing for global apparel programs.",
            )}
          </p>
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-background/50 mb-3">
            {c(map, "footer", "headquarters_label", "Headquarters")}
          </div>
          <p className="text-sm text-background/85 leading-relaxed">
            {c(map, "contact_info", "address", "Narayanganj, Bangladesh")}
          </p>
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-background/50 mb-3">
            {c(map, "footer", "contact_label", "Contact")}
          </div>
          <p className="text-sm text-background/85">{c(map, "contact_info", "phone", "")}</p>
          <p className="text-sm text-background/85">{c(map, "contact_info", "email", "")}</p>
        </div>
      </div>
      <div className="container-x py-6 border-t border-background/15 flex flex-col md:flex-row justify-between gap-2 text-[11px] uppercase tracking-[0.18em] text-background/40">
        <span>
          {c(map, "footer", "copyright", `© ${new Date().getFullYear()} RB Textile Mills Ltd.`)}
        </span>
        <span>{c(map, "footer", "region", "Bangladesh")}</span>
      </div>
    </footer>
  );
}
