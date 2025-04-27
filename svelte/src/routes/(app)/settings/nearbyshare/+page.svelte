<script lang="ts">
    import { i18n } from "$lib/data/i18n.svelte";
    import { settings } from "$lib/data/settings.svelte";
    import Switch from "$lib/components/Switch.svelte";
    import Dialog from "$lib/components/Dialog.svelte";
    import { transitions } from "$lib/utils.svelte";

    let nearbyShare = $state(settings.nearbyShare), nearbyShareAlert = $state(false);

    $effect(() => {
        if (settings.nearbyShare === nearbyShare)
            return;

        if (nearbyShare)
            nearbyShareAlert = true;
        else
            settings.nearbyShare = nearbyShare;
    });
</script>

<div class="w-full py-2 flex flex-col space-y-6" in:transitions.pageIn out:transitions.pageOut>
    <div class="w-full flex justify-between items-center gap-x-6">
        <div>
            <h3 class="mb-1 font-semibold">{i18n.t("settings.nearbyShareEnabled")}</h3>
            <p class="text-sm text-slate-500">{i18n.t("settings.nearbyShareEnabledDesc")}</p>
        </div>
        <Switch bind:value={nearbyShare} />
    </div>
</div>
<Dialog bind:show={nearbyShareAlert} title={i18n.t("dialog.nearbyShare")} onsubmit={() => settings.nearbyShare = true} oncancel={() => nearbyShare = false}>
    <p>{i18n.t("dialog.nearbyShareDesc.0")}</p>
    <p>{i18n.t("dialog.nearbyShareDesc.1")}</p>
    <p>{i18n.t("dialog.nearbyShareDesc.2")}</p>
</Dialog>