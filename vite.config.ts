import { defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    server: {
        fs: {
            allow: ["."]
        }
    },
    plugins: [
        sveltekit(),
        tailwindcss()
    ]
});