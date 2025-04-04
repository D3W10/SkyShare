<script lang="ts">
    import { scale } from "svelte/transition";
    import { cubicOut } from "svelte/easing";
    import { twMerge } from "tailwind-merge";
    import Link from "./Link.svelte";
    import Icon from "./Icon.svelte";
    import { boxStyles } from "$lib/utils.svelte";
    import type { Snippet } from "svelte";
    import type { IconT } from "$lib/models/IconT.type";

    interface Props {
        children?: Snippet;
        class?: string;
        icon: IconT;
        href: string;
        selected?: boolean;
    }

    let {
        children,
        class: className,
        icon,
        href,
        selected = false
    }: Props = $props();
</script>

<Link class={twMerge("px-3 py-2 flex items-center gap-x-3 relative hover:text-slate-800 font-medium rounded-xl transition-colors duration-200 group z-0", !selected ? "text-slate-600" : "text-slate-800", boxStyles.basic, className)} {href} type="invisible">
    {#if selected}
        <div class={twMerge(boxStyles.box, "absolute inset-0 -z-1")} transition:scale={{ duration: 200, start: 0.95, easing: cubicOut }}></div>
    {/if}
    <Icon name={icon} class="w-5.5 min-w-5.5 {!selected ? "text-slate-500" : "text-slate-800"} group-hover:text-slate-700 transition-colors duration-200" />
    {@render children?.()}
</Link>