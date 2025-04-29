<script lang="ts">
    import { twMerge } from "tailwind-merge";
    import Button from "./Button.svelte";

    interface Props {
        class?: string;
        value?: boolean;
        disabled?: boolean;
    }

    let {
        class: className,
        value = $bindable(false),
        disabled
    }: Props = $props();
</script>

<Button type="invisible" class={twMerge("min-w-10 p-1 rounded-full ring-1 ring-slate-400/25 shadow-2xs enabled:cursor-pointer transition-colors duration-200", !value ? "bg-slate-200 dark:bg-slate-900" : "bg-accent disabled:bg-slate-400 dark:disabled:bg-slate-600 inset-shadow-sm inset-shadow-slate-50/15", className)} {disabled} onclick={() => value = !value}>
    <div class="size-3.5 bg-slate-50 rounded-full shadow-sm transition-all {value ? "ml-[1.125rem]" : ""}"></div>
</Button>