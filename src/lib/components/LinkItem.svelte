<script lang="ts">
    import { scale } from "svelte/transition";
    import { cubicOut } from "svelte/easing";
    import { twMerge } from "tailwind-merge";
    import { disable } from "$lib/data/disable.svelte";
    import Link from "./Link.svelte";
    import Icon from "./Icon.svelte";
    import { boxStyles } from "$lib/utils";
    import type { Snippet } from "svelte";
    import type { HTMLAnchorAttributes } from "svelte/elements";
    import type { IconT } from "$lib/models/IconT.type";

    interface Props extends Omit<HTMLAnchorAttributes, "class" | "type"> {
        children?: Snippet;
        class?: string;
        icon?: IconT;
        selected?: boolean;
    }

    let {
        children,
        class: className,
        icon,
        href,
        selected = false,
        ...rest
    }: Props = $props();
</script>

<Link class={twMerge("w-full px-3 py-2 flex items-center gap-x-3 relative hover:text-slate-800 dark:hover:text-slate-300 font-medium rounded-xl group z-0 [&_p,&_svg]:transition-colors [&_p,&_svg]:duration-200", disable.d ? "opacity-50" : "", !selected ? "text-slate-600 dark:text-slate-500" : "text-slate-800 dark:text-slate-300", boxStyles.basic, className)} {href} type="invisible" {...rest}>
    {#if selected}
        <div class={twMerge(boxStyles.box, "absolute inset-0 -z-1")} transition:scale={{ duration: 200, start: 0.95, easing: cubicOut }}></div>
    {/if}
    {#if icon}
        <Icon name={icon} class="w-5.5 min-w-5.5 {!selected ? "text-slate-500 dark:text-slate-600 group-hover:text-slate-700 dark:group-hover:text-slate-400" : "text-slate-800 dark:text-slate-300"}" />
    {/if}
    {@render children?.()}
</Link>