<script lang="ts">
    import Button from "./Button.svelte";
    import Icon from "./Icon.svelte";

    export let pressed: boolean;
    export let secondary: boolean = false;
</script>

<Button type="small" className="w-fit" {secondary} on:click>
    <div class="pr-1 flex justify-center items-center {!pressed ? "opacity-100" : "opacity-0"} space-x-2 transition-opacity duration-200 {!pressed ? "delay-200 ease-out" : "ease-in"}">
        <slot />
    </div>
    <Icon name="check" className="h-6 absolute {!pressed ? "opacity-0" : "opacity-100"} transition-opacity duration-200 {!pressed ? "ease-in" : "delay-200 ease-out"}" />
</Button>