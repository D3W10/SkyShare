<script lang="ts" module>
    export interface ComboBoxItem {
        text: string;
        value: string;
    }
</script>

<script lang="ts">
    import { cubicInOut } from "svelte/easing";
    import { twMerge } from "tailwind-merge";
    import Button from "./Button.svelte";
    import Icon from "./Icon.svelte";
    import { boxStyles, outClick } from "$lib/utils";

    interface Props {
        class?: string;
        items: ComboBoxItem[];
        value: string;
        disabled?: boolean;
        align?: "left" | "right";
        onchange?: () => unknown;
    }

    let {
        class: className,
        items,
        value = $bindable(""),
        disabled,
        align = "left",
        onchange
    }: Props = $props();

    let open = $state(false), lateOpen = $state(false);

    $effect(() => {
        if (open)
            setTimeout(() => lateOpen = true, 50);
        else
            lateOpen = open;
    });

    function itemSelected(tag: string) {
        open = false;

        if (value !== tag) {
            value = tag;
            onchange?.();
        }
    }

    function expand(node: Element, { duration }: { duration: number }) {
        return {
            duration,
            css: (t: number) => {
                const eased = cubicInOut(t);

                return `
                    opacity: ${eased};
                    transform: scale(${0.7 + 0.3 * eased});
                `;
            }
        };
    }
</script>

<div class="relative" use:outClick onoutclick={() => { if (open) open = !open; }}>
    <Button type="secondary" class={twMerge("pl-3 pr-2.5 justify-between items-center gap-x-1 disabled:opacity-50 transition-opacity duration-200", className)} {disabled} onclick={() => open = !open}>
        <p class="text-sm text-left text-ellipsis whitespace-nowrap overflow-hidden">{items.find(i => i.value === value) ? items.find(i => i.value === value)!.text : items[0].text}</p>
        <Icon name="arrowRight" class="size-4 min-w-4 {!open ? "rotate-90" : "-rotate-90"} transition-transform duration-200 ease-out" />
    </Button>
    {#if open}
        <div class={twMerge(boxStyles.box, "p-1.5 flex-col absolute left-0 right-0 top-10 z-1 before:border-0", align === "left" ? "origin-top-left" : "origin-top-right")} transition:expand={{ duration: 200 }}>
            {#each items as item, i}
                <Button type="invisible" class={twMerge("px-2 py-1 text-sm text-left font-medium hover:bg-slate-200 hover:dark:bg-slate-800 rounded-sm transition-colors duration-200", i === 0 ? "rounded-t-lg" : i === items.length - 1 ? "rounded-b-lg" : "")} onclick={() => itemSelected(item.value)}>{item.text}</Button>
                {#if i !== items.length - 1}
                    <hr class="h-0.5 my-1 bg-slate-200 dark:bg-slate-800 border-0 rounded-full" />
                {/if}
            {/each}
        </div>
    {/if}
</div>