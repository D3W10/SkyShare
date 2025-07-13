<script lang="ts">
    import { twMerge } from "tailwind-merge";
    import { disable } from "$lib/data/disable.svelte";
    import { boxStyles } from "$lib/utils";
    import type { Snippet } from "svelte";
    import type { HTMLInputAttributes } from "svelte/elements";

    interface Props extends Omit<HTMLInputAttributes, "class" | "value"> {
        children?: Snippet;
        class?: string;
        value?: any;
    }

    let {
        children,
        class: className,
        type = "text",
        value = $bindable(),
        disabled,
        onbeforeinput,
        ...rest
    }: Props = $props();

    function onBeforeInput(e: InputEvent & { currentTarget: EventTarget & HTMLInputElement; }) {
        if (type === "number") {
            if (e.data && isNaN(+e.data))
                e.preventDefault();
        }

        onbeforeinput?.(e);
    }
</script>

<input class={twMerge(boxStyles.basic, boxStyles.pane, "px-2.5 py-1 disabled:text-slate-500 placeholder:text-slate-400 dark:placeholder:text-slate-600 rounded-lg transition-colors duration-200", className)} {type} bind:value disabled={disable.d || disabled} onbeforeinput={onBeforeInput} {...rest} />