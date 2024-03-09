<script lang="ts">
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";
    import { app } from "$lib/stores/appStore";
    import { info } from "$lib/stores/infoStore";
    import ProgressBar from "$lib/components/ProgressBar.svelte";

    const DEFAULT_STATUS = "Starting";
    let start = false, status = DEFAULT_STATUS, dlPercent = 0, splashReady = false, winReady = false;

    $app?.updateReadyCallback(() => {
        winReady = true;
        $app?.log("Main window ready");
        onReady();
    });

    function checkForUpdates() {
        $app?.checkForUpdates((available) => {
            if (available)
                status = "Updating";
            else {
                splashReady = true;
                $app?.log("Splash window ready");
                onReady();
            }
        }, (percent) => dlPercent = percent);
    }

    function onReady() {
        if (splashReady && winReady)
            $app?.openMain();
    }

    onMount(() => {
        document.body.classList.add("bg-background");
        start = true;
    });
</script>

<div class="w-full h-full flex flex-col items-center relative">
    {#if start}
        <div class="h-8 absolute top-0 left-0 right-0" style="-webkit-app-region: drag;" />
        {#if status != DEFAULT_STATUS}
            <div class="w-1/3 absolute top-4" transition:fade={{ duration: 500 }}>
                <ProgressBar bind:value={dlPercent} />
            </div>
        {/if}
        <div class="w-full h-full flex flex-col justify-between p-6">
            <div class="space-y-3">
                <img src="./logoCompact.png" class="w-10" alt="Logo" />
                <h1 class="text-2xl font-bold">{$info.name}</h1>
            </div>
            <p class="text-sm animate-pulse" in:fade={{ duration: 1000, delay: 500 }} on:introend={checkForUpdates}>{status}</p>
        </div>
        <img src="./mesh.png" class="absolute top-0 bottom-0 right-0" alt={`${$info.name} Mesh`} />
    {/if}
</div>