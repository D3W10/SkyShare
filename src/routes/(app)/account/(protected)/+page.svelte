<script lang="ts">
    import { twMerge } from "tailwind-merge";
    import { i18n } from "$lib/data/i18n.svelte";
    import { account, getHistory, logout } from "$lib/data/account.svelte";
    import PageLayout from "$lib/components/PageLayout.svelte";
    import OneAction from "$lib/components/OneAction.svelte";
    import ProfilePicture from "$lib/components/ProfilePicture.svelte";
    import Link from "$lib/components/Link.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import Dialog from "$lib/components/Dialog.svelte";
    import { accountSettingsPath, boxStyles, goto } from "$lib/utils";

    let logoutAlert = $state(false);
</script>

<PageLayout title={i18n.t("account.title")} class="px-14 pb-8 flex gap-x-8">
    <div class="w-1/2 h-full flex flex-col justify-center items-center gap-y-4">
        <ProfilePicture class="size-28 mt-12" />
        <h2 class="text-lg text-center font-semibold">{account.username}</h2>
        <div class="flex gap-x-2.5">
            <OneAction icon="brush" href={accountSettingsPath} class="px-2 rounded-lg" />
            <OneAction type="button" icon="logout" class="px-2 rounded-lg" onclick={() => logoutAlert = true} />
        </div>
        {#if !account.emailVerified}
            <OneAction icon="warning" class="mt-4 text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 ring-amber-500/40 dark:ring-amber-500/40">{i18n.t("account.notVerified")}</OneAction>
        {:else}
            <div class="h-8 mt-4"></div>
        {/if}
    </div>
    <div class="w-1/2 h-full flex flex-col justify-center items-center gap-y-3">
        {#await getHistory()}
            <div class={twMerge(boxStyles.pane, "w-full h-15 animate-pulse")}></div>
            <div class={twMerge(boxStyles.pane, "w-full h-15 animate-pulse")}></div>
            <div class={twMerge(boxStyles.pane, "w-full h-15 animate-pulse")}></div>
        {:then}
            {#if account.history.length > 0}
                {#each account.history.slice(0, 3) as entry}
                    {@const oppositeName = entry.type === "sender" ? entry.receiver.name : entry.sender.name}
                    <Link type="secondary" class="w-full justify-start items-center gap-x-3 overflow-hidden after:absolute after:inset-0 after:bg-gradient-to-r {entry.type === "sender" ? "after:from-send/10" : "after:from-receive/10"} after:to-transparent after:to-50% after:-z-1" href="/account/history/id?id={entry.id}">
                        <Icon name={entry.type === "sender" ? "send" : "receive"} class="size-6" />
                        <div>
                            <h2 class="font-semibold">{entry.createdAt.toLocaleDateString(i18n.language, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "numeric", second: "numeric" })}</h2>
                            <div class="flex gap-x-2 text-sm text-slate-500">
                                <p>{i18n.t("account.history." + (entry.type === "sender" ? "to" : "from"))}</p>
                                <div class="flex items-center gap-x-1.5">
                                    <ProfilePicture picture={(entry.type === "sender" ? entry.receiver.avatar : entry.sender.avatar)} class="size-4" />
                                    <p>{oppositeName ? oppositeName : i18n.t("send.waiting.anonymous")}</p>
                                </div>
                            </div>
                        </div>
                    </Link>
                {/each}
            {:else}
                <p class="font-semibold">{i18n.t("account.history.empty")}</p>
            {/if}
        {/await}
        {#if account.history.length > 0}
            <OneAction icon="history" class="mt-2" href="/account/history">{i18n.t("account.viewHistory")}</OneAction>
        {/if}
    </div>
</PageLayout>
<Dialog bind:show={logoutAlert} title={i18n.t("dialog.logout")} text={i18n.t("dialog.yes")} cancelText={i18n.t("dialog.no")} onsubmit={() => { logout(); goto("/"); }}>
    <p>{i18n.t("dialog.logoutDesc")}</p>
</Dialog>