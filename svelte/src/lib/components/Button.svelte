<script lang="ts">
    import { twMerge } from "tailwind-merge";
    import { disable } from "$lib/data/disable.svelte";
    import { boxStyles } from "$lib/utils.svelte";
    import type { Snippet } from "svelte";
    import type { HTMLButtonAttributes } from "svelte/elements";

    interface Props extends Omit<HTMLButtonAttributes, "class" | "type"> {
        children?: Snippet;
        class?: string;
        type?: "normal" | "secondary" | "invisible";
    }

    let {
        children,
        class: className,
        type = "normal",
        disabled,
        ...rest
    }: Props = $props();
</script>

{#if type === "normal"}
    <button class={twMerge(boxStyles.basic, boxStyles.box, boxStyles.button, className)} disabled={disable.d || disabled} {...rest}>
        {@render children?.()}
    </button>
{:else if type === "secondary"}
    <button class={twMerge(boxStyles.basic, boxStyles.box, boxStyles.secondary, className)} disabled={disable.d || disabled} {...rest}>
        {@render children?.()}
    </button>
{:else if type === "invisible"}
    <button class={twMerge(boxStyles.basic, className)} disabled={disable.d || disabled} {...rest}>
        {@render children?.()}
    </button>
{/if}