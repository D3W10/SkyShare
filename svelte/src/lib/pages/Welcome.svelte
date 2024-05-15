<script lang="ts">
    import { fade, fly, scale } from "svelte/transition";
    import { i18n } from "$lib/stores/i18nStore";
    import { page } from "$lib/stores/pageStore";
    import { transition } from "$lib/stores/transitionStore";
    import { disable } from "$lib/stores/disableStore";
    import { account } from "$lib/stores/accountStore";
    import { settings } from "$lib/stores/settingsStore";
    import Columns from "$lib/components/layout/Columns.svelte";
    import Button from "$lib/components/Button.svelte";
    import Icon from "$lib/components/Icon.svelte";

    let loginAnimate: boolean = false, welcomeMovie: HTMLVideoElement;

    function startPlaying() {
        disable.lock(false);
        setTimeout(() => welcomeMovie.play(), 1000);
    }

    $: $page.current == "welcome" && $page.subPage == 0 && welcomeMovie ? startPlaying() : "";
    $: setTimeout(() => loginAnimate = $page.subPage == 3, $page.subPage == 3 ? 400 : 0);
</script>

<div class="w-full h-full p-6 space-y-4" in:fade={$transition.pageIn} out:fade={$transition.pageOut}>
    {#if $page.subPage == 0}
        <div class="w-full h-full" in:fly={$transition.subpageIn} out:fade={$transition.subpageOut}>
            <video bind:this={welcomeMovie} class="absolute inset-0" src={$settings.theme == 0 ? "./introLight.mp4" : "./introDark.mp4"} on:ended={() => { page.set("welcome", 1); disable.unlock(); }}>
                <track kind="captions" />
            </video>
        </div>
    {:else if $page.subPage == 1}
        <div class="w-full h-full flex flex-col" in:fade={$transition.subpageIn} out:fly={$transition.subpageOut}>
            <h1 class="w-full text-xl font-semibold">{$i18n.t("welcome.0.title")}</h1>
            <Columns>
                <div slot="left" class="flex justify-center items-center" in:scale|global={$transition.iconJump}>
                    <Icon name="accountSuccess" className="w-2/3 text-primary" />
                </div>
                <div slot="right" class="flex flex-col justify-between items-center">
                    <div class="w-full h-full flex justify-center items-center">
                        <div class="w-3/5 space-y-8">
                            <p class="text-center font-semibold">{$i18n.t("welcome.0.intro.0")}</p>
                            <p class="text-center font-semibold">{$i18n.t("welcome.0.intro.1")}</p>
                        </div>
                    </div>
                    <Button className="w-fit" on:click={() => page.set("welcome", 2)}>{$i18n.t("common.next")}</Button>
                </div>
            </Columns>
        </div>
    {:else if $page.subPage == 2}
        <div class="w-full h-full flex flex-col" in:fly={$transition.subpageIn} out:fly={$transition.subpageOut}>
            <h1 class="w-full text-xl font-semibold">{$i18n.t("welcome.1.title")}</h1>
            <div class="w-full h-full flex flex-col justify-between items-center p-5 pb-0">
                <div class="w-full h-[25rem] grid grid-rows-3 gap-5">
                    <div class="w-full h-full flex items-center p-6 hover:text-send bg-secondary rounded-xl shadow-md hover:shadow-send/50 ring-1 ring-foreground/10 space-x-5 transition-shadow duration-300">
                        <Icon name="history" className="min-w-16 h-16 transition-colors duration-300 ease-in-out" />
                        <div>
                            <h2 class="w-fit mb-1 text-foreground text-lg font-semibold">{$i18n.t("welcome.1.history")}</h2>
                            <p class="text-sm text-foreground">{$i18n.t("welcome.1.historyDesc")}</p>
                        </div>
                    </div>
                    <div class="w-full h-full flex items-center p-6 hover:text-receive bg-secondary rounded-xl shadow-md hover:shadow-receive/50 ring-1 ring-foreground/10 space-x-5 transition-shadow duration-300">
                        <Icon name="sync" className="min-w-16 h-16 transition-colors duration-300 ease-in-out" />
                        <div>
                            <h2 class="w-fit mb-1 text-foreground text-lg font-semibold">{$i18n.t("welcome.1.sync")}</h2>
                            <p class="text-sm text-foreground">{$i18n.t("welcome.1.syncDesc")}</p>
                        </div>
                    </div>
                    <div class="w-full h-full flex items-center p-6 hover:text-settings bg-secondary rounded-xl shadow-md hover:shadow-settings/50 ring-1 ring-foreground/10 space-x-5 transition-shadow duration-300">
                        <Icon name="files" className="min-w-16 h-16 transition-colors duration-300 ease-in-out" />
                        <div>
                            <h2 class="w-fit mb-1 text-foreground text-lg font-semibold">{$i18n.t("welcome.1.identification")}</h2>
                            <p class="text-sm text-foreground">{$i18n.t("welcome.1.identificationDesc")}</p>
                        </div>
                    </div>
                </div>
                <Button className="w-fit mt-2" on:click={() => page.set("welcome", 3)}>{$i18n.t("common.next")}</Button>
            </div>
        </div>
    {:else if $page.subPage == 3}
        <div class="w-full h-full flex flex-col" in:fly={$transition.subpageIn} out:fly={$transition.subpageOut}>
            <div class="w-full h-full p-5 flex flex-col">
                {#if loginAnimate}
                    <div class="h-full flex flex-col justify-center items-center">
                        <div class="w-40 h-40" in:scale={{ duration: 1000, delay: 400, start: 1.5 }}>
                            {#if !$account.loggedIn || !$account.photo}
                                <Icon name="account" className="w-full text-primary transition-colors" />
                            {:else}
                                <img src={$account.photo} alt="{$account.username} Profile Picture" class="w-full h-full rounded-full" />
                            {/if}
                        </div>
                        <h1 class="mt-6 text-3xl font-semibold" in:fade={{ duration: 400, delay: 1800 }}>{$i18n.t("welcome.2.welcome")}</h1>
                        <h2 class="mt-2 text-lg font-medium" in:fade={{ duration: 400, delay: 2100 }}>{$account.username}</h2>
                    </div>
                    <div class="ml-auto" in:fade={{ duration: 800, delay: 3000 }}>
                        <Button className="w-fit" on:click={() => page.set("account")}>{$i18n.t("welcome.2.continue")}</Button>
                    </div>
                {/if}
            </div>
        </div>
    {/if}
</div>