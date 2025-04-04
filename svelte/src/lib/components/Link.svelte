<script lang="ts">
    import { twMerge } from "tailwind-merge";
    import { boxStyles } from "$lib/utils.svelte";
    import type { Snippet } from "svelte";
    import type { HTMLAnchorAttributes } from "svelte/elements";

    interface Props extends Omit<HTMLAnchorAttributes, "class" | "type"> {
        children?: Snippet;
        class?: string;
        type?: "normal" | "button" | "secondary" | "invisible";
    }

    let {
        children,
        class: className,
        type = "normal",
        ...rest
    }: Props = $props();
</script>

{#if type === "normal"}
    <a class={twMerge(boxStyles.basic, boxStyles.href, className)} {...rest}>
        {@render children?.()}
    </a>
{:else if type === "button"}
    <a class={twMerge(boxStyles.basic, boxStyles.box, boxStyles.button, className)} {...rest}>
        {@render children?.()}
    </a>
{:else if type === "secondary"}
    <a class={twMerge(boxStyles.basic, boxStyles.box, boxStyles.secondary, className)} {...rest}>
        {@render children?.()}
    </a>
{:else if type === "invisible"}
    <a class={twMerge(boxStyles.basic, className)} {...rest}>
        {@render children?.()}
    </a>
{/if}