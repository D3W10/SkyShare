<script lang="ts" module>
    export interface ComboBoxItem {
        text: string;
        value: string;
    }
</script>

<script lang="ts">
    import { twMerge } from "tailwind-merge";
    import Button from "./Button.svelte";
    import Icon from "./Icon.svelte";
    import { boxStyles, outClick } from "$lib/utils.svelte";

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

    let open = $state(false);

    function itemSelected(tag: string) {
        if (value !== tag) {
            value = tag;
            onchange?.();
        }
    }
</script>

<div use:outClick onoutclick={() => { if (open) open = !open; }}>
    <Button type="secondary" class={twMerge("pl-3 pr-2.5", open ? "z-1" : "", className)} {disabled} onclick={() => open = !open}>
        <div class="w-full flex justify-between items-center gap-x-1">
            <p class="text-sm text-left text-ellipsis whitespace-nowrap overflow-hidden">{items.find(i => i.value === value) ? items.find(i => i.value === value)!.text : items[0].text}</p>
            <Icon name="arrowRight" class="size-4 min-w-4 {!open ? "rotate-90" : "-rotate-90"} transition-transform duration-200 ease-out" />
        </div>
        {#if open}
            <div class={twMerge(boxStyles.box, "p-1.5 flex-col absolute left-0 right-0 top-10 z-1 before:border-0")}>
                {#each items as item, i}
                    <Button type="invisible" class={twMerge("px-2 py-1 text-sm text-left hover:bg-slate-200 hover:dark:bg-slate-800 rounded-sm transition-colors duration-200", i === 0 ? "rounded-t-lg" : i === items.length - 1 ? "rounded-b-lg" : "")} onclick={() => itemSelected(item.value)}>{item.text}</Button>
                    {#if i !== items.length - 1}
                        <hr class="h-0.5 my-1 bg-slate-200 dark:bg-slate-700 border-0 rounded-full" />
                    {/if}
                {/each}
            </div>
                <div id="comboboxItems" class={twMerge(`max-h-[7.5rem] flex flex-col bg-foreground/5 divide-y divide-foreground/10 overflow-y-auto`, listClassName)}>
                    {#each items as item, i}
                        <Button type="invisible" className="px-2 py-1.5 text-left text-sm hover:bg-foreground/5 !rounded-none {i == 0 && !listReverse ? "pt-4" : (i == items.length - 1 && listReverse ? "pb-3.5" : "")}" on:click={() => itemSelected(i)}>{item}</Button>
                    {/each}
                </div>
            </div>
        {/if}
    </Button>
</div>