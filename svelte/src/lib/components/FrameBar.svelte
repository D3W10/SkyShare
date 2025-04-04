<script lang="ts">
    import { onMount } from "svelte";
    import { fly } from "svelte/transition";
    import { app } from "$lib/data/app.svelte";
    import { i18n } from "$lib/data/i18n.svelte";
    import { info } from "$lib/data/info.svelte";
    import { disable } from "$lib/data/disable.svelte";
    import Icon from "./Icon.svelte";
    import Dialog from "./Dialog.svelte";

    interface Props {
        sidebar?: boolean;
    }

    let {
        sidebar = $bindable(true)
    }: Props = $props();

    let hasFocus = $state(true), showModal = $state(false), isOffline = $state(false);
    let logoClick = 0, logoClickTimeout: NodeJS.Timeout;
    const platform = app.getPlatform();

    app.updateCallback("close", () => onRedButtonClick());

    function onLogoClick() {
        logoClick++;

        clearTimeout(logoClickTimeout);
        logoClickTimeout = setTimeout(() => logoClick = 0, 400);

        if (logoClick === 3) {
            logoClick = 0;

            if (!document.body.classList.contains("animate-hue"))
                document.body.classList.add("animate-hue");
            else
                document.body.classList.remove("animate-hue");
        }
    }

    function onYellowButtonClick(e: MouseEvent) {
        if (!e.ctrlKey && !e.metaKey)
            app.minimizeWindow();
        else
            app.compressWindow();
    }

    function onRedButtonClick() {
        if (!disable.d)
            app.closeWindow();
        else
            showModal = true;
    }

    function offlineAction() {
        app.log("Offline mode");
        isOffline = true;
    }

    function onlineAction() {
        app.log("Online mode");
        isOffline = false;
    }

    onMount(() => {
        hasFocus = document.hasFocus();

        if (!navigator.onLine)
            offlineAction();
    });
</script>

<svelte:window onfocus={() => hasFocus = true} onblur={() => hasFocus = false} onoffline={offlineAction} ononline={onlineAction} />

<div class="w-full h-10 min-h-10 py-1 pl-3 pr-1.5 flex justify-between items-center overflow-hidden" style:-webkit-app-region="drag">
    <div class="flex items-center gap-x-2">
        {#if platform !== "darwin"}
            <img class="h-5 ml-0.5" src="/logo.png" alt="{info.name} Logo" role="none" onclick={onLogoClick} style:-webkit-app-region="no-drag" />
            <p class="text-sm font-semibold {hasFocus ? "opacity-100" : "opacity-50"}">{info.name}</p>
        {:else}
            <div class="w-14"></div>
        {/if}
        <div class="ml-1 flex gap-x-1.5" style:-webkit-app-region="no-drag">
            <button class="w-6 p-0.5 text-slate-500 hover:bg-slate-900/10 disabled:bg-transparent rounded-md disabled:opacity-50 cursor-pointer disabled:cursor-default transition duration-200" onclick={() => sidebar = !sidebar}>
                <Icon name="sidebar" />
            </button>
            <button class="w-6 p-0.5 text-slate-500 hover:bg-slate-900/10 disabled:bg-transparent rounded-md disabled:opacity-50 cursor-pointer disabled:cursor-default transition duration-200" disabled>
                <Icon name="back" />
            </button>
        </div>
    </div>
    <div class="h-fit flex" style:-webkit-app-region="no-drag">
        {#if isOffline}
            <div class="px-2 py-1 flex relative bg-white rounded-lg ring-1 ring-slate-400/10 dark:ring-slate-400/10 shadow-sm before:absolute before:inset-0 before:rounded-md before:border-b-3 before:border-slate-100" transition:fly={platform !== "darwin" ? { x: 10 } : { x: -10 }}>
                <Icon name="wifiOff" class="w-5" />
                <span class="ml-2.5 text-sm font-medium">{i18n.t("common.offline")}</span>
            </div>
        {/if}
        {#if platform !== "darwin"}
            <div class="flex items-center ml-4 mr-1.5 gap-x-2 group">
                <div class="size-3.25 bg-foreground/10 rounded-full inset-ring-1 inset-ring-slate-900/10"></div>
                <button class="size-3.25 flex justify-center items-center {hasFocus ? "bg-amber-500" : "bg-foreground/10 hover:bg-amber-500"} active:bg-amber-600 rounded-full inset-ring-1 inset-ring-slate-900/10 focus-visible:outline-amber-500" aria-label="Minimize" onclick={onYellowButtonClick}>
                    <Icon name="minimizeWindow" class="size-full hidden group-hover:block text-amber-900" />
                </button>
                <button class="size-3.25 flex justify-center items-center {hasFocus ? "bg-red-500" : "bg-foreground/10 hover:bg-red-500"} active:bg-red-600 rounded-full inset-ring-1 inset-ring-slate-900/10 focus-visible:outline-red-500" aria-label="Close" onclick={onRedButtonClick}>
                    <Icon name="closeWindow" class="size-full hidden group-hover:block text-red-900" />
                </button>
            </div>
        {/if}
    </div>
</div>
<Dialog bind:show={showModal} title={i18n.t("modal.disabled")} cancelable={false}>
    <p>{i18n.t("modal.disabledDesc")}</p>
</Dialog>