<script lang="ts">
    import { fade } from "svelte/transition";
    import { i18n } from "$lib/stores/i18nStore";
    import { info } from "$lib/stores/infoStore";
    import { transition } from "$lib/stores/transitionStore";
    import { settings } from "$lib/stores/settingsStore";
    import ComboBox from "$lib/components/ComboBox.svelte";

    let langs = [
        {
            id: "en",
            name: "English"
        },
        {
            id: "pt",
            name: "Português"
        }
    ];
</script>

<div class="w-full h-full p-6 flex flex-col space-y-4" in:fade={$transition.pageIn} out:fade={$transition.pageOut}>
    <h1 class="w-full text-xl font-semibold">{$i18n.t("settings.title")}</h1>
    <div class="h-full p-5 flex flex-col space-y-10 overflow-y-scroll">
        <div>
            <h2 class="mb-2 text-md font-semibold">{$i18n.t("settings.appearance")}</h2>
            <hr class="h-[3px] mb-6 bg-shade/10 border-0 rounded-full" />
            <div class="space-y-6">
                <div class="flex justify-between items-center">
                    <div>
                        <p>{$i18n.t("settings.theme")}</p>
                        <p class="mt-0.5 text-foreground/70 text-sm font-normal">{$i18n.t("settings.themeDesc")}</p>
                    </div>
                    <ComboBox className="w-32" items={[$i18n.t("settings.themeLight"), $i18n.t("settings.themeDark")]} selected={$settings.theme} on:change={(e) => settings.update("theme", e.detail.selected)} />
                </div>
                <div class="flex justify-between items-center">
                    <div>
                        <p>{$i18n.t("settings.language")}</p>
                        <p class="mt-0.5 text-foreground/70 text-sm font-normal">{$i18n.t("settings.languageDesc")}</p>
                    </div>
                    <ComboBox className="w-32" items={langs.map((value) => value.name)} selected={langs.findIndex((value) => value.id == $settings.language)} on:change={(e) => { settings.update("language", langs[e.detail.selected].id); $i18n.changeLanguage(langs[e.detail.selected].id)}} />
                </div>
            </div>
        </div>
        <div>
            <h2 class="mb-2 text-md font-semibold">{$i18n.t("settings.about")}</h2>
            <hr class="h-[3px] mb-6 bg-shade/10 border-0 rounded-full" />
            <div class="mb-10">
                <div class="flex items-center space-x-4">
                    <img src="./logo.png" alt="Logo" class="w-16" />
                    <div class="flex flex-col">
                        <p>{$info.name}</p>
                        <p class="text-foreground/70 text-sm">{$i18n.t("settings.version", { version: $info.version })}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>