<script lang="ts">
    import { twMerge } from "tailwind-merge";
    import { page } from "$app/state";
    import { i18n } from "$lib/data/i18n.svelte";
    import PageLayout from "$lib/components/PageLayout.svelte";
    import LinkItem from "$lib/components/LinkItem.svelte";
    import { boxStyles } from "$lib/utils";

    let { children } = $props();

    let currentPage = $derived(page.url.pathname.replace(/\/account\/settings\//g, ""));
</script>

<PageLayout title={i18n.t("account.settings.title")} class="pr-8 flex gap-x-8">
    <div class={twMerge(boxStyles.pane, "w-56 h-full p-2 flex-col gap-y-1 rounded-2xl")}>
        <LinkItem href="/account/settings/info" icon="identification" selected={currentPage.startsWith("info")}>
            <p>{i18n.t("account.settings.info")}</p>
        </LinkItem>
        <LinkItem href="/account/settings/personalization" icon="brush" selected={currentPage.startsWith("personalization")}>
            <p>{i18n.t("account.settings.personalization")}</p>
        </LinkItem>
        <LinkItem href="/account/settings/security" icon="lock" selected={currentPage.startsWith("security")}>
            <p>{i18n.t("account.settings.security")}</p>
        </LinkItem>
        <LinkItem href="/account/settings/about" icon="about" selected={currentPage.startsWith("about")}>
            <p>{i18n.t("settings.about")}</p>
        </LinkItem>
    </div>
    <div class="grid flex-1 *:col-[1] *:row-[1]">
        {@render children()}
    </div>
</PageLayout>