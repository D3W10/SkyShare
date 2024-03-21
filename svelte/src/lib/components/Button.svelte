<script lang="ts">
    import { disable } from "$lib/stores/disableStore";

    export let type: "normal" | "small" | "text" | "invisible" = "normal";
    export let className: string = "";
    export let disabled: boolean = false;
    export let secondary: boolean = false;
    export let submit: boolean = false;
    export let modal: boolean = false;
</script>

{#if type == "normal" || type == "small"}
    <button class="flex justify-center items-center relative {type == "normal" ? "px-6 py-2 font-semibold rounded-xl" : "px-4 py-1.5 text-sm rounded-lg"} {!secondary ? "text-white bg-primary" : "text-primary hover:text-background disabled:hover:text-primary bg-foreground/10"} disabled:opacity-50 transition duration-[400ms] overflow-hidden z-0 before:block disabled:before:hidden before:left-1/2 before:right-1/2 before:aspect-square before:absolute {!secondary ? "before:bg-foreground/10" : "before:bg-primary"} before:rounded-full before:transition-all before:duration-[400ms] before:-z-10 hover:before:-left-3 hover:before:-right-3 {className}" disabled={disabled || $disable.d && !modal} type={!submit ? "button" : "submit"} on:click>
        <slot />
    </button>
{:else if type == "text"}
    <button class="px-1 flex justify-center items-center text-primary text-center font-semibold rounded-md disabled:opacity-50 transition-colors {className}" disabled={disabled || $disable.d && !modal} type={!submit ? "button" : "submit"} on:click>
        <slot />
    </button>
{:else if type == "invisible"}
    <button class="rounded-md disabled:opacity-50 transition {className}" disabled={disabled || $disable.d && !modal} type={!submit ? "button" : "submit"} on:click>
        <slot />
    </button>
{/if}