/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Относительный base — чтобы собранная сттика работала на GitHub Pages
  // (https://<user>.github.io/<repo>/) без хардкода имени репо, и переживало переименование.
  base: "./",
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
});
