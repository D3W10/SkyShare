<script lang="ts">
    import { fade, scale } from "svelte/transition";
    import { page } from "$app/state";
    import { base } from "$app/paths";
    import { i18n } from "$lib/data/i18n.svelte";
    import { account } from "$lib/data/account.svelte";
    import { startup } from "$lib/data/startup.svelte";
    import { cleanAll } from "$lib/data/cleanup.svelte";
    import LinkItem from "./LinkItem.svelte";
    import ProfilePicture from "./ProfilePicture.svelte";
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
    <LinkItem class="p-0 grid transition-[color_200ms,_padding_400ms] *:col-[1] *:row-[1]" href={!account.loggedIn ? "/account/login" : "/account"} selected={accountSelected} onclick={cleanAll}>
        {#key account.loggedIn}
            <div class="py-2 {!collapsed ? "px-2" : ""} flex items-center gap-x-2">
                <div in:scale={{ duration: 300, delay: 300, start: 0.5 }} out:scale={{ duration: 300, start: 0.5 }}>
                    <ProfilePicture class="{!collapsed ? "size-9 m-1" : "w-5 min-w-5 mx-0.5"} {!accountSelected ? "group-hover:text-slate-700 dark:group-hover:text-slate-400" : "text-slate-800 dark:text-slate-300"} transition-[width_400ms,_margin_200ms]" />
                </div>
                {#if !collapsed}
                    <p in:fade|global={{ duration: 200, delay: 200 }} out:fade|global={{ duration: 200 }}>{!account.loggedIn ? i18n.t("app.login") : account.username}</p>
                {/if}
            </div>
        {/key}
    </LinkItem>
    <hr class="h-0.5 mx-0.5 my-2 bg-slate-950/10 dark:bg-slate-50/10 border-0 rounded-full" />
    {@render item(i18n.t("app.home"), "home", "/")}
    {@render item(i18n.t("app.send"), "send", "/send")}
    {@render item(i18n.t("app.receive"), "receive", "/receive")}
    {@render item(i18n.t("app.settings"), "settings", settingsPath)}
</aside>

{#snippet item(name: string, icon: IconT, url: string)}
    <LinkItem class={collapsed ? "h-10 px-3" : ""} href={url} {icon} selected={url !== "/" && page.url.pathname.replace(base, "").startsWith(/\/\w+/g.exec(url)![0]) || page.url.pathname.replace(base, "").replace("index.html", "") === url} onclick={cleanAll}>
        {#if !collapsed}
            <p in:fade={{ duration: 100, delay: 100 }} out:fade={{ duration: 100 }}>{name}</p>
        {/if}
    </LinkItem>
{/snippet}