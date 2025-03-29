<script lang="ts">
    import { twMerge } from "tailwind-merge";
    import type { IconT } from "$lib/models/IconT.type";

    interface Props {
        class?: string;
        name: IconT;
    }

    let {
        class: className,
        name
    }: Props = $props();

    const iconPromise = import(`$lib/icons/${name}.svg?raw`);
</script>

{#await iconPromise then icon} 
    <icon class={twMerge("flex justify-center items-center", className)}>
        {@html icon.default}
    </icon>
{/await}