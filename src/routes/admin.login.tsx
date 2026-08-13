import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    navigate({ to: "/admin" });
  }

  return (
    <div className="min-h-screen bg-ink text-background flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Link to="/" className="text-[10px] uppercase tracking-[0.3em] text-beige">
          ← Back to site
        </Link>
        <h1 className="mt-6 text-3xl text-background">Admin Portal</h1>
        <p className="text-xs uppercase tracking-[0.2em] text-background/50 mt-2">
          RB Textile Mills
        </p>
        <form onSubmit={onSubmit} className="mt-10 space-y-5">
          <div>
            <label className="block text-[10px] uppercase tracking-[0.25em] text-background/60 mb-2">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border border-background/30 px-4 py-3 text-sm text-background focus:outline-none focus:border-beige"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-[0.25em] text-background/60 mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border border-background/30 px-4 py-3 text-sm text-background focus:outline-none focus:border-beige"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-beige text-ink py-4 text-xs font-bold uppercase tracking-[0.22em] hover:bg-background disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
        <p className="mt-8 text-[11px] text-background/40 leading-relaxed">
          No public registration. Create the admin account in your Lovable Cloud dashboard under
          Users.
        </p>
      </div>
    </div>
  );
}
