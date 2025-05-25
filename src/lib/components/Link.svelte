<script lang="ts">
    import { twMerge } from "tailwind-merge";
    import { base } from "$app/paths";
    import { disable } from "$lib/data/disable.svelte";
    import { boxStyles } from "$lib/utils.svelte";
    import type { Snippet } from "svelte";
    import type { HTMLAnchorAttributes } from "svelte/elements";

    interface Props extends Omit<HTMLAnchorAttributes, "class" | "type"> {
        children?: Snippet;
        class?: string;
        type?: "normal" | "button" | "secondary" | "invisible";
        disabled?: boolean;
    }

    let {
        children,
        class: className,
        href,
        type = "normal",
        disabled = false,
        ...rest
    }: Props = $props();
</script>

{#if type === "normal"}
    <a class={twMerge(boxStyles.basic, boxStyles.href, "disabled:pointer-events-none", className)} href={href ? base + href : undefined} data-disabled={disable.d || disabled || null} {...rest}>
        {@render children?.()}
    </a>
{:else if type === "button"}
    <a class={twMerge(boxStyles.basic, boxStyles.box, boxStyles.button, "disabled:pointer-events-none", className)} href={href ? base + href : undefined} data-disabled={disable.d || disabled || null} {...rest}>
        {@render children?.()}
    </a>
{:else if type === "secondary"}
    <a class={twMerge(boxStyles.basic, boxStyles.box, boxStyles.secondary, "disabled:pointer-events-none", className)} href={href ? base + href : undefined} data-disabled={disable.d || disabled || null} {...rest}>
        {@render children?.()}
    </a>
{:else if type === "invisible"}
    <a class={twMerge(boxStyles.basic, "disabled:pointer-events-none", className)} href={href ? base + href : undefined} data-disabled={disable.d || disabled || null} {...rest}>
        {@render children?.()}
    </a>
{/if}