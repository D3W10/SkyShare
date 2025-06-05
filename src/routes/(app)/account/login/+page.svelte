<script lang="ts">
    import { twMerge } from "tailwind-merge";
    import { i18n } from "$lib/data/i18n.svelte";
    import { info } from "$lib/data/info.svelte";
    import PageLayout from "$lib/components/PageLayout.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import Button from "$lib/components/Button.svelte";
    import Link from "$lib/components/Link.svelte";
    import Dialog from "$lib/components/Dialog.svelte";
    import { boxStyles } from "$lib/utils";

    let historyDialog = $state(false), syncDialog = $state(false), identificationDialog = $state(false);
</script>

<PageLayout title={i18n.t("login.0.title")} class="px-14 flex gap-x-6">
    <div class="pl-16 flex flex-col justify-center flex-1 gap-y-8">
        <div class="flex items-center gap-x-4">
            <img class="h-10" src="/logo.svg" alt="{info.name} Logo" />
            <div>
                <h3 class="text-2xl font-semibold">{info.name}</h3>
                <h4 class="-mt-0.5 text-sm font-semibold">Account</h4>
            </div>
        </div>
        <div class="space-y-2.5">
            <Button type="invisible" class={twMerge(boxStyles.pane, "w-fit pl-3 pr-4 py-1.5 gap-x-2 text-sm font-medium rounded-full cursor-pointer")} onclick={() => historyDialog = true}>
                <Icon name="history" class="size-5" />
                <p>{i18n.t("login.0.history")}</p>
            </Button>
            <Button type="invisible" class={twMerge(boxStyles.pane, "w-fit pl-3 pr-4 py-1.5 gap-x-2 text-sm font-medium rounded-full cursor-pointer")} onclick={() => syncDialog = true}>
                <Icon name="sync" class="size-5" />
                <p>{i18n.t("login.0.sync")}</p>
            </Button>
            <Button type="invisible" class={twMerge(boxStyles.pane, "w-fit pl-3 pr-4 py-1.5 gap-x-2 text-sm font-medium rounded-full cursor-pointer")} onclick={() => identificationDialog = true}>
                <Icon name="identification" class="size-5" />
                <p>{i18n.t("login.0.identification")}</p>
            </Button>
        </div>
    </div>
    <div class="flex flex-col justify-center items-center flex-1">
        <div class="w-40 space-y-3">
            <Link type="button">{i18n.t("login.0.login")}</Link>
            <Link type="secondary">{i18n.t("login.0.signup")}</Link>
        </div>
    </div>
</PageLayout>
<Dialog bind:show={historyDialog} title={i18n.t("login.0.history")} cancelable={false}>
    <p>{i18n.t("login.0.historyDesc")}</p>
</Dialog>
<Dialog bind:show={syncDialog} title={i18n.t("login.0.sync")} cancelable={false}>
    <p>{i18n.t("login.0.syncDesc")}</p>
</Dialog>
<Dialog bind:show={identificationDialog} title={i18n.t("login.0.identification")} cancelable={false}>
    <p>{i18n.t("login.0.identificationDesc")}</p>
</Dialog>