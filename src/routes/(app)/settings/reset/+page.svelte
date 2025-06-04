<script lang="ts">
    import { i18n } from "$lib/data/i18n.svelte";
    import { resetSettings } from "$lib/data/settings.svelte";
    import Button from "$lib/components/Button.svelte";
    import Dialog from "$lib/components/Dialog.svelte";
    import { transitions } from "$lib/utils";

    let resetAlert = $state(false);
</script>

<div class="w-full py-2 flex flex-col space-y-6" in:transitions.pageIn out:transitions.pageOut>
    <div class="w-full flex justify-between items-center gap-x-6">
        <div>
            <h3 class="mb-1 font-semibold">{i18n.t("settings.resetSettings")}</h3>
            <p class="text-sm text-slate-500">{i18n.t("settings.resetSettingsDesc")}</p>
        </div>
        <Button class="w-32" onclick={() => resetAlert = true}>{i18n.t("settings.resetButton")}</Button>
    </div>
</div>
<Dialog bind:show={resetAlert} title={i18n.t("dialog.resetSettings")} onsubmit={resetSettings}>
    <p>{i18n.t("dialog.resetSettingsDesc")}</p>
</Dialog>