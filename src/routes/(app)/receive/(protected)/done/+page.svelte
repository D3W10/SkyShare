<script lang="ts">
    import { twMerge } from "tailwind-merge";
    import { i18n } from "$lib/data/i18n.svelte";
    import { app } from "$lib/data/app.svelte";
    import { connection } from "$lib/data/connection.svelte";
    import PageLayout from "$lib/components/PageLayout.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import Button from "$lib/components/Button.svelte";
    import ProfilePicture from "$lib/components/ProfilePicture.svelte";
    import { boxStyles, goto } from "$lib/utils";

    const details = connection.c?.details, remoteData = connection.c?.remotePeerData;
</script>

<PageLayout title={i18n.t("receive.done.title")} class="flex flex-col justify-between">
    <div>
        <div class="text-lg space-y-0.5">
            <div class="flex items-center gap-x-2.5">
                <p>{i18n.t("receive.done.description.0")}</p>
                <div class="flex items-center gap-x-1.5">
                    <ProfilePicture picture={remoteData?.picture} class="size-5" />
                    <p>{remoteData?.username ? remoteData.username : i18n.t("send.waiting.anonymous")}</p>
                </div>
            </div>
            <p>{i18n.t("receive.done.description.1")}</p>
        </div>
        <div class={twMerge(boxStyles.pane, "h-40 mt-8 py-1.5 overflow-y-auto", !details?.message ? "flex justify-center items-center" : "")}>
            {#if details?.message}
                <p class="h-fit">{details?.message}</p>
            {:else}
                <p class="font-semibold text-slate-500">{i18n.t("receive.review.noMessage")}</p>
            {/if}
        </div>
        <div class="mt-6 flex justify-center gap-x-2.5">
            <div class={twMerge(boxStyles.pane, "w-fit py-1.5 pl-3 pr-4 gap-x-2 text-sm font-medium rounded-full")}>
                <Icon name="stopwatch" class="size-5" />
                <p>{connection.c && new Date(connection.c.transferDuration).toLocaleTimeString([], { minute: "2-digit", second: "2-digit" })}</p>
            </div>
            <div class={twMerge(boxStyles.pane, "w-fit py-1.5 pl-3 pr-4 gap-x-2 text-sm font-medium rounded-full")}>
                <Icon name="file" class="size-5" />
                <p>{details?.files.length} {i18n.t("send.file", { count: details?.files.length })}</p>
            </div>
            <div class={twMerge(boxStyles.pane, "w-fit py-1.5 pl-3 pr-4 gap-x-2 text-sm font-medium rounded-full")}>
                <Icon name="send" class="size-5" />
                <p>{details?.files && app.formatFileSize(details?.files.reduce((p, c) => p + c.size, 0))}</p>
            </div>
        </div>
    </div>
    <div class="flex justify-center gap-x-2.5">
        <Button type="secondary" class="w-full" onclick={() => connection.c?.savePath && app.showItemInFolder(connection.c?.savePath + "/" + details?.files[0].name)}>{i18n.t("receive.done.open")}</Button>
        <Button class="w-45" onclick={() => goto("/receive")}>{i18n.t("send.done.finish")}</Button>
    </div>
</PageLayout>