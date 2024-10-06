<script lang="ts">
    import { twMerge } from "tailwind-merge";

    export let className: string = "";
    export let invert: boolean = false;
</script>

<div class={twMerge(`h-full flex p-5 space-x-[6%] ${!invert ? "first:*:w-[40%] last:*:w-[54%]" : "first:*:w-[54%] last:*:w-[40%]"}`, className)}>
    <slot name="left" />
    <slot name="right" />
</div>