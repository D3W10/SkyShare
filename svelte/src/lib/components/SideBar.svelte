<script lang="ts">
    import { i18n } from "$lib/stores/i18nStore";
    import { page } from "$lib/stores/pageStore";
    import { disable } from "$lib/stores/disableStore";
    import Icon from "./Icon.svelte";

    export let disabled: boolean = false;
</script>

<div class="w-80 px-4 py-2 space-y-4">
    <button class="account" {disabled} on:click={() => page.set("home")}>
        <Icon name="account" className="w-14" />
        <span>{$i18n.t("sidebar.login")}</span>
    </button>
    <hr class="h-[3px] bg-slate-900/10 border-0 rounded-full">
    <div>
        <button {disabled} on:click={() => page.set("home")}>
            <Icon name="home" className="w-8" />
            <span>{$i18n.t("sidebar.home")}</span>
        </button>
        <button {disabled} on:click={() => page.set("send")}>
            <Icon name="send" className="w-8" />
            <span>{$i18n.t("sidebar.send")}</span>
        </button>
        <button {disabled} on:click={() => page.set("receive")}>
            <Icon name="receive" className="w-8" />
            <span>{$i18n.t("sidebar.receive")}</span>
        </button>
        <button {disabled} on:click={() => page.set("settings")}>
            <Icon name="settings" className="w-8" />
            <span>{$i18n.t("sidebar.settings")}</span>
        </button>
    </div>
</div>

<style lang="postcss">
    button {
        @apply w-full p-2 flex items-center justify-start font-semibold space-x-3;
    }

    .account {
        @apply p-0;
    }
</style>