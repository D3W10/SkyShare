<script lang="ts">
    import type { IconType } from "$lib/models/IconType.type";
    import Icon from "./Icon.svelte";

    export let text: string;
    export let icon: IconType;
</script>

<button class="w-full p-4 flex items-center bg-slate-900/10 hover:bg-slate-900/15 rounded-xl space-x-3 backdrop-blur transition-colors" on:click>
    <Icon name={icon} className="w-8" />
    <p class="text-lg font-semibold">{text}</p>
</button>