<script lang="ts">
    import { twMerge } from "tailwind-merge";
    import Link from "./Link.svelte";
    import Button from "./Button.svelte";
    import Icon from "./Icon.svelte";
    import { boxStyles } from "$lib/utils";
    import type { Snippet } from "svelte";
    import type { IconT } from "$lib/models/IconT.type";

    interface Props {
        children?: Snippet;
        class?: string;
        type?: "link" | "button";
        icon: IconT;
        href?: string;
        onclick?: () => unknown;
    }

    let {
        children,
        class: className,
        type = "link",
        icon,
        href,
        onclick
    }: Props = $props();

    const hasText = $derived(children !== undefined);
</script>

{#if type === "link"}
    <Link type="invisible" {href} class={twMerge(boxStyles.pane, "w-fit py-1.5 gap-x-2 text-sm font-medium rounded-full", hasText ? "pl-3 pr-4" : "px-3", className)}>
        <Icon name={icon} class="size-5" />
        {#if hasText}
            <p>{@render children?.()}</p>
        {/if}
    </Link>
{:else}
    <Button type="invisible" class={twMerge(boxStyles.pane, "w-fit py-1.5 gap-x-2 text-sm font-medium rounded-full cursor-pointer", hasText ? "pl-3 pr-4" : "px-3", className)} {onclick}>
        <Icon name={icon} class="size-5" />
        {#if hasText}
            <p>{@render children?.()}</p>
        {/if}
    </Button>
{/if}