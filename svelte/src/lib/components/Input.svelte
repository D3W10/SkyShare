<script lang="ts">
    import { twMerge } from "tailwind-merge";
    import { disable } from "$lib/data/disable.svelte";
    import { boxStyles } from "$lib/utils.svelte";
    import type { Snippet } from "svelte";
    import type { HTMLInputAttributes } from "svelte/elements";

    interface Props extends Omit<HTMLInputAttributes, "class" | "value"> {
        children?: Snippet;
        class?: string;
        value: any;
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

<input class={twMerge(boxStyles.basic, boxStyles.pane, "px-2.5 py-1 placeholder:text-slate-500 rounded-lg", className)} {type} bind:value disabled={disable.d || disabled} onbeforeinput={onBeforeInput} {...rest} />