<script lang="ts">
    import Button from "./Button.svelte";
    import Icon from "./Icon.svelte";
    import type { IconType } from "$lib/models/IconType.type";

    export let text: string;
    export let icon: IconType;
</script>

<Button type="invisible" className="w-full p-4 flex items-center bg-foreground/10 hover:bg-foreground/15 rounded-xl space-x-3 backdrop-blur transition-colors" on:click>
    <Icon name={icon} className="w-8" />
    <p class="text-lg font-semibold">{text}</p>
</Button>