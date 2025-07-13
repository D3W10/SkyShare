<script lang="ts">
    import { twMerge } from "tailwind-merge";
    import { i18n } from "$lib/data/i18n.svelte";
    import { account, getHistory } from "$lib/data/account.svelte";
    import PageLayout from "$lib/components/PageLayout.svelte";
    import Link from "$lib/components/Link.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import ProfilePicture from "$lib/components/ProfilePicture.svelte";
    import { boxStyles } from "$lib/utils";
</script>

<PageLayout title={i18n.t("account.history.title")} class="flex flex-col {account.history.length === 0 ? "justify-center items-center" : ""} gap-y-4">
    {#await getHistory()}
        <div class={twMerge(boxStyles.pane, "w-full h-15 animate-pulse")}></div>
        <div class={twMerge(boxStyles.pane, "w-full h-15 animate-pulse")}></div>
        <div class={twMerge(boxStyles.pane, "w-full h-15 animate-pulse")}></div>
    {:then}
        {#if account.history.length > 0}
            {#each account.history as entry}
                {@const oppositeName = entry.type === "sender" ? entry.receiver.name : entry.sender.name}
                <Link type="secondary" class="w-full min-h-min py-4 justify-start items-center gap-x-4 overflow-hidden after:absolute after:inset-0 after:bg-gradient-to-r {entry.type === "sender" ? "after:from-send/10" : "after:from-receive/10"} after:to-transparent after:to-50% after:-z-1" href="/account/history/id?id={entry.id}">
                    <Icon name={entry.type === "sender" ? "send" : "receive"} class="size-8" />
                    <div class="flex-1 space-y-0.5">
                        <h2 class="font-semibold">{entry.createdAt.toLocaleDateString(i18n.language, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "numeric", second: "numeric" })}</h2>
                        <div class="flex gap-x-2 text-sm text-slate-500">
                            <p>{i18n.t("account.history." + (entry.type === "sender" ? "to" : "from"))}</p>
                            <div class="flex items-center gap-x-1.5">
                                <ProfilePicture picture={(entry.type === "sender" ? entry.receiver.avatar : entry.sender.avatar)} class="size-4" />
                                <p>{oppositeName ? oppositeName : i18n.t("send.waiting.anonymous")}</p>
                            </div>
                        </div>
                    </div>
                    <p>{entry.files.length} {i18n.t("send.file", { count: entry.files.length })}</p>
                </Link>
            {/each}
        {:else}
            <p class="font-semibold">{i18n.t("account.history.empty")}</p>
        {/if}
    {/await}
</PageLayout>