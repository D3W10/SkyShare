<script lang="ts">
    import { i18n } from "$lib/stores/i18nStore";
    import { app } from "$lib/stores/appStore";
    import { info } from "$lib/stores/infoStore";
    import { disable } from "$lib/stores/disableStore";
    import Modal from "$lib/components/Modal.svelte";

    let showModal: boolean = false, logoClick: number = 0, logoClickTimeout: NodeJS.Timeout;;

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

    function onRedButtonClick() {
        if (!$disable.d)
            $app?.closeWindow();
        else
            showModal = true;
    }
</script>

<div class="w-full h-10 p-2 flex justify-between drag">
    <div class="flex items-center space-x-2">
        <img class="h-5 ml-0.5" src="./logo.png" alt="{$info.name} Logo" role="none" on:click={onLogoClick} />
        <span class="text-sm font-semibold">{$info.name}</span>
    </div>
    <div class="flex items-center p-1 space-x-2">
        <button class="w-4 h-4 flex justify-center items-center relative bg-foreground/10 rounded-full overflow-hidden before:w-0 before:h-0 before:absolute before:bg-amber-500 before:rounded-full before:transition-all before:duration-[400ms] before:ease-cubic-out hover:before:w-9 hover:before:h-9 focus-visible:outline-amber-500" on:click={$app?.minimizeWindow} />
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