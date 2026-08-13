// @lovable.dev/vite-tanstack-config already includes the app's core Vite plugins.
// Vercel needs Nitro as the server build target for TanStack Start.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { nitro } from "nitro/vite";

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// nitro/vite builds from this; vercel.json handles framework detection on Vercel.
export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    plugins: [nitro({ preset: "vercel" })],
  },
});
