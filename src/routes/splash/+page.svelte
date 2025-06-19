<script lang="ts">
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";
    import { app } from "$lib/data/app.svelte";
    import { info } from "$lib/data/info.svelte";
    import { i18n } from "$lib/data/i18n.svelte";
    import { settings } from "$lib/data/settings.svelte";
    import ProgressBar from "$lib/components/ProgressBar.svelte";

    const states = {
        starting: () => i18n.t("splash.starting"),
        offline: () => i18n.t("splash.offline"),
        updating: () => i18n.t("splash.updating"),
        loggingIn: () => i18n.t("splash.loggingIn")
    }

    let status = $state<keyof typeof states>("starting"), percent = $state(0.5);

    onMount(async () => {
        await checkConnection();
        await checkForUpdates();
        await accountLogIn();
        onReady();
    });

    async function checkConnection() {
        if (!navigator.onLine) {
            status = "offline";

            await new Promise<unknown>(resolve => window.addEventListener("online", resolve, { once: true }));
            status = "starting";
        }
        console.log("[Splash] App is online");
    }

    async function checkForUpdates() {
        if (settings.autoUpdate) {
            await new Promise<void>(resolve => {
                app.checkForUpdates(available => {
                    if (available) {
                        status = "updating";
                        console.log("[Splash] Update available!");
                    }
                    else {
                        resolve();
                        console.log("[Splash] The app is up to date");
                    }
                }, p => percent = p / 100);
            });
        }
        else
            console.log("[Splash] Auto update is disabled");
    }

    async function accountLogIn() {
        /* const storedInfo = $app.getSetting("account") as IStoreAccount;

        if (storedInfo.username && storedInfo.password) {
            status = $i18n.t("splash.loggingIn");

            const loginSuccess = await $app.sendLoginRequest(storedInfo.username, storedInfo.password);
            if (!loginSuccess)
                account.logout();
        }
        
        splashReady = true;
        console.log("Splash window ready"); */
    }

    function onReady() {
        console.log("[Splash] Initialization completed");
        app.addEventListener("ready", () => {
            console.log("Opening main window");
            app.openMain();
        }, { once: true });
    }
</script>

<div class="size-full flex flex-col items-center relative">
    <div class="h-8 fixed top-0 left-0 right-0" style="-webkit-app-region: drag;"></div>
    {#if status === "updating"}
        <div class="w-1/3 fixed top-4" transition:fade={{ duration: 400 }}>
            <ProgressBar class="h-1" bind:value={percent} />
        </div>
    {/if}
    <div class="size-full flex flex-col justify-between p-6">
        <div class="space-y-3">
            <img src="./logo.svg" class="w-10" alt="Logo" />
            <h1 class="text-2xl font-semibold">{info.name}</h1>
        </div>
        <p class="animate-pulse" in:fade={{ duration: 400, delay: 400 }}>{states[status]()}</p>
    </div>
    <img src="./meshLight.svg" class="fixed top-0 bottom-0 right-0 block dark:hidden -z-1" alt="{info.name} Mesh" />
    <img src="./meshDark.svg" class="fixed top-0 bottom-0 right-0 hidden dark:block -z-1" alt="{info.name} Mesh" />
</div>