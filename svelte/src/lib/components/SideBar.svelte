<script lang="ts">
    import { fade } from "svelte/transition";
    import { page } from "$app/state";
    import { i18n } from "$lib/data/i18n.svelte";
    import Icon from "./Icon.svelte";
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

<aside class="{expanded ? "w-64 min-w-64" : "w-20 min-w-20"} p-4 flex flex-col gap-y-1 transition-[width,min-width] duration-400">
    <div class="px-1 py-2 flex items-center gap-x-2 group *:transition-colors *:duration-200">
        <Icon class="size-10 text-slate-500 dark:text-slate-600 group-hover:text-slate-700 dark:group-hover:text-slate-400" name="account" />
        <p class="text-slate-600 dark:text-slate-500 group-hover:text-slate-800 dark:group-hover:text-slate-300 font-medium">{i18n.t("sidebar.login")}</p>
    </div>
    <hr class="h-0.5 mx-0.5 my-2 bg-slate-100 dark:bg-slate-900 border-0 rounded-full" />
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