<script lang="ts">
    import { scale } from "svelte/transition";
    import { cubicOut } from "svelte/easing";
    import { twMerge } from "tailwind-merge";
    import { i18n } from "$lib/data/i18n.svelte";
    import Button from "./Button.svelte";
    import { boxStyles } from "$lib/utils.svelte";
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

    let dialog = $state<HTMLDialogElement>();

    $effect(() => {
        if (show && dialog)
            dialog.showModal();
    });

    function closeModal(submit: boolean) {
        if (submit)
            onsubmit?.();
        else
            oncancel?.();

        setTimeout(() => dialog?.close(), 400);
        show = false;
    }
</script>

{#if show}
    <dialog bind:this={dialog} class={twMerge(boxStyles.box, "w-112 max-h-132 p-5 flex-col fixed top-1/2 left-1/2 rounded-2xl shadow-xl outline-0 overflow-hidden -translate-x-1/2 -translate-y-1/2 backdrop:opacity-0 open:backdrop:opacity-100 backdrop:bg-slate-950/30 backdrop:backdrop-blur-xs backdrop:transition-[opacity] backdrop:duration-300 backdrop:ease-out")} onclose={() => show = false} transition:scale={{ duration: 300, start: 0.5, easing: cubicOut }}>
        {#if title}
            <h1 class="mb-2 text-2xl font-semibold">{title}</h1>
        {/if}
        {@render children?.()}
        <div class="mt-4 flex justify-end items-center space-x-3">
            {#if cancelable}
                <Button type="secondary" onclick={() => closeModal(false)}>{cancelText || i18n.t("modal.cancel")}</Button>
            {/if}
            <Button onclick={() => closeModal(true)}>{text || i18n.t("modal.okay")}</Button>
        </div>
    </dialog>
{/if}