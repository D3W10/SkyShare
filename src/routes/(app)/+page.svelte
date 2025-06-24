<script lang="ts">
    import { onMount } from "svelte";
    import { i18n } from "$lib/data/i18n.svelte";
    import { app } from "$lib/data/app.svelte";
    import { info } from "$lib/data/info.svelte";
    import { account } from "$lib/data/account.svelte";
    import PageLayout from "$lib/components/PageLayout.svelte";
    import OneAction from "$lib/components/OneAction.svelte";
    import Dialog from "$lib/components/Dialog.svelte";
    import { images } from "$lib/utils";
    import "$lib/markdown.css";

    let greetingKey = $state("home.morning"), changelog = $state(""), showChanges = $state(false);

    function updateGreeting() {
        let currentHour = new Date().getHours();

        if (currentHour >= 6 && currentHour <= 12)
            greetingKey = "home.morning";
        else if (currentHour >= 13 && currentHour <= 19)
            greetingKey = "home.afternoon";
        else if (currentHour >= 20 || currentHour <= 5)
            greetingKey = "home.evening";
    }

    onMount(() => {
        let changes = app.getSetting("changelog"), updateTo = app.getSetting("updateTo");
        if (changes && info.version === updateTo) {
            changelog = changes;

            app.setSetting("changelog", null);
            app.setSetting("updateTo", "");
            app.addEventListener("open", () => setTimeout(() => showChanges = true, 500), { once: true });
        }
    });

    updateGreeting();
    setInterval(updateGreeting, 60000);
</script>

<PageLayout title={i18n.t(greetingKey, { count: !account.loggedIn ? 0 : 1, name: account.username })} class="px-14 pb-8 flex gap-x-8">
    <div class="w-1/2 pl-16 flex flex-col justify-center gap-y-8">
        <div class="flex items-center gap-x-4">
            <img class="h-10" src={images.logo} alt="{info.name} Logo" />
            <h3 class="text-2xl font-semibold">{info.name}</h3>
        </div>
        <div class="space-y-2.5">
            <OneAction icon="send" href="/send">{i18n.t("home.send")}</OneAction>
            <OneAction icon="receive" href="/receive">{i18n.t("home.receive")}</OneAction>
            <OneAction icon="settings" href="/settings">{i18n.t("home.settings")}</OneAction>
        </div>
    </div>
    <div class="w-1/2 flex justify-center items-center"></div>
</PageLayout>
<Dialog bind:show={showChanges} title={i18n.t("home.whatsNew", { version: info.version })} text={i18n.t("home.awesome")} cancelable={false}>
    <div class="px-3 py-2.5 bg-slate-200 dark:bg-slate-950 rounded-xl overflow-y-auto md-box">
        {@html changelog}
    </div>
</Dialog>