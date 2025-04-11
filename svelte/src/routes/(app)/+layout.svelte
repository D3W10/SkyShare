<script lang="ts">
    import Framebar from "$lib/components/Framebar.svelte";
    import Sidebar from "$lib/components/Sidebar.svelte";

    let { children } = $props();

    let sidebar = $state(true);
</script>

<Framebar bind:sidebar={sidebar} />
<div class="size-full flex">
    <Sidebar expanded={sidebar} />
    <main class="size-full grid bg-slate-50 dark:bg-slate-900 rounded-tl-xl ring-1 ring-slate-400/10 dark:ring-white/10 shadow-sm *:col-[1] *:row-[1]">
        {@render children()}
    </main>
</div>