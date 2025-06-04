<script lang="ts">
    import { twMerge } from "tailwind-merge";
    import { i18n } from "$lib/data/i18n.svelte";
    import Button from "./Button.svelte";
    import { boxStyles } from "$lib/utils";
    import type { Snippet } from "svelte";

    interface Props {
        children?: Snippet;
        show: boolean;
        title: string;
        text?: string;
        cancelable?: boolean;
        cancelText?: string;
        onsubmit?: () => unknown;
        oncancel?: () => unknown;
    }

    let {
        children,
        show = $bindable(false),
        title,
        text,
        cancelable = true,
        cancelText,
        onsubmit,
        oncancel
    }: Props = $props();

    let dialog = $state<HTMLDialogElement>(), open = $state(false);

    $effect(() => {
        if (show && dialog)
            openModal();
    });

    function openModal() {
        dialog?.showModal();
        setTimeout(() => open = true, 50);
    }

    function closeModal(submit: boolean) {
        if (submit)
            onsubmit?.();
        else
            oncancel?.();

        setTimeout(() => dialog?.close(), 400);
        open = show = false;
    }
</script>

<dialog bind:this={dialog} class={twMerge(boxStyles.box, "w-112 max-h-132 p-5 hidden open:flex flex-col fixed top-1/2 left-1/2 text-slate-950 dark:text-slate-100 rounded-2xl shadow-xl outline-0 overflow-hidden -translate-x-1/2 -translate-y-1/2 transition duration-300 backdrop:bg-slate-950/30 backdrop:backdrop-blur-xs backdrop:transition-opacity backdrop:duration-300", !open ? "opacity-0 scale-50 ease-quart-in backdrop:opacity-0 backdrop:ease-quart-in" : "ease-cubic-out backdrop:opacity-100 backdrop:ease-cubic-out")} onclose={() => show = false}>
    {#if title}
        <h1 class="mb-2 text-2xl font-semibold">{title}</h1>
    {/if}
    {@render children?.()}
    <div class="mt-4 flex justify-end items-center space-x-3">
        {#if cancelable}
            <Button type="secondary" dialog onclick={() => closeModal(false)}>{cancelText || i18n.t("dialog.cancel")}</Button>
        {/if}
        <Button dialog onclick={() => closeModal(true)}>{text || i18n.t("dialog.okay")}</Button>
    </div>
</dialog>