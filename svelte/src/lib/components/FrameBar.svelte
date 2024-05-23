<script lang="ts">
    import { onMount } from "svelte";
    import { quartOut } from "svelte/easing";
    import { tweened } from "svelte/motion";
    import { i18n } from "$lib/stores/i18nStore";
    import { app } from "$lib/stores/appStore";
    import { info } from "$lib/stores/infoStore";
    import { disable } from "$lib/stores/disableStore";
    import Modal from "$lib/components/Modal.svelte";
    import Icon from "$lib/components/Icon.svelte";

    let showModal: boolean = false, logoClick: number = 0, logoClickTimeout: NodeJS.Timeout;
    const offlineBubble = tweened(0, { duration: 1500, easing: quartOut }), MAX_SIZE = 105;

    $app?.updateCloseCallback(() => onRedButtonClick());

    onMount(() => {
        const offlineAction = () => {
            offlineBubble.set(MAX_SIZE);
            $app.log("Offline mode");
        }, onlineAction = () => {
            offlineBubble.set(0);
            $app.log("Online mode");
        }

        if (!navigator.onLine)
            offlineAction();

        window.addEventListener("offline", offlineAction);
        window.addEventListener("online", onlineAction);
    });

    function onLogoClick() {
        logoClick++;

        clearTimeout(logoClickTimeout);
        logoClickTimeout = setTimeout(() => logoClick = 0, 400);

        if (logoClick == 3) {
            logoClick = 0;

            if (!document.body.hasAttribute("style"))
                document.body.style.animation = "hueRotate 5s linear infinite";
            else
                document.body.removeAttribute("style");
        }
    }

    function onYellowButtonClick(e: MouseEvent) {
        if (!e.ctrlKey && !e.metaKey)
            $app.minimizeWindow();
        else
            $app.compressWindow();
    }

    function onRedButtonClick() {
        if (!$disable.d)
            $app.closeWindow();
        else
            showModal = true;
    }
</script>

<div class="w-full h-10 min-h-10 p-2 flex justify-between items-center overflow-hidden drag">
    {#if $app}
        {@const platform = $app.getPlatform()}
        <div class="w-32 flex items-center space-x-2 {platform == "darwin" ? "pl-[4.5rem]" : ""}">
            {#if platform != "darwin"}
                <img class="h-5 ml-0.5" src="./logo.png" alt="{$info.name} Logo" role="none" on:click={onLogoClick} />
            {/if}
            <span class="text-sm font-semibold">{$info.name}</span>
        </div>
        <div class="-my-0.5 text-background bg-primary rounded-full transition-colors" style:max-width="{$offlineBubble}px" style:max-height="{$offlineBubble}px">
            <div class="px-3 py-1 flex justify-center items-center transition-opacity duration-300" style:opacity={$offlineBubble < MAX_SIZE * 0.95 ? 0 : 1}>
                <Icon name="offline" className="w-5 min-w-5" />
                <span class="ml-3 text-sm font-semibold">{$i18n.t("common.offline")}</span>
            </div>
        </div>
        <div class="w-32 flex justify-end items-center p-1 space-x-2">
            {#if platform != "darwin"}
                <button class="w-4 h-4 flex justify-center items-center relative bg-foreground/10 rounded-full hover:shadow-sm hover:shadow-amber-500 overflow-hidden transition-shadow duration-300 ease-cubic-out before:w-0 before:h-0 before:absolute before:bg-amber-500 before:rounded-full before:transition-all before:duration-300 before:ease-cubic-out hover:before:w-4 hover:before:h-4 focus-visible:outline-amber-500" on:click={onYellowButtonClick} />
                <button class="w-4 h-4 flex justify-center items-center relative bg-foreground/10 rounded-full hover:shadow-sm hover:shadow-red-500 overflow-hidden transition-shadow duration-300 ease-cubic-out before:w-0 before:h-0 before:absolute before:bg-red-500 before:rounded-full before:transition-all before:duration-300 before:ease-cubic-out hover:before:w-4 hover:before:h-4 focus-visible:outline-red-500" on:click={onRedButtonClick} />
            {/if}
        </div>
    {/if}
</div>
<Modal bind:show={showModal} title={$i18n.t("modal.disabled")} canCancel={false}>
    <p>{$i18n.t("modal.disabledDesc")}</p>
</Modal>

<style lang="postcss">
    img, :global(button) {
        -webkit-app-region: no-drag;
    }

    .drag {
        -webkit-app-region: drag;
    }
</style>