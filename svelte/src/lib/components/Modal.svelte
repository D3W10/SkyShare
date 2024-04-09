<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { i18n } from "$lib/stores/i18nStore";
    import Button from "./Button.svelte";

    export let show: boolean;
    export let title: string = "";
    export let button: string = "";
    export let disabled: boolean = false;
    export let canCancel: boolean = true;
    export let cancelButton: string = "";

    let dialog: HTMLDialogElement;
    let defaultButtonText = $i18n.t("modal.okay"), defaultCancelText = $i18n.t("modal.cancel");
    const dispatch = createEventDispatcher<{ submit: undefined }>();

    $: {
        defaultButtonText = $i18n.t("modal.okay");
        defaultCancelText = $i18n.t("modal.cancel");
    }

    $: {
        if (dialog && show)
            dialog.showModal();
    }

    function closeModal(submit: boolean) {
        if (submit)
            setTimeout(() => dispatch("submit"), 0);

        setTimeout(() => dialog.close(), 400);
        show = false;
    }
</script>

<dialog class="w-[28rem] max-h-112 transition-all ease-quint-out opacity-0 {show ? "open" : "closed"} duration-[400ms] scale-50 outline-0 overflow-hidden" bind:this={dialog} on:close={() => show = false}>
    <form class="max-h-112 p-5 flex flex-col space-y-3" role="alertdialog" on:submit={() => closeModal(true)}>
        {#if title != ""}
            <h1 class="text-2xl font-semibold">{title}</h1>
        {/if}
        <slot />
        <div class="flex justify-end items-center space-x-3">
            {#if canCancel}
                <Button type="small" secondary modal on:click={() => closeModal(false)}>{cancelButton || defaultCancelText}</Button>
            {/if}
            <Button type="small" {disabled} modal submit>{button || defaultButtonText}</Button>
        </div>
    </form>
</dialog>

<style lang="postcss">
    dialog.open {
        @apply opacity-100 scale-100;
    }

    dialog::backdrop {
        @apply opacity-0 transition-opacity duration-[400ms] ease-quint-out;
    }

    dialog.open::backdrop {
        @apply opacity-100;
    }
</style>
