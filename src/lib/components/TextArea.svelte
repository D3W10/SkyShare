<script lang="ts">
    import { twMerge } from "tailwind-merge";
    import { disable } from "$lib/data/disable.svelte";
    import { boxStyles } from "$lib/utils";
    import type { Snippet } from "svelte";
    import type { HTMLTextareaAttributes } from "svelte/elements";

    interface Props extends Omit<HTMLTextareaAttributes, "class" | "value"> {
        children?: Snippet;
        class?: string;
        value?: any;
    }

    let {
        children,
        class: className,
        value = $bindable(),
        disabled,
        onbeforeinput,
        ...rest
    }: Props = $props();
</script>

<textarea class={twMerge(boxStyles.basic, boxStyles.pane, "px-3 py-1.5 disabled:text-slate-500 placeholder:text-slate-400 dark:placeholder:text-slate-600 rounded-lg transition-colors duration-200", className)} bind:value disabled={disable.d || disabled} {...rest}></textarea>