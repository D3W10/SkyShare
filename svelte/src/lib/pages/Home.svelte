<script lang="ts">
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";
    import { i18n } from "$lib/stores/i18nStore";
    import { app } from "$lib/stores/appStore";
    import { info } from "$lib/stores/infoStore";
    import { page } from "$lib/stores/pageStore";
    import { transition } from "$lib/stores/transitionStore";
    import { account } from "$lib/stores/accountStore";
    import Columns from "$lib/components/layout/Columns.svelte";
    import Modal from "$lib/components/Modal.svelte";
    import BlockLink from "$lib/components/BlockLink.svelte";

    let showChangesModal: boolean = false, greetingKey: string, waveAnimate: boolean = false;

    const changelogLoad = new Promise((resolve) => {
        onMount(() => {
            let content = $app?.getSetting("changelog");

            if (content) {
                resolve(content);
                showChangesModal = true;
                $app?.setSetting("changelog", null);
            }
            else
                resolve("");
        });
    });

    function updateGreeting() {
        let currentHour = new Date().getHours();

        if (currentHour >= 6 && currentHour <= 12)
            greetingKey = "home.morning";
        else if (currentHour >= 13 && currentHour <= 19)
            greetingKey = "home.afternoon";
        else if (currentHour >= 20 || currentHour <= 5)
            greetingKey = "home.evening";
    }

    updateGreeting();
    setInterval(updateGreeting, 3600000);
</script>

<div class="w-full h-full p-6 flex flex-col relative space-y-4" in:fade={$transition.pageIn} out:fade={$transition.pageOut}>
    <h1 class="w-full text-xl font-semibold">{$i18n.t(greetingKey, { count: !$account ? 0 : 1, name: $account?.username })}</h1>
    <Columns className="z-10">
        <div slot="left" class="flex flex-col justify-center items-center space-y-2">
            <img class="w-3/6" src="./logo.png" alt="{$info.name} Logo" role="none" on:click={(e) => { if (e.ctrlKey || e.metaKey) waveAnimate = !waveAnimate; }} />
            <p class="text-lg font-semibold">{$info.name}</p>
        </div>
        <div slot="right" class="flex flex-col justify-center space-y-4">
            <BlockLink text={$i18n.t("home.send")} icon="send" on:click={() => page.set("send")} />
            <BlockLink text={$i18n.t("home.receive")} icon="receive" on:click={() => page.set("receive")} />
            <BlockLink text={$i18n.t("home.settings")} icon="settings" on:click={() => page.set("settings")} />
        </div>
    </Columns>
    <img src="./wave.svg" class="absolute left-2 right-2 bottom-2 opacity-60" alt="{$info.name} Wave" style={!waveAnimate ? "" : "animation: shrink 3s ease-in-out infinite alternate;"} />
</div>
<Modal bind:show={showChangesModal} title={$i18n.t("whatsnew", { version: $info.version })} button={$i18n.t("awesome")} canCancel={false}>
    <div class="p-3 bg-secondary rounded-xl font-normal space-y-4 changelog [overflow-y:overlay]">
        {#await changelogLoad then changelog}
            {@html changelog}
        {/await}
    </div>
</Modal>

<style lang="postcss">
    .changelog :global(h3) {
        @apply text-xl font-semibold;
    }

    .changelog :global(a) {
        @apply relative font-semibold;
    }

    .changelog :global(a::before) {
        @apply content-[""] w-full h-[95%] absolute border-b-2 border-primary;
    }

    .changelog :global(input[type="checkbox"]) {
        @apply w-4 h-4 mr-2 bg-foreground/10 rounded appearance-none;
    }

    .changelog :global(input[type="checkbox"]:checked) {
        @apply bg-primary bg-check;
    }

    .changelog :global(ul), .changelog :global(ol) {
        @apply space-y-1;
    }

    .changelog :global(ul:not(.contains-task-list)) {
        @apply pl-2 list-disc list-inside;
    }

    .changelog :global(ol) {
        @apply pl-2 list-decimal list-inside;
    }

    .changelog :global(ul.contains-task-list) {
        @apply block;
    }

    .changelog :global(li.task-list-item) {
        @apply flex items-center;
    }

    .changelog :global(code) {
        @apply mx-0.5 p-0.5 bg-foreground/10 rounded-md font-mono;
    }

    .changelog :global(blockquote) {
        @apply ml-0.5 py-1 pl-2 bg-primary/30 rounded-sm border-l-4 border-primary;
    }
</style>