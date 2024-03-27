<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { slide } from "svelte/transition";
    import { transition } from "$lib/stores/transitionStore";
    import Button from "./Button.svelte";
    import Icon from "./Icon.svelte";
    import { outsideClick } from "../outsideClick";

    export let className: string = "";
    export let items: string[];
    export let selected: number = 0;
    export let disabled: boolean = false;
    export let listClassName: string = "";
    export let listReverse: boolean = false;

    let open = false, closedCss = !listReverse ? "" : "-rotate-180", openCss = !listReverse ? "-rotate-180" : "rotate-0";
    const dispatch = createEventDispatcher<{ change: { selected: number } }>();
    $: selectedItem = items[selected];

    function itemSelected(index: number) {
        if (selected != index) {
            selected = index;

            dispatch("change", { selected: index });
        }
    }
</script>

<div use:outsideClick on:outclick={() => { if (open) open = !open; }}>
    <Button type="invisible" className="block relative {!open ? "z-10" : "z-20"} {className}" {disabled} on:click={() => open = !open}>
        <div class="px-2 py-1.5 flex justify-between items-center bg-secondary rounded-md border-b-2 {!open ? "border-foreground/15" : "border-primary"} shadow-sm ring-1 ring-foreground/10 transition-colors">
            <p class="text-sm">{selectedItem}</p>
            <Icon name="chevron" className="w-5 h-5 ml-2 fill-current transition-transform duration-[400ms] ease-quint-out {!open ? closedCss : openCss}" />
        </div>
        {#if open}
            <div class="w-full absolute {!listReverse ? "top-6" : "bottom-6"} bg-secondary rounded-md shadow-xl ring-1 ring-foreground/10 overflow-hidden -z-10" transition:slide={$transition.comboFlow}>
                <div id="comboboxItems" class="max-h-[7.5rem] flex flex-col bg-foreground/5 divide-y divide-foreground/10 overflow-y-auto {listClassName}">
                    {#each items as item, i}
                        <Button type="invisible" className="px-2 py-1.5 text-left text-sm hover:bg-foreground/5 !rounded-none {i == 0 && !listReverse ? "pt-4" : (i == items.length - 1 && listReverse ? "pb-3.5" : "")}" on:click={() => itemSelected(i)}>{item}</Button>
                    {/each}
                </div>
            </div>
        {/if}
    </Button>
</div>