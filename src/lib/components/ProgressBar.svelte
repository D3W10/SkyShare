<script lang="ts">
    import { Tween } from "svelte/motion";
    import { cubicOut } from "svelte/easing";
    import { twMerge } from "tailwind-merge";

    interface Props {
        class?: string;
        value?: number;
        indeterminate?: boolean;
    }

    let {
        class: className,
        value = $bindable(0),
        indeterminate = false
    }: Props = $props();

    const progress = new Tween(0, {
        duration: 200,
        easing: cubicOut
    });

    $effect(() => { progress.target = value; });
</script>

<div class={twMerge("w-full h-1.5 relative bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden", indeterminate ? "before:absolute before:top-0 before:bottom-0 before:left-0 before:bg-accent before:rounded-full before:inset-shadow-xs before:inset-shadow-slate-50/40 before:animate-progress-first-line after:absolute after:top-0 after:bottom-0 after:left-0 after:bg-accent after:rounded-full after:inset-shadow-xs after:inset-shadow-slate-50/40 after:animate-progress-last-line" : "", className)}>
    {#if !indeterminate}
        <div class="h-full bg-accent rounded-full inset-shadow-xs inset-shadow-slate-50/40 dark:inset-shadow-slate-50/30" style:width="{progress.current * 100}%"></div>
    {/if}
</div>