<script lang="ts">
    import type { IconType } from "$lib/models/IconType.type";
    import Icon from "./Icon.svelte";

    export let text: string;
    export let icon: IconType;
</script>

<button class="w-full p-4 flex items-center bg-shade/10 hover:bg-shade/15 rounded-xl space-x-3 backdrop-blur transition-colors" on:click>
    <Icon name={icon} className="w-8" />
    <span class="text-lg font-semibold">{text}</span>
</button>