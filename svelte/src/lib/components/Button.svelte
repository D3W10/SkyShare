<script lang="ts">
    export let type: "visible" | "invisible" = "visible";
    export let className: string = "";
    export let disabled: boolean = false;
    export let secondary: boolean = false;
</script>

{#if type == "visible"}
    <button class={`px-4 py-1.5 flex justify-center items-center relative text-sm ${!secondary ? "text-white bg-primary" : "bg-tertiary"} disabled:opacity-50 disabled:bg-tertiary rounded-lg transition-colors overflow-hidden z-0 before:block disabled:before:hidden before:left-1/2 before:right-1/2 before:aspect-square before:absolute ${!secondary ? "before:bg-black/20" : "before:bg-slate-900/5"} before:rounded-full before:transition-all before:duration-[400ms] before:ease-cubic-out before:-z-10 hover:before:-left-3 hover:before:-right-3 ${className}`} {disabled} on:click>
        <slot />
    </button>
{:else}
    <button class={className} {disabled} on:click>
        <slot />
    </button>
{/if}