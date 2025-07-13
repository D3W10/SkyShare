<script lang="ts">
    import { onMount } from "svelte";
    import { twMerge } from "tailwind-merge";
    import { i18n } from "$lib/data/i18n.svelte";
    import { app } from "$lib/data/app.svelte";
    import { setLock, setUnlock } from "$lib/data/disable.svelte";
    import { account, getHistory } from "$lib/data/account.svelte";
    import PageLayout from "$lib/components/PageLayout.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import ProfilePicture from "$lib/components/ProfilePicture.svelte";
    import { boxStyles, goto } from "$lib/utils";
    import type { HistoryEntry } from "$lib/models/HistoryEntry.interface";

    let entry = $state<HistoryEntry>();

    setLock();

    onMount(async () => {
        const params = new URLSearchParams(window.location.search);
        const id = params.get("id");

        if (!id || isNaN(+id)) {
            goto("/account/history");
            return;
        }

        await getHistory()

        const e = account.history.find(e => e.id === +id);
        if (!e) {
            goto("/account/history");
            return;
        }

        setUnlock();
        entry = e;
    });
</script>

<PageLayout title={entry ? entry.createdAt.toLocaleDateString(i18n.language, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "numeric", second: "numeric" }) : i18n.t("account.history.title")} class="flex gap-x-6">
    {#if entry}
        {@const oppositeName = entry.type === "sender" ? entry.receiver.name : entry.sender.name}
        <div class={twMerge(boxStyles.pane, "w-64 h-full p-2 flex flex-col gap-y-2 rounded-2xl overflow-y-auto")}>
            {#each entry.files as file (file.name)}
                <div class={twMerge(boxStyles.box, "px-2 items-center")}>
                    <Icon name="file" class="h-6 aspect-square" />
                    <div class="ml-2 flex flex-col gap-y-0">
                        <p class="text-sm overflow-hidden break-words [display:-webkit-box] [word-break:break-all] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]" title={file.name}>{file.name}</p>
                        <p class="text-xs text-slate-500">{app.formatFileSize(file.size)}</p>
                    </div>
                </div>
            {/each}
        </div>
        <div class="h-full px-4 flex flex-col items-center flex-1">
            <div class="size-full">
                <div class="flex gap-x-6">
                    <h3 class="font-semibold">{i18n.t(entry.type === "sender" ? "account.history.receivedBy" : "receive.review.sentBy")}</h3>
                    <div class="flex items-center gap-x-1.5">
                        <ProfilePicture picture={entry.type === "sender" ? entry.receiver.avatar : entry.sender.avatar} class="size-6" />
                        <p>{oppositeName ? oppositeName : i18n.t("send.waiting.anonymous")}</p>
                    </div>
                </div>
                <h3 class="mt-6 mb-2 font-semibold">{i18n.t("send.message")}</h3>
                <div class={twMerge(boxStyles.pane, "h-32 py-1.5 overflow-y-auto", !entry.message ? "flex justify-center items-center" : "")}>
                    {#if entry.message}
                        <p class="h-fit">{entry.message}</p>
                    {:else}
                        <p class="font-semibold text-slate-500">{i18n.t("receive.review.noMessage")}</p>
                    {/if}
                </div>
                <div class="mt-6 flex gap-x-4">
                    <div class="flex-1">
                        <h3 class="mb-2 font-semibold">{i18n.t("send.size")}</h3>
                        <div class={twMerge(boxStyles.pane, "py-1.5 grid text-sm *:col-[1] *:row-[1]")}>
                            <p>{app.formatFileSize(entry.files.reduce((p, c) => p + c.size, 0))}</p>
                        </div>
                    </div>
                    <div class="flex-1">
                        <h3 class="mb-2 font-semibold">{i18n.t("send.quantity")}</h3>
                        <div class={twMerge(boxStyles.pane, "py-1.5 grid text-sm *:col-[1] *:row-[1]")}>
                            <p>{entry.files.length} {i18n.t("send.file", { count: entry.files.length })}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    {/if}
</PageLayout>