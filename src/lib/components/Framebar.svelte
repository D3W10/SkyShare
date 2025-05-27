<script lang="ts">
    import { onMount } from "svelte";
    import { twMerge } from "tailwind-merge";
    import { app } from "$lib/data/app.svelte";
    import { i18n } from "$lib/data/i18n.svelte";
    import { info } from "$lib/data/info.svelte";
    import { disable } from "$lib/data/disable.svelte";
    import { setError } from "$lib/data/error.svelte";
    import Icon from "./Icon.svelte";
    import { boxStyles } from "$lib/utils.svelte";

    interface Props {
        sidebar?: boolean;
    }

    let {
        sidebar = $bindable(true)
    }: Props = $props();

    let hasFocus = $state(true), isOffline = $state(false);
    let logoClick = 0, logoClickTimeout: NodeJS.Timeout;
    const platform = app.getPlatform();

    app.addEventListener("close", onRedButtonClick);

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
            setError("disabled");
    }

    function offlineAction() {
        console.log("Offline mode");
        isOffline = true;
    }

    function onlineAction() {
        console.log("Online mode");
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
            <img class="h-5 ml-0.5" src="/logo.svg" alt="{info.name} Logo" role="none" onclick={onLogoClick} style:-webkit-app-region="no-drag" />
            <p class="text-sm font-semibold {hasFocus ? "opacity-100" : "opacity-50"}">{info.name}</p>
        {:else}
            <div class="w-14"></div>
        {/if}
        <div class="ml-1 flex gap-x-1.5" style:-webkit-app-region="no-drag">
            <button class="w-6 p-0.5 text-slate-500 dark:text-slate-600 enabled:hover:bg-slate-900/10 dark:enabled:hover:bg-slate-200/10 disabled:bg-transparent rounded-md disabled:opacity-50 enabled:cursor-pointer transition duration-200" onclick={() => sidebar = !sidebar}>
                <Icon name="sidebar" />
            </button>
            <button class="w-6 p-0.5 text-slate-500 dark:text-slate-600 enabled:hover:bg-slate-900/10 dark:enabled:hover:bg-slate-200/10 disabled:bg-transparent rounded-md disabled:opacity-50 enabled:cursor-pointer transition duration-200" disabled>
                <Icon name="back" />
            </button>
        </div>
    </div>
    <div class="h-fit flex" style:-webkit-app-region="no-drag">
        {#if isOffline}
            <div class={twMerge(boxStyles.box, "px-2 py-1 rounded-lg")}>
                <Icon name="wifiOff" class="w-5" />
                <span class="ml-2.5 text-sm font-medium">{i18n.t("common.offline")}</span>
            </div>
        {/if}
        {#if platform !== "darwin"}
            <div class="flex items-center ml-4 mr-1.5 gap-x-2 group">
                <div class="size-3.25 bg-slate-950/5 dark:bg-slate-100/5 rounded-full inset-ring-1 inset-ring-slate-900/10 dark:inset-ring-slate-100/10"></div>
                <button class="size-3.25 flex justify-center items-center {hasFocus ? "bg-amber-500" : "bg-slate-950/5 dark:bg-slate-100/5 group-hover:bg-amber-500"} active:bg-amber-600 rounded-full inset-ring-1 inset-ring-slate-900/10 dark:inset-ring-slate-100/10 focus-visible:outline-amber-500" aria-label="Minimize" onclick={onYellowButtonClick}>
                    <Icon name="minimizeWindow" class="size-full hidden group-hover:block text-amber-900" />
                </button>
                <button class="size-3.25 flex justify-center items-center {hasFocus ? "bg-red-500" : "bg-slate-950/5 dark:bg-slate-100/5 group-hover:bg-red-500"} active:bg-red-600 rounded-full inset-ring-1 inset-ring-slate-900/10 dark:inset-ring-slate-100/10 focus-visible:outline-red-500" aria-label="Close" onclick={onRedButtonClick}>
                    <Icon name="closeWindow" class="size-full hidden group-hover:block text-red-900" />
                </button>
            </div>
        {/if}
    </div>
</div>