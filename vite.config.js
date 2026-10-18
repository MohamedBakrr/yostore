import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Vite + Vitest share this configuration.
// Vitest specifics live under `test` (jsdom environment, shared setup file).
export default defineConfig({
    plugins: [react(), tailwindcss()],
    test: {
        environment: "jsdom",
        setupFiles: ["./src/tests/setup.js"],
        css: false,
        include: ["src/**/*.test.{js,jsx}"],
        restoreMocks: true,
    },
});
