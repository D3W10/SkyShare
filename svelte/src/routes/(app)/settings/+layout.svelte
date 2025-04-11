<script lang="ts">
    import { page } from "$app/state";
    import { i18n } from "$lib/data/i18n.svelte";
    import PageLayout from "$lib/components/PageLayout.svelte";
    import LinkItem from "$lib/components/LinkItem.svelte";

    let { children } = $props();

    let currentPage = $derived(page.url.pathname.replace(/\/settings\//g, ""));
</script>

<PageLayout title="Settings" class="mr-8 flex gap-x-8">
    <div class="w-56 min-w-56 h-full p-2 flex flex-col gap-y-1 bg-slate-200 dark:bg-slate-950 rounded-2xl ring-1 ring-slate-400/25 dark:ring-white/10 shadow-sm">
        <LinkItem href="/settings/appearance" icon="appearance" selected={currentPage.startsWith("appearance")}>
            <p>{i18n.t("settings.appearance")}</p>
        </LinkItem>
        <LinkItem href="/settings/nearbyshare" icon="nearbyShare" selected={currentPage.startsWith("nearbyshare")}>
            <p>{i18n.t("settings.nearbyShare")}</p>
        </LinkItem>
        <LinkItem href="/settings/updates" icon="updates" selected={currentPage.startsWith("updates")}>
            <p>{i18n.t("settings.updates")}</p>
        </LinkItem>
        <LinkItem href="/settings/reset" icon="reset" selected={currentPage.startsWith("reset")}>
            <p>{i18n.t("settings.reset")}</p>
        </LinkItem>
        <LinkItem href="/settings/about" icon="about" selected={currentPage.startsWith("about")}>
            <p>{i18n.t("settings.about")}</p>
        </LinkItem>
    </div>
    <div class="w-full grid *:col-[1] *:row-[1]">
        {@render children()}
    </div>
</PageLayout>