import adapter from "@sveltejs/adapter-static";

/** @type {import("@sveltejs/kit").Config} */
const config = {
    kit: {
        adapter: adapter({
            pages: "../dist/www",
            assets: "../dist/www"
        }),
        alias: {
            "$": ".",
            "$/*": "./*",
            "$electron": "../electron",
            "$electron/*": "../electron/*"
        }
    },
    compilerOptions: {
        runes: true
    }
};

export default config;