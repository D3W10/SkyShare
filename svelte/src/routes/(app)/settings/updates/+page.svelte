<script lang="ts">
    import { fade, slide } from "svelte/transition";
    import { twMerge } from "tailwind-merge";
    import { i18n } from "$lib/data/i18n.svelte";
    import { app } from "$lib/data/app.svelte";
    import { info } from "$lib/data/info.svelte";
    import { settings } from "$lib/data/settings.svelte";
    import Button from "$lib/components/Button.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import Switch from "$lib/components/Switch.svelte";
    import ProgressBar from "$lib/components/ProgressBar.svelte";
    import Dialog from "$lib/components/Dialog.svelte";
    import { boxStyles, transitions } from "$lib/utils.svelte";

    let updating = $state(0), progress = $state(0);
    let updatedAlert = $state(false), data = $state({ version: "", date: "" });
    let betaUpdates = $state(settings.betaUpdates), betaAlert = $state(false);

    function checkForUpdates() {
        updating = 1;

        app.checkForUpdates((available, { version, date }) => {
            updating = available ? 2 : 0;

            if (!available)
                updatedAlert = true;
            else
                data = { version, date };
        }, p => progress = p);
    }

    $effect(() => {
        if (settings.betaUpdates === betaUpdates)
            return;

        if (betaUpdates)
            betaAlert = true;
        else
            settings.betaUpdates = betaUpdates;
    });
</script>

<div class="w-full py-2 flex flex-col space-y-6" in:transitions.pageIn out:transitions.pageOut>
    {#if updating === 2}
        <div class={twMerge(boxStyles.box, "p-5")} transition:slide={{ duration: 800 }}>
            <div class="size-full flex items-center gap-x-4" transition:fade={{ duration: 400, delay: 700 }}>
                <Icon name="updates" class="size-10 text-slate-800 dark:text-slate-300" />
                <div class="w-full flex flex-col justify-center gap-y-2">
                    <h3 class="font-semibold">{info.name} {data.version}</h3>
                    <ProgressBar class="mb-1" value={progress} />
                </div>
            </div>
        </div>
    {/if}
    <div class="w-full flex justify-between items-center gap-x-6">
        <div>
            <h3 class="mb-1 font-semibold">{i18n.t("settings.checkForUpdates")}</h3>
            <p class="text-sm text-slate-500">{i18n.t("settings.checkForUpdatesDesc")}</p>
        </div>
        <Button class="w-32" disabled={updating !== 0} onclick={checkForUpdates}>{i18n.t("settings.check")}</Button>
    </div>
    <div class="w-full flex justify-between items-center gap-x-6">
        <div>
            <h3 class="mb-1 font-semibold">{i18n.t("settings.autoUpdate")}</h3>
            <p class="text-sm text-slate-500">{i18n.t("settings.autoUpdateDesc")}</p>
        </div>
        <Switch bind:value={settings.autoUpdate} />
    </div>
    <div class="w-full flex justify-between items-center gap-x-6">
        <div>
            <h3 class="mb-1 font-semibold">{i18n.t("settings.betaUpdates")}</h3>
            <p class="text-sm text-slate-500">{i18n.t("settings.betaUpdatesDesc")}</p>
        </div>
        <Switch bind:value={betaUpdates} />
    </div>
</div>
<Dialog bind:show={updatedAlert} title={i18n.t("modal.noUpdates")} cancelable={false}>
    <p>{i18n.t("modal.noUpdatesDesc")}</p>
</Dialog>
<Dialog bind:show={betaAlert} title={i18n.t("modal.betaUpdates")} onsubmit={() => settings.betaUpdates = true} oncancel={() => betaUpdates = false}>
    <p>{i18n.t("modal.betaUpdatesDesc.0")}</p>
    <p>{i18n.t("modal.betaUpdatesDesc.1")}</p>
</Dialog>