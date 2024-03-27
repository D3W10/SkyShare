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

    onMount(() => {
        if (!navigator.onLine)
            offlineBubble.set(MAX_SIZE);

        window.addEventListener("offline", () => offlineBubble.set(MAX_SIZE));
        window.addEventListener("online", () => offlineBubble.set(0));
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
            $app?.minimizeWindow();
        else
            $app?.compressWindow();
    }

    function onRedButtonClick() {
        if (!$disable.d)
            $app?.closeWindow();
        else
            showModal = true;
    }
</script>

<div class="w-full h-10 p-2 flex justify-between items-center drag">
    <div class="w-32 flex items-center space-x-2">
        <img class="h-5 ml-0.5" src="./logo.png" alt="{$info.name} Logo" role="none" on:click={onLogoClick} />
        <span class="text-sm font-semibold">{$info.name}</span>
    </div>
    <div class="-my-0.5 text-background bg-primary rounded-full transition-colors" style:max-width="{$offlineBubble}px" style:max-height="{$offlineBubble}px">
        <div class="px-3 py-1 flex justify-center items-center transition-opacity duration-300" style:opacity={$offlineBubble < MAX_SIZE * 0.95 ? 0 : 1}>
            <Icon name="offline" className="w-5 min-w-5" />
            <span class="ml-3 text-sm font-semibold">{$i18n.t("common.offline")}</span>
        </div>
    </div>
    <div class="w-32 flex justify-end items-center p-1 space-x-2">
        <button class="w-4 h-4 flex justify-center items-center relative bg-foreground/10 rounded-full overflow-hidden before:w-0 before:h-0 before:absolute before:bg-amber-500 before:rounded-full before:transition-all before:duration-[400ms] before:ease-cubic-out hover:before:w-9 hover:before:h-9 focus-visible:outline-amber-500" on:click={onYellowButtonClick} />
        <button class="w-4 h-4 flex justify-center items-center relative bg-foreground/10 rounded-full overflow-hidden before:w-0 before:h-0 before:absolute before:bg-red-500 before:rounded-full before:transition-all before:duration-[400ms] before:ease-cubic-out hover:before:w-9 hover:before:h-9 focus-visible:outline-red-500" on:click={onRedButtonClick} />
    </div>
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