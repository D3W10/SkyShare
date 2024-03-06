<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { spring } from "svelte/motion";
    import Button from "./Button.svelte";
    import Icon from "./Icon.svelte";

    export let className: string = "";
    export let innerClassName: string = "";
    export let type: "text" | "number" | "checkbox" | "range" | "ip" | "wheel" | "switch";
    export let value: any = null;
    export let placeholder: string = "";
    export let maxlength: number | undefined = undefined;
    export let min: number = 0;
    export let max: number = 10;
    export let step: number = 1;
    export let checked: boolean = false;
    
    let error = false, inputElm: HTMLInputElement;
    const displayed = spring(), dispatch = createEventDispatcher<{ input: { value: any } }>();

    $: {
        if (type == "range" && value === null)
            value = min;
        else if (type == "wheel" && value === null)
            value = min;
        else if (type == "switch" && value === null)
            value = false;
    }
    
    $: displayed.set(value / step);
    $: offset = ((n: number, m: number) => ((n % m) + m) % m)($displayed, 1);

    $: {
        if (value !== null && value !== "") {
            if ((type == "text" || type == "number" || type == "checkbox" || type == "range") && inputElm != undefined)
                error = !inputElm.checkValidity();
            else if (type == "ip")
                error = !/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/g.test(value);
        }
        else
            error = false;
    }

    function triggerEvent() {
        dispatch("input", { value });
    }

    function rangeCheck(e: Event & { currentTarget: EventTarget & HTMLInputElement; }) {
        if (+e.currentTarget.value >= min && +e.currentTarget.value <= max) {
            value = +e.currentTarget.value;
            triggerEvent();
        }
    }
</script>

{#if type == "switch"}
    <Button type="invisible" className={`w-10 flex items-center p-1 rounded-full transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${!value ? "bg-tertiary" : "bg-primary"}`} on:click={() => { value = !value; triggerEvent(); }}>
        <div class={`w-3.5 h-3.5 bg-white rounded-full transition-all ${value ? "ml-[1.125rem]" : ""}`} />
    </Button>
{:else if type == "checkbox"}
    <input class="w-4 h-4 bg-tertiary rounded appearance-none checked:bg-primary checked:bg-check focus-visible:outline focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary" type="checkbox" {placeholder} {checked} bind:value bind:this={inputElm} on:click={() => value = !value} on:input={triggerEvent} />
{:else if type == "range"}
    <div class={`flex items-center space-x-3 ${className}`}>
        <input class="w-full h-2 p-0 bg-tertiary rounded-full appearance-none" type="range" {min} {max} {step} bind:value bind:this={inputElm} on:input={triggerEvent} />
        <input class={`w-10 p-0 text-right text-base ${innerClassName}`} type="number" {value} on:input={rangeCheck} on:blur={(e) => e.currentTarget.value = value} />
    </div>
{:else}
    <div class={`bg-slate-900/10 rounded-md border-b-2 border-slate-900/15 transition-all duration-200 ${!error || "bg-red-100"} ${className}`}>
        {#if type == "text"}
            <input type="text" {placeholder} {maxlength} bind:value bind:this={inputElm} on:input={triggerEvent} />
        {:else if type == "number"}
            <input type="number" {placeholder} {min} {max} {step} bind:value bind:this={inputElm} on:input={triggerEvent} />
        {:else if type == "ip"}
            <input type="text" {placeholder} maxlength={15} bind:value bind:this={inputElm} on:input={triggerEvent} />
        {:else if type == "wheel"}
            <div class="flex">
                <div class="w-full h-8 relative overflow-hidden">
                    <div class="w-full h-full absolute" style="transform: translate(0, {100 * offset}%)">
                        <p class="w-full h-full px-2 py-1.5 absolute text-sm -top-full">{Math.floor($displayed + 1) * step}</p>
                        <p class="w-full h-full px-2 py-1.5 absolute text-sm">{Math.floor($displayed) * step}</p>
                    </div>
                </div>
                <div class="h-8 px-1.5 flex flex-col justify-center">
                    <Button type="invisible" className="rounded-sm overflow-hidden transition-opacity duration-200 disabled:opacity-50" disabled={value == max} on:click={() => { value = Math.min(Math.max(value + step, min), max); triggerEvent(); }}>
                        <Icon name="chevron" className="h-4 -mb-1 fill-current -rotate-180" />
                    </Button>
                    <Button type="invisible" className="rounded-sm overflow-hidden transition-opacity duration-200 disabled:opacity-50" disabled={value == min} on:click={() => { value = Math.min(Math.max(value - step, min), max); triggerEvent(); }}>
                        <Icon name="chevron" className="h-4 -mt-1 fill-current" />
                    </Button>
                </div>
            </div>
        {/if}
    </div>
{/if}

<style lang="postcss">
    input {
        @apply w-full px-2 py-1.5 text-sm font-normal bg-transparent border-0 ring-0 outline-none;
    }

    input:focus {
        @apply ring-0;
    }

    input::placeholder {
        @apply text-shade/50 font-medium;
    }

    input::-webkit-outer-spin-button, input::-webkit-inner-spin-button {
        @apply m-0;
        -webkit-appearance: none;
    }

    input[type="range"]::-webkit-slider-thumb {
        @apply w-4 h-4 bg-primary rounded-full appearance-none cursor-ew-resize;
    }
</style>