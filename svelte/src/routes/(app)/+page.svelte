<script lang="ts">
    import { twMerge } from "tailwind-merge";
    import { i18n } from "$lib/data/i18n.svelte";
    import { info } from "$lib/data/info.svelte";
    import PageLayout from "$lib/components/PageLayout.svelte";
    import Link from "$lib/components/Link.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import { boxStyles } from "$lib/utils.svelte";

    let greetingKey = $state("home.morning");

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
    setInterval(updateGreeting, 60000);
</script>

<PageLayout title={i18n.t(greetingKey, { count: 0 })} class="mx-8 pb-8 flex gap-x-8">
    <div class="w-1/2 pl-16 flex flex-col justify-center gap-y-8">
        <div class="flex items-center gap-x-4">
            <img class="h-10" src="/logo.png" alt="{info.name} Logo" />
            <h3 class="text-2xl font-semibold">{info.name}</h3>
        </div>
        <div class="space-y-2.5">
            <Link type="invisible" class={twMerge(boxStyles.pane, "w-fit pl-3 pr-4 py-1.5 gap-x-2 text-sm font-medium rounded-full")} href="/send">
                <Icon name="send" class="size-5" />
                <p>{i18n.t("home.send")}</p>
            </Link>
            <Link type="invisible" class={twMerge(boxStyles.pane, "w-fit pl-3 pr-4 py-1.5 gap-x-2 text-sm font-medium rounded-full")} href="/receive">
                <Icon name="receive" class="size-5" />
                <p>{i18n.t("home.receive")}</p>
            </Link>
            <Link type="invisible" class={twMerge(boxStyles.pane, "w-fit pl-3 pr-4 py-1.5 gap-x-2 text-sm font-medium rounded-full")} href="/settings">
                <Icon name="settings" class="size-5" />
                <p>{i18n.t("home.settings")}</p>
            </Link>
        </div>
    </div>
    <div class="w-1/2 flex justify-center items-center"></div>
</PageLayout>