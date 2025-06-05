<script lang="ts">
    import { fade } from "svelte/transition";
    import { page } from "$app/state";
    import { base } from "$app/paths";
    import { i18n } from "$lib/data/i18n.svelte";
    import { startup } from "$lib/data/startup.svelte";
    import { cleanAll } from "$lib/data/cleanup.svelte";
    import Icon from "./Icon.svelte";
    import LinkItem from "./LinkItem.svelte";
    import { settingsPath } from "$lib/utils";
    import type { IconT } from "$lib/models/IconT.type";

    interface Props {
        collapsed?: boolean;
    }

    let {
        collapsed = false
    }: Props = $props();

    const accountSelected = $derived(page.url.pathname.startsWith(base + "/account"));
</script>

<aside class="{!collapsed ? "w-64" : "w-20"} p-4 flex flex-col gap-y-1 {!startup.s ? "transition-[width] duration-400" : ""}">
    <LinkItem class="{!collapsed ? "px-2" : ""} transition-[color_200ms,_padding_400ms]" href="/account/login" selected={accountSelected} onclick={cleanAll}>
        <Icon class="{!collapsed ? "w-10 min-w-10" : "w-5.5 min-w-5.5"} {!accountSelected ? "text-slate-500 dark:text-slate-600 group-hover:text-slate-700 dark:group-hover:text-slate-400" : "text-slate-800 dark:text-slate-300"} transition-all! duration-400" name="account" />
        {#if !collapsed}
            <p in:fade={{ duration: 100, delay: 100 }} out:fade={{ duration: 100 }}>{i18n.t("sidebar.login")}</p>
        {/if}
    </LinkItem>
    <hr class="h-0.5 mx-0.5 my-2 bg-slate-950/10 dark:bg-slate-50/10 border-0 rounded-full" />
    {@render item(i18n.t("sidebar.home"), "home", "/")}
    {@render item(i18n.t("sidebar.send"), "send", "/send")}
    {@render item(i18n.t("sidebar.receive"), "receive", "/receive")}
    {@render item(i18n.t("sidebar.settings"), "settings", settingsPath)}
</aside>

{#snippet item(name: string, icon: IconT, url: string)}
    <LinkItem class={collapsed ? "h-10 px-3" : ""} href={url} {icon} selected={url !== "/" && page.url.pathname.replace(base, "").startsWith(/\/\w+/g.exec(url)![0]) || page.url.pathname.replace(base, "").replace("index.html", "") === url} onclick={cleanAll}>
        {#if !collapsed}
            <p in:fade={{ duration: 100, delay: 100 }} out:fade={{ duration: 100 }}>{name}</p>
        {/if}
    </LinkItem>
{/snippet}