<script lang="ts">
    import { twMerge } from "tailwind-merge";
    import { page } from "$app/state";
    import { i18n } from "$lib/data/i18n.svelte";
    import PageLayout from "$lib/components/PageLayout.svelte";
    import LinkItem from "$lib/components/LinkItem.svelte";
    import { boxStyles } from "$lib/utils.svelte";

    let { children } = $props();

    let currentPage = $derived(page.url.pathname.replace(/\/settings\//g, ""));
</script>

<PageLayout title={i18n.t("settings.title")} class="mr-8 flex gap-x-8">
    <div class={twMerge(boxStyles.pane, "w-56 min-w-56 h-full p-2 flex-col gap-y-1 rounded-2xl")}>
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