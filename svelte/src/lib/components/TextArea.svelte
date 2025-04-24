<script lang="ts">
    import { twMerge } from "tailwind-merge";
    import { disable } from "$lib/data/disable.svelte";
    import { boxStyles } from "$lib/utils.svelte";
    import type { Snippet } from "svelte";
    import type { HTMLTextareaAttributes } from "svelte/elements";

    interface Props extends Omit<HTMLTextareaAttributes, "class" | "value"> {
        children?: Snippet;
        class?: string;
        value: any;
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

<textarea class={twMerge(boxStyles.basic, boxStyles.pane, "px-2.5 py-1 placeholder:text-slate-500 rounded-lg", className)} bind:value disabled={disable.d || disabled} {...rest}></textarea>