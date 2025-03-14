<script lang="ts">
    import "../app.css";
    import { app } from "$lib/data/app.svelte";
    import { changeLanguage } from "$lib/data/i18n.svelte";
    import { settings } from "$lib/data/settings.svelte";
    import type { StoreSettings } from "$electron/lib/interfaces/Store.interface";

    let oldSettings: StoreSettings;

    let { children } = $props();

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
    });
</script>

{@render children()}