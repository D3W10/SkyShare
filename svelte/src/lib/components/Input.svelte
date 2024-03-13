<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { spring } from "svelte/motion";
    import { disable } from "$lib/stores/disableStore";
    import Button from "./Button.svelte";
    import Icon from "./Icon.svelte";

    export let className: string = "";
    export let innerClassName: string = "";
    export let type: "text" | "number" | "checkbox" | "email" | "username" | "password" | "range" | "wheel" | "switch";
    export let value: any = null;
    export let placeholder: string = "";
    export let disabled: boolean = false;
    export let maxlength: number | undefined = undefined;
    export let min: number = 0;
    export let max: number = 10;
    export let step: number = 1;
    export let checked: boolean = false;
    export let error: boolean = false;
    export let errorChecking: boolean = true;
    
    let inputElm: HTMLInputElement;
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
        if (value !== null && value !== "" && errorChecking) {
            if ((type == "text" || type == "number" || type == "checkbox" || type == "range") && inputElm != undefined)
                error = !inputElm.checkValidity();
            else if (type == "email")
                error = !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value);
            else if (type == "username")
                error = !/^[a-zA-Z0-9_.-]*$/.test(value);
            else if (type == "password")
                error = !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/.test(value);
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
    <Button type="invisible" className="w-10 flex items-center p-1 !rounded-full transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary {!value ? "bg-foreground/10" : "bg-primary"}" {disabled} on:click={() => { value = !value; triggerEvent(); }}>
        <div class="w-3.5 h-3.5 bg-white rounded-full transition-all {value ? "ml-[1.125rem]" : ""}" />
    </Button>
{:else if type == "checkbox"}
    <input class="w-auto h-4 bg-foreground/10 rounded-md appearance-none disabled:opacity-50 checked:bg-primary checked:bg-check checked:bg-no-repeat checked:bg-center focus-visible:outline focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary aspect-square transition-all {className}" type="checkbox" {placeholder} disabled={disabled || $disable.d} {checked} bind:value bind:this={inputElm} on:click={() => value = !value} on:input={triggerEvent} />
{:else if type == "range"}
    <div class="flex items-center space-x-3 {className}">
        <input class="w-full h-2 p-0 bg-foreground/10 rounded-full appearance-none disabled:opacity-50" type="range" disabled={disabled || $disable.d} {min} {max} {step} bind:value bind:this={inputElm} on:input={triggerEvent} />
        <input class="!w-10 !p-0 text-right !text-base disabled:opacity-50 {innerClassName}" type="number" {value} disabled={disabled || $disable.d} on:input={rangeCheck} on:blur={(e) => e.currentTarget.value = value} />
    </div>
{:else}
    <div class="bg-foreground/10 rounded-md border-b-2 border-foreground/15 shadow-sm transition-colors duration-200 focus-within:border-primary {disabled || $disable.d ? "opacity-50" : ""} {!error || "animate-[errorGlow_0.5s_linear_infinite_alternate]"} {className}">
        {#if type == "text" || type == "email" || type == "username"}
            <input type="text" {placeholder} disabled={disabled || $disable.d} maxlength={type == "email" ? 250 : (type == "username" ? 15 : maxlength)} bind:value bind:this={inputElm} on:input={triggerEvent} />
        {:else if type == "number"}
            <input type="number" {placeholder} disabled={disabled || $disable.d} {min} {max} {step} bind:value bind:this={inputElm} on:input={triggerEvent} />
        {:else if type == "password"}
            <input type="password" {placeholder} disabled={disabled || $disable.d} maxlength={50} bind:value bind:this={inputElm} on:input={triggerEvent} />
        {:else if type == "wheel"}
            <div class="flex">
                <div class="w-full h-8 relative overflow-hidden">
                    <div class="w-full h-full absolute" style:transform="translate(0, {100 * offset}%)">
                        <p class="w-full h-full px-2 py-1.5 absolute text-sm -top-full">{Math.floor($displayed + 1) * step}</p>
                        <p class="w-full h-full px-2 py-1.5 absolute text-sm">{Math.floor($displayed) * step}</p>
                    </div>
                </div>
                <div class="h-8 px-1.5 flex flex-col justify-center">
                    <Button type="invisible" className="rounded-sm overflow-hidden transition-opacity duration-200" disabled={value == max || disabled || $disable.d} on:click={() => { value = Math.min(Math.max(value + step, min), max); triggerEvent(); }}>
                        <Icon name="chevron" className="h-4 -mb-1 fill-current -rotate-180" />
                    </Button>
                    <Button type="invisible" className="rounded-sm overflow-hidden transition-opacity duration-200" disabled={value == min || disabled || $disable.d} on:click={() => { value = Math.min(Math.max(value - step, min), max); triggerEvent(); }}>
                        <Icon name="chevron" className="h-4 -mt-1 fill-current" />
                    </Button>
                </div>
            </div>
        {/if}
    </div>
{/if}

<style lang="postcss">
    input {
        @apply text-sm font-normal border-0 outline-none;
    }

    input:focus {
        @apply ring-0;
    }

    input::placeholder {
        @apply text-foreground/50 font-medium;
    }

    input::-webkit-outer-spin-button, input::-webkit-inner-spin-button {
        @apply m-0;
        -webkit-appearance: none;
    }

    input[type="text"], input[type="number"], input[type="password"] {
        @apply w-full px-2 py-1.5 bg-transparent;
    }

    input[type="range"]::-webkit-slider-thumb {
        @apply w-4 h-4 bg-primary rounded-full appearance-none cursor-ew-resize;
    }
</style>