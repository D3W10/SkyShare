<script lang="ts">
    import { fade } from "svelte/transition";
    import { page } from "$app/state";
    import { i18n } from "$lib/data/i18n.svelte";
    import { disable, setLock } from "$lib/data/disable.svelte";
    import { error, hideError } from "$lib/data/error.svelte";
    import Framebar from "$lib/components/Framebar.svelte";
    import Sidebar from "$lib/components/Sidebar.svelte";
    import ProgressBar from "$lib/components/ProgressBar.svelte";
    import Dialog from "$lib/components/Dialog.svelte";

    let { children } = $props();

    let sidebar = $state(true);

    const accentColor = $derived(
        page.url.pathname.startsWith("/send") ? ["--color-send", "--color-send-light", "--color-send-dark"] :
        page.url.pathname.startsWith("/receive") ? ["--color-receive", "--color-receive-light", "--color-receive-dark"] :
        page.url.pathname.startsWith("/settings") ? ["--color-settings", "--color-settings-light", "--color-settings-dark"] :
        page.url.pathname.startsWith("/account") ? ["--color-account", "--color-account-light", "--color-account-dark"] :
        ["--color-home", "--color-home-light", "--color-home-dark"]
    );
</script>

<Framebar bind:sidebar />
<div class="size-full flex" style:--color-accent={`var(${accentColor[0]})`} style:--color-accent-light={`var(${accentColor[1]})`} style:--color-accent-dark={`var(${accentColor[2]})`}>
    <Sidebar expanded={sidebar} />
    <main class="h-full flex flex-1 relative bg-slate-50 dark:bg-slate-900 rounded-tl-xl ring-1 ring-slate-400/10 dark:ring-slate-50/10 shadow-sm overflow-hidden">
        {#if disable.loading}
            <div class="absolute top-0 left-0 right-0" transition:fade={{ duration: 200 }}>
                <ProgressBar class="rounded-none" indeterminate />
            </div>
        {/if}
        {@render children()}
    </main>
    <div class="fixed inset-0 bg-[size:250%] opacity-50 animate-wave -z-1 [--aurora-color:var(--color-accent-light)] dark:[--aurora-color:var(--color-accent-dark)]" style:background-image="linear-gradient(50deg, transparent, var(--aurora-color), transparent, var(--aurora-color), transparent)" transition:fade={{ duration: 200 }}></div>
    <div class="fixed inset-0 bg-blue-900/10 -z-2"></div>
    <Dialog bind:show={error.show} title={i18n.t("dialog." + error.e, error.vars).toString()} cancelable={false} onsubmit={() => hideError()}>
        <p>{i18n.t(`dialog.${error.e}Desc`, error.vars)}</p>
    </Dialog>
</div>