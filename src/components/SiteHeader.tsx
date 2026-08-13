import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Menu, X } from "lucide-react";
import { fetchSiteContent, c } from "@/lib/content";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { data } = useQuery({ queryKey: ["site_content"], queryFn: fetchSiteContent });
  const map = data ?? {};

  const links = [
    { to: "/", label: c(map, "nav", "home", "Home") },
    { to: "/about", label: c(map, "nav", "about", "About") },
    { to: "/products", label: c(map, "nav", "products", "Products") },
    { to: "/gallery", label: c(map, "nav", "gallery", "Gallery") },
    { to: "/contact", label: c(map, "nav", "contact", "Contact") },
  ] as const;

  return (
    <header className="sticky top-0 z-50 bg-ink text-background border-b border-background/15">
      <div className="container-x flex h-16 items-center justify-between">
        <Link to="/" className="font-black tracking-[0.15em] text-sm md:text-base">
          {c(map, "brand", "name", "RB TEXTILE MILLS")}
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-xs font-semibold uppercase tracking-[0.18em] transition-opacity ${
                path === l.to ? "text-beige" : "text-background/80 hover:text-background"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <button
          className="md:hidden p-2"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {open && (
        <nav className="md:hidden border-t border-background/15 container-x py-4 flex flex-col gap-4">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="text-sm font-semibold uppercase tracking-[0.18em]"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
