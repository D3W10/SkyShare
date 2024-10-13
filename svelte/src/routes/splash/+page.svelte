<script lang="ts">
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";
    import { i18n } from "$lib/stores/i18nStore";
    import { app } from "$lib/stores/appStore";
    import { info } from "$lib/stores/infoStore";
    import { settings } from "$lib/stores/settingsStore";
    import { account } from "$lib/stores/accountStore";
    import ProgressBar from "$lib/components/ProgressBar.svelte";
    import type { IStoreAccount } from "$electron/lib/interfaces/Store.interface";

    const DEFAULT_STATUS = $i18n.t("splash.starting");
    let start = false, status = DEFAULT_STATUS, dlPercent = 0, splashReady = false, winReady = false;

    $app?.updateCallback("ready", () => {
        winReady = true;
        $app.log("Main window ready");
        onReady();
    });

    async function checkConnection() {
        if (!navigator.onLine) {
            status = $i18n.t("splash.offline");

            await new Promise<void>(resolve => window.addEventListener("online", () => resolve(), { once: true }));
            status = $i18n.t("splash.starting");
        }

        fetchServers();
    }

    async function fetchServers() {
        await $app.fetchServers();

        checkForUpdates();
    }

    async function checkForUpdates() {
        if ($settings.autoUpdate) {
            await new Promise<void>(resolve => {
                $app.checkForUpdates(available => {
                    if (available)
                        status = $i18n.t("splash.updating");
                    else
                        resolve();
                }, percent => dlPercent = percent);
            });
        }

        accountLogIn();
    }

    async function accountLogIn() {
        const storedInfo = $app.getSetting("account") as IStoreAccount;

        if (storedInfo.username && storedInfo.password) {
            status = $i18n.t("splash.loggingIn");

            const loginSuccess = await $app.sendLoginRequest(storedInfo.username, storedInfo.password);
            if (!loginSuccess)
                account.logout();
        }
        
        splashReady = true;
        $app.log("Splash window ready");
        onReady();
    }

    function onReady() {
        if (splashReady && winReady)
            $app.openMain();
    }

    onMount(() => {
        document.body.classList.add("bg-background");
        start = true;
    });
</script>

<div class="w-full h-full flex flex-col items-center relative">
    {#if start}
        <div class="h-8 absolute top-0 left-0 right-0" style="-webkit-app-region: drag;" />
        {#if status == $i18n.t("splash.updating")}
            <div class="w-1/3 absolute top-4" transition:fade={{ duration: 500 }}>
                <ProgressBar bind:value={dlPercent} />
            </div>
        {/if}
        <div class="w-full h-full flex flex-col justify-between p-6">
            <div class="space-y-3">
                <img src="./logoCompact.png" class="w-10" alt="Logo" />
                <h1 class="text-2xl font-bold">{$info.name}</h1>
            </div>
            <p class="text-sm animate-pulse" in:fade={{ duration: 1000, delay: 500 }} on:introend={checkConnection}>{status}</p>
        </div>
        <img src="./mesh.png" class="absolute top-0 bottom-0 right-0" alt="{$info.name} Mesh" />
    {/if}
</div>