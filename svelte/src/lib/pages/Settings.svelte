<script lang="ts">
    import { fade } from "svelte/transition";
    import { i18n } from "$lib/stores/i18nStore";
    import { info } from "$lib/stores/infoStore";
    import { transition } from "$lib/stores/transitionStore";
    import { settings } from "$lib/stores/settingsStore";
    import Columns from "$lib/components/layout/Columns.svelte";
    import Button from "$lib/components/Button.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import ComboBox from "$lib/components/ComboBox.svelte";
    import Input from "$lib/components/Input.svelte";
    import Modal from "$lib/components/Modal.svelte";

    type settingsPages = "appearance" | "updates" | "about";

    let currentPage: settingsPages = "appearance", betaAlert: boolean = false, versionClick: number = 0, versionClickTimeout: NodeJS.Timeout;
    let langs = [
        { id: "en", name: "English" },
        { id: "pt", name: "Português" }
    ];

    function onVersionClick() {
        versionClick++;

        clearTimeout(versionClickTimeout);
        versionClickTimeout = setTimeout(() => versionClick = 0, 400);

        if (versionClick == 3) {
            versionClick = 0;

            if (!document.body.hasAttribute("style"))
                document.body.style.transform = "rotateZ(180deg)";
            else
                document.body.removeAttribute("style");
        }
    }
</script>

<div class="w-full h-full p-6 flex flex-col space-y-4" in:fade={$transition.pageIn} out:fade={$transition.pageOut}>
    <h1 class="w-full text-xl font-semibold">{$i18n.t("settings.title")}</h1>
    <Columns className="!space-x-0">
        <div slot="left" class="!w-1/3 pr-5">
            <div class="w-full h-full p-1 bg-foreground/5 rounded-xl space-y-1">
                <Button type="invisible" className="w-full p-2 flex items-center {currentPage == "appearance" ? "text-primary" : ""} hover:bg-foreground/5 !rounded-lg space-x-1.5" on:click={() => currentPage = "appearance"}>
                    <Icon name="appearance" className="h-6" />
                    <p>{$i18n.t("settings.appearance")}</p>
                </Button>
                <Button type="invisible" className="w-full p-2 flex items-center {currentPage == "updates" ? "text-primary" : ""} hover:bg-foreground/5 !rounded-lg space-x-1.5" on:click={() => currentPage = "updates"}>
                    <Icon name="updates" className="h-6" />
                    <p>{$i18n.t("settings.updates")}</p>
                </Button>
                <Button type="invisible" className="w-full p-2 flex items-center {currentPage == "about" ? "text-primary" : ""} hover:bg-foreground/5 !rounded-lg space-x-1.5" on:click={() => currentPage = "about"}>
                    <Icon name="about" className="h-6" />
                    <p>{$i18n.t("settings.about")}</p>
                </Button>
            </div>
        </div>
        <div slot="right" class="!w-2/3 !ml-6 py-3.5 pl-5">
            {#if currentPage == "appearance"}
                <div class="space-y-6" in:fade={$transition.pageIn} out:fade={$transition.pageOut}>
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
            {:else if currentPage == "updates"}
                <div class="space-y-6" in:fade={$transition.pageIn} out:fade={$transition.pageOut}>
                    <div class="flex justify-between items-center">
                        <div>
                            <p>{$i18n.t("settings.autoUpdate")}</p>
                            <p class="mt-0.5 text-foreground/70 text-sm font-normal">{$i18n.t("settings.autoUpdateDesc")}</p>
                        </div>
                        <Input type="switch" value={$settings.autoUpdate} on:input={(e) => settings.update("autoUpdate", e.detail.value)} />
                    </div>
                    <div class="flex justify-between items-center">
                        <div>
                            <p>{$i18n.t("settings.betaUpdates")}</p>
                            <p class="mt-0.5 text-foreground/70 text-sm font-normal">{$i18n.t("settings.betaUpdatesDesc")}</p>
                        </div>
                        <Input type="switch" value={$settings.betaUpdates} on:input={(e) => { if (e.detail.value) { settings.update("betaUpdates", false); betaAlert = true; } else settings.update("betaUpdates", e.detail.value); }} />
                    </div>
                </div>
            {:else if currentPage == "about"}
                <div class="w-full h-full flex justify-center items-center" in:fade={$transition.pageIn} out:fade={$transition.pageOut}>
                    <div class="flex flex-col items-center text-center space-y-5">
                        <img src="./logo.png" alt="{$info.name} Logo" class="w-1/3" />
                        <div class="flex flex-col space-y-1">
                            <p class="text-2xl font-semibold">{$info.name}</p>
                            <p class="text-foreground/70" role="none" on:click={onVersionClick}>{$i18n.t("settings.version", { version: $info.version })}</p>
                        </div>
                    </div>
                </div>
            {/if}
        </div>
    </Columns>
</div>
<Modal bind:show={betaAlert} title={$i18n.t("modal.betaUpdates")} on:submit={() => settings.update("betaUpdates", true)}>
    <p>{$i18n.t("modal.betaUpdatesDesc.0")}</p>
    <p>{$i18n.t("modal.betaUpdatesDesc.1")}</p>
</Modal>