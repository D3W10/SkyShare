<script lang="ts">
    import { onMount } from "svelte";
    import { i18n } from "$lib/stores/i18nStore";
    import { app } from "$lib/stores/appStore";
    import { info } from "$lib/stores/infoStore";
    import { page, type pages } from "$lib/stores/pageStore";
    import { account } from "$lib/stores/accountStore";
    import { settings } from "$lib/stores/settingsStore";
    import { error } from "$lib/stores/errorStore";
    import { disable } from "$lib/stores/disableStore";
    import FrameBar from "$lib/components/FrameBar.svelte";
    import SideBar from "$lib/components/SideBar.svelte";
    import ProgressBar from "$lib/components/ProgressBar.svelte";
    import Modal from "$lib/components/Modal.svelte";
    import Home from "$lib/pages/Home.svelte";
    import Send from "$lib/pages/Send.svelte";
    import Receive from "$lib/pages/Receive.svelte";
    import Settings from "$lib/pages/Settings.svelte";
    import Login from "$lib/pages/Login.svelte";
    import Welcome from "$lib/pages/Welcome.svelte";
    import Account from "$lib/pages/Account.svelte";

    const colors: { [key in pages]: string } = {
        home: "[--color-primary:--color-home]",
        send: "[--color-primary:--color-send]",
        receive: "[--color-primary:--color-receive]",
        settings: "[--color-primary:--color-settings]",
        login: "[--color-primary:--color-account]",
        welcome: "[--color-primary:--color-account]",
        account: "[--color-primary:--color-account]"
    };
    
    onMount(setup);
    settings.subscribe(setup);

    function setup() {
        try {
            let themeTranslation = { 0: "light", 1: "dark" };

            document.documentElement.setAttribute("data-theme", themeTranslation[$settings.theme as keyof typeof themeTranslation]);
        }
        catch {}
    }

    if ($app) {
        $app.updateUriCallback(uriHandler);
        $app.updateLoginCallback((username, password) => account.login(username, password, true));
        $app.updateErrorCallback((code: number) => error.set(code));
    }

    $: showErrorModal = $error.show;

    function uriHandler(argv: string[]) {
        if (argv[0]) {
            if (argv[0] == "login" && $account.loggedIn)
                argv[0] = "account";
            else if (argv[0] == "account" && !$account.loggedIn)
                argv[0] = "login";

            if (["home", "send", "receive", "settings", "login", "account"].includes(argv[0]))
                page.set(argv[0] as pages);
        }
    }
</script>

<svelte:head>
    <title>{$info.name}</title>
</svelte:head>

<div class="contents {colors[$page.current]}">
    <FrameBar />
    <div class="h-full flex overflow-hidden">
        <SideBar />
        <main class="w-full h-full relative bg-background rounded-tl-2xl overflow-hidden shadow-md">
            {#if $page.current == "home"}
                <Home />
            {:else if $page.current == "send"}
                <Send />
            {:else if $page.current == "receive"}
                <Receive />
            {:else if $page.current == "settings"}
                <Settings />
            {:else if $page.current == "login"}
                <Login />
            {:else if $page.current == "welcome"}
                <Welcome />
            {:else if $page.current == "account"}
                <Account />
            {/if}
            {#if $disable.loading}
                <ProgressBar className="!absolute top-0 left-0 right-0 rounded-none transition-colors" indeterminate />
            {/if}
        </main>
    </div>
    <Modal bind:show={showErrorModal} title={$i18n.t(`modal.${$error.type}`)} button={$i18n.t("modal.okay")} canCancel={false} on:submit={() => error.hide()}>
        <p>{$i18n.t(`modal.${$error.type}Desc`, $error.vars)}</p>
    </Modal>
</div>