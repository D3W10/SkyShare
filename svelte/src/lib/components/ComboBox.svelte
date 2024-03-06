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
    <Button type="invisible" className={`block relative rounded-md ${!open ? "z-10" : "z-20"} ${className}`} on:click={() => open = !open}>
        <div class="px-2 py-1.5 flex justify-between items-center bg-tertiary text-left rounded-md">
            <span class="text-sm">{selectedItem}</span>
            <Icon name="chevron" className={`w-5 h-5 ml-2 fill-current transition-transform duration-[400ms] ease-quint-out ${!open ? closedCss : openCss}`} />
        </div>
        {#if open}
            <div class={`w-full absolute ${!listReverse ? "top-6" : "bottom-6"} bg-tertiary rounded-md overflow-hidden -z-10`} transition:slide={$transition.comboFlow}>
                <div id="comboboxItems" class={`max-h-[7.5rem] flex flex-col bg-slate-900/5 overflow-y-scroll ${listClassName}`}>
                    {#each items as item, i}
                        <button class={`px-2 py-1.5 text-left text-sm ${i == 0 && !listReverse ? "pt-3.5" : (i == items.length - 1 && listReverse ? "pb-3.5" : "")}`} on:click={() => itemSelected(i)}>{item}</button>
                    {/each}
                </div>
            </div>
        {/if}
    </Button>
</div>