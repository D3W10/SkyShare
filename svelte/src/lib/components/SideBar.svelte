<script lang="ts">
    import { fade } from "svelte/transition";
    import { page } from "$app/state";
    import { i18n } from "$lib/data/i18n.svelte";
    import Icon from "./Icon.svelte";
    import type { IconT } from "$lib/models/IconT.type";

    interface Props {
        expanded?: boolean;
    }

    let {
        expanded = true
    }: Props = $props();

    const styles = {
        idle: "text-slate-600 hover:text-foreground [--icon-color:var(--color-slate-500)] hover:[--icon-color:var(--color-foreground)] transition-colors duration-200",
        selected: "bg-white ring-1 ring-slate-400/10 dark:ring-slate-400/10 shadow-sm before:absolute before:inset-0 before:rounded-xl before:border-b-3 before:border-slate-100"
    }
</script>

<aside class="{expanded ? "w-64 min-w-64" : "w-20 min-w-20"} p-4 flex flex-col gap-y-1 transition-[width,_min-width] duration-400">
    {@render item(i18n.t("sidebar.home"), "home", "/")}
    {@render item(i18n.t("sidebar.send"), "send", "/send")}
    {@render item(i18n.t("sidebar.receive"), "receive", "/receive")}
    {@render item(i18n.t("sidebar.settings"), "settings", "/settings")}
</aside>

{#snippet item(name: string, icon: IconT, url: string)}
    <a href={url} class="{expanded ? "px-3 py-2" : "h-10 px-3"} flex items-center relative rounded-xl gap-x-3 overflow-hidden {page.url.pathname === url ? styles.selected : styles.idle}">
        <Icon name={icon} class="min-w-5.5 text-(--icon-color) transition-colors duration-200" />
        {#if expanded}
            <p class="font-medium" transition:fade={{ duration: 200 }}>{name}</p>
        {/if}
    </a>
{/snippet}