<script lang="ts">
    import { app } from "$lib/stores/appStore";
    import { info } from "$lib/stores/infoStore";
    import { disable } from "$lib/stores/disableStore";
    import Button from "./Button.svelte";
    import Modal from "$lib/components/Modal.svelte";

    let showModal: boolean = false;

    function onRedButtonClick() {
        if (!$disable)
            $app?.closeWindow();
        else
            showModal = true;
    }

    function onModalSubmit() {
        
    }
</script>

<div class="w-full h-10 p-2 flex justify-between drag">
    <div class="flex items-center space-x-2">
        <img class="h-5 ml-0.5" src="./logo.png" alt="{$info.name} Logo" />
        <span class="text-sm font-semibold">{$info.name}</span>
    </div>
    <div class="flex items-center p-1 space-x-2">
        <Button type="invisible" className="w-4 h-4 flex justify-center items-center relative bg-foreground/10 !rounded-full overflow-hidden before:w-0 before:h-0 before:absolute before:bg-amber-500 before:rounded-full before:transition-all before:duration-[400ms] before:ease-cubic-out hover:before:w-9 hover:before:h-9 focus-visible:outline-amber-500" on:click={$app?.minimizeWindow} />
        <Button type="invisible" className="w-4 h-4 flex justify-center items-center relative bg-foreground/10 !rounded-full overflow-hidden before:w-0 before:h-0 before:absolute before:bg-red-500 before:rounded-full before:transition-all before:duration-[400ms] before:ease-cubic-out hover:before:w-9 hover:before:h-9 focus-visible:outline-red-500" on:click={onRedButtonClick} />
    </div>
</div>
<Modal bind:show={showModal} title="Leave to Lobby" button="Yes" cancelButton="No" on:submit={onModalSubmit}>
    <p>Are</p>
</Modal>

<style lang="postcss">
    :global(button) {
        -webkit-app-region: no-drag;
    }

    .drag {
        -webkit-app-region: drag;
    }
</style>