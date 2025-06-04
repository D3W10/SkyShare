<script lang="ts">
    import { twMerge } from "tailwind-merge";
    import { transitions } from "$lib/utils";
    import type { Snippet } from "svelte";

    interface Props {
        children?: Snippet;
        class?: string;
        title?: string;
    }

    let {
        children,
        class: className,
        title = "Untitled page"
    }: Props = $props();
</script>

<div class="h-full flex flex-col absolute inset-0" in:transitions.pageIn out:transitions.pageOut>
    <h1 class="mx-6 mt-6 mb-2 text-xl font-semibold">{title}</h1>
    <div class={twMerge("h-full px-6 pt-2 pb-6 overflow-y-auto", className)}>
        {@render children?.()}
    </div>
</div>