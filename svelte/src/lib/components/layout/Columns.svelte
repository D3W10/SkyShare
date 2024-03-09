<script lang="ts">
    export let className: string = "";
</script>

<div class="h-full flex p-5 space-x-11 columns {className}">
    <slot name="left" />
    <slot name="right" />
</div>

<style lang="postcss">
    .columns :global(> :first-child) {
        @apply w-11/25;
    }

    .columns :global(> :last-child) {
        @apply w-14/25;
    }
</style>