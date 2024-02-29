import adapter from "@sveltejs/adapter-static";
import preprocess from "svelte-preprocess";

/** @type {import("@sveltejs/kit").Config} */
const config = {
    preprocess: preprocess(),
    kit: {
        adapter: adapter({
            pages: "../dist/www",
            assets: "../dist/www"
        }),
        alias: {
            "$electron": "../electron",
            "$electron/*": "../electron/*"
        }
    }
};

export default config;