<script lang="ts">
    import { i18n } from "$lib/data/i18n.svelte";
    import { settings } from "$lib/data/settings.svelte";
    import ComboBox, { type ComboBoxItem } from "$lib/components/ComboBox.svelte";
    import { transitions } from "$lib/utils";

    const themeList: ComboBoxItem[] = [
        { text: i18n.t("settings.themeLight"), value: "light" },
        { text: i18n.t("settings.themeDark"), value: "dark" }
    ];

    const langsList: ComboBoxItem[] = [
        { text: "English", value: "en-US" },
        { text: "Português", value: "pt-PT" }
    ];
</script>

<div class="w-full py-2 flex flex-col space-y-6" in:transitions.pageIn out:transitions.pageOut>
    <div class="w-full flex justify-between items-center gap-x-6">
        <div>
            <h3 class="mb-1 font-semibold">{i18n.t("settings.theme")}</h3>
            <p class="text-sm text-slate-500">{i18n.t("settings.themeDesc")}</p>
        </div>
        <ComboBox class="w-32" items={themeList} align="right" bind:value={settings.theme} />
    </div>
    <div class="w-full flex justify-between items-center gap-x-6">
        <div>
            <h3 class="mb-1 font-semibold">{i18n.t("settings.language")}</h3>
            <p class="text-sm text-slate-500">{i18n.t("settings.languageDesc")}</p>
        </div>
        <ComboBox class="w-32" items={langsList} align="right" bind:value={settings.language} />
    </div>
</div>