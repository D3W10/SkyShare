<script lang="ts">
    import { fade } from "svelte/transition";
    import { page } from "$app/state";
    import { i18n } from "$lib/data/i18n.svelte";
    import LinkItem from "./LinkItem.svelte";
    import { settingsPath } from "$lib/utils.svelte";
    import type { IconT } from "$lib/models/IconT.type";

    interface Props {
        expanded?: boolean;
    }

    let {
        expanded = true
    }: Props = $props();
</script>

<aside class="{expanded ? "w-64 min-w-64" : "w-20 min-w-20"} p-4 flex flex-col gap-y-1 transition-[width,_min-width] duration-400">
    {@render item(i18n.t("sidebar.home"), "home", "/")}
    {@render item(i18n.t("sidebar.send"), "send", "/send")}
    {@render item(i18n.t("sidebar.receive"), "receive", "/receive")}
    {@render item(i18n.t("sidebar.settings"), "settings", settingsPath)}
</aside>

{#snippet item(name: string, icon: IconT, url: string)}
    <LinkItem class={!expanded ? "h-10 px-3" : ""} href={url} {icon} selected={url !== "/" && page.url.pathname.startsWith(/\/\w+/g.exec(url)![0]) || page.url.pathname === url}>
        {#if expanded}
            <p in:fade={{ duration: 100, delay: 100 }} out:fade={{ duration: 100 }}>{name}</p>
        {/if}
    </LinkItem>
{/snippet}