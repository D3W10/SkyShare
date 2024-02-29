<script lang="ts">
    import { onMount } from "svelte";
    import { i18n } from "$lib/stores/i18nStore";
    import { info } from "$lib/stores/infoStore";
    import { page } from "$lib/stores/pageStore";
    import { settings } from "$lib/stores/settingsStore";
    import { error } from "$lib/stores/errorStore";
    import FrameBar from "$lib/components/FrameBar.svelte";
    import SideBar from "$lib/components/SideBar.svelte";
    import Home from "$lib/pages/Home.svelte";
    import Send from "$lib/pages/Send.svelte";
    import Receive from "$lib/pages/Receive.svelte";
    import Settings from "$lib/pages/Settings.svelte";
    import Modal from "$lib/components/Modal.svelte";

    onMount(() => setup());
    settings.subscribe(setup);

    function setup() {
        try {
            let themeTranslation = { 0: "light", 1: "dark" };

            document.documentElement.setAttribute("data-theme", themeTranslation[$settings.theme as keyof typeof themeTranslation]);
        }
        catch {}
    }
</script>

<svelte:head>
    <title>{$info.name}</title>
</svelte:head>

<FrameBar />
<div class="h-full flex">
    <SideBar />
    <main class="w-full h-full bg-background rounded-tl-2xl overflow-hidden">
        {#if $page.current == "home"}
            <Home />
        {:else if $page.current == "send"}
            <Send />
        {:else if $page.current == "receive"}
            <Receive />
        {:else if $page.current == "settings"}
            <Settings />
        {/if}
    </main>
</div>
<Modal bind:show={$error.show} title={$i18n.t(`modal.${$error.type}`)} button={$i18n.t("modal.okay")} canCancel={false}>
    <p>{$i18n.t(`modal.${$error.type}Desc`, $error.vars)}</p>
</Modal>