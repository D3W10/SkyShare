<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$lib/utils";

    onMount(() => {
        goto("/");
    });
</script>