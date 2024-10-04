<script lang="ts">
    export let className: string = "";
    export let invert: boolean = false;
</script>

<div class="h-full flex p-5 space-x-11 {!invert ? "first:*:w-11/25 last:*:w-14/25" : "first:*:w-14/25 last:*:w-11/25"} {className}">
    <slot name="left" />
    <slot name="right" />
</div>