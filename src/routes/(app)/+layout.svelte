<script lang="ts">
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";
    import { page } from "$app/state";
    import { base } from "$app/paths";
    import { i18n } from "$lib/data/i18n.svelte";
    import { app } from "$lib/data/app.svelte";
    import { disable } from "$lib/data/disable.svelte";
    import { settings } from "$lib/data/settings.svelte";
    import { error, hideError } from "$lib/data/error.svelte";
    import Framebar from "$lib/components/Framebar.svelte";
    import Sidebar from "$lib/components/Sidebar.svelte";
    import ProgressBar from "$lib/components/ProgressBar.svelte";
    import Dialog from "$lib/components/Dialog.svelte";

    let { children } = $props();

    const accentColor = $derived(
        page.url.pathname.startsWith(base + "/send") ? ["--color-send", "--color-send-light", "--color-send-dark"] :
        page.url.pathname.startsWith(base + "/receive") ? ["--color-receive", "--color-receive-light", "--color-receive-dark"] :
        page.url.pathname.startsWith(base + "/settings") ? ["--color-settings", "--color-settings-light", "--color-settings-dark"] :
        page.url.pathname.startsWith(base + "/account") ? ["--color-account", "--color-account-light", "--color-account-dark"] :
        ["--color-home", "--color-home-light", "--color-home-dark"]
    );

    onMount(() => app.winReady());
</script>

<Framebar bind:sidebar={settings.sidebarCollapsed} />
<div class="size-full flex" style:--color-accent={`var(${accentColor[0]})`} style:--color-accent-light={`var(${accentColor[1]})`} style:--color-accent-dark={`var(${accentColor[2]})`}>
    <Sidebar collapsed={settings.sidebarCollapsed} />
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