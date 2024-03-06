<script lang="ts">
    import { tweened } from "svelte/motion";
    import { cubicOut } from "svelte/easing";

    export let className: string = "";
    export let value: number = 0;
    export let indeterminate: boolean = false;

    const progress = tweened(0, {
        duration: 400,
        easing: cubicOut
    });

    $: progress.set(value);
</script>

<div class={`w-full h-1 relative bg-foreground/10 rounded-full overflow-hidden ${indeterminate ? "indeterminate" : ""} ${className}`}>
    {#if !indeterminate}
        <div class="h-full bg-primary rounded-full" style="width: {$progress}%;" />
    {/if}
</div>

<style lang="postcss">
    .indeterminate::before, .indeterminate::after {
        @apply content-[""] absolute top-0 left-0 bottom-0 bg-primary rounded-full;
    }

    .indeterminate::before {
        animation: progressFirstLine 2100ms cubic-bezier(0.65, 0.81, 0.73, 0.4) infinite;
    }

    .indeterminate::after {
        animation: progressLastLine 2100ms cubic-bezier(0.16, 0.84, 0.44, 1) 1150ms infinite;
    }

    @keyframes progressFirstLine {
        0% {
            left: -35%;
            right: 100%;
        }

        60%, 100% {
            left: 100%;
            right: -90%;
        }
    }

    @keyframes progressLastLine {
        0% {
            left: -200%;
            right: 100%;
        }

        60%, 100% {
            left: 107%;
            right: -8%;
        }
    }
</style>