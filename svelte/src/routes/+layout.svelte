<script lang="ts">
    import "../app.css";
    import { tick } from "svelte";
    import { app } from "$lib/data/app.svelte";
    import { changeLanguage } from "$lib/data/i18n.svelte";
    import { settings } from "$lib/data/settings.svelte";
    import type { StoreSettings } from "$electron/lib/interfaces/Store.interface";

    let { children } = $props();

    let instantChange = true, oldSettings: StoreSettings;

    $effect(() => {
        if (oldSettings) {
            for (const key of Object.keys(settings)) {
                if (settings[key as keyof StoreSettings] !== oldSettings[key as keyof StoreSettings])
                    app.setSetting(`settings.${key}`, settings[key as keyof StoreSettings]);
            }
        }

        oldSettings = { ...settings };
    });

    $effect(() => {
        changeLanguage(settings.language);
        setTheme(settings.theme, instantChange);
        instantChange = false;
    });

    const setTheme = async (theme: string, instant = false) => {
        if (document.documentElement.getAttribute("data-theme") === theme) return;

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || instant) {
            document.documentElement.setAttribute("data-theme", theme);
            return;
        }

        await document.startViewTransition(async () => {
            await tick();
            document.documentElement.setAttribute("data-theme", theme);
        }).ready;

        const x = window.innerWidth / 2;
        const y = window.innerHeight / 2;
        const maxRadius = Math.hypot(x, y);

        document.documentElement.animate(
            { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${maxRadius}px at ${x}px ${y}px)`] },
            { duration: 800, easing: "ease-in-out", pseudoElement: "::view-transition-new(root)" }
        );
    };
</script>

{@render children()}