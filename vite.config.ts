import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";

export default defineConfig({
  // Pin the URL so `npm run dev` always binds 5173 on IPv4+IPv6.
  // `strictPort` fails instead of silently moving to 5174 when another
  // Vite is already running (that mismatch is what made localhost hang).
  server: {
    host: true,
    port: 5173,
    strictPort: true,
  },
  plugins: [
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    tanstackStart({
      srcDirectory: "src",
      start: { entry: "start.ts" },
      server: { entry: "server.ts" },
      importProtection: {
        behavior: "error",
        client: {
          files: ["**/server/**"],
          specifiers: ["server-only"],
        },
      },
    }),
    // Vercel preset in `vite dev` enables env-runner's vercel-dev proxy
    // (chunked keep-alive, `server: Vercel`). Browsers then sit on the
    // document request. Keep the Vercel output only for `vercel build`.
    nitro({ preset: process.env.VERCEL ? "vercel" : "node" }),
    viteReact(),
  ],
});
