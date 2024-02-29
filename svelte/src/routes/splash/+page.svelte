<script lang="ts">
    import { onMount } from "svelte";
    import { fade, scale } from "svelte/transition";
    import { quintOut } from "svelte/easing";
    import { app } from "$lib/stores/appStore";
    import Blob from "$lib/components/Blob.svelte";
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
        <Blob className="w-4/5 absolute top-0 left-0 -z-10" color="#3014ff" />
        <Blob className="w-2/3 absolute bottom-0 right-0 rotate-180 -z-10" color="#b92dff" />
        {#if status != DEFAULT_STATUS}
            <div class="w-1/3 mt-4 mr-4 absolute top-0 right-0" transition:fade={{ duration: 500 }}>
                <ProgressBar bind:value={dlPercent} />
            </div>
        {/if}
        <div class="w-full h-full mb-6 flex flex-col justify-center items-center space-y-1" in:scale={{ duration: 1500, easing: quintOut }}>
            <img src="./logo.png" alt="Logo" class="w-1/5" />
            <h1 class="text-2xl font-semibold">CosmoChamp</h1>
        </div>
        <p class="absolute bottom-4 text-shade/75 animate-pulse" in:fade={{ duration: 1000, delay: 500 }} on:introend={checkForUpdates}>{status}</p>
    {/if}
</div>