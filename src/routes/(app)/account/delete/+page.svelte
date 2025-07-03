<script lang="ts">
    import { twMerge } from "tailwind-merge";
    import { i18n } from "$lib/data/i18n.svelte";
    import { account } from "$lib/data/account.svelte";
    import PageLayout from "$lib/components/PageLayout.svelte";
    import Button from "$lib/components/Button.svelte";
    import OneAction from "$lib/components/OneAction.svelte";
    import ProfilePicture from "$lib/components/ProfilePicture.svelte";
    import Dialog from "$lib/components/Dialog.svelte";
    import { boxStyles, goto } from "$lib/utils";

    let deleteAlert = $state(false);
</script>

<PageLayout title={i18n.t("account.delete.title")} class="px-14 pb-8 flex flex-col justify-between">
    <div class="h-full flex gap-x-8">
        <div class="w-1/2 h-full pl-16 flex flex-col justify-center gap-y-6">
            <p class="font-semibold">{i18n.t("account.delete.features")}</p>
            <div class="space-y-2.5">
                <OneAction icon="history">{i18n.t("account.login.history")}</OneAction>
                <OneAction icon="sync">{i18n.t("account.login.sync")}</OneAction>
                <OneAction icon="identification">{i18n.t("account.login.identification")}</OneAction>
            </div>
        </div>
        <div class="w-1/2 h-full pr-16 flex justify-end items-center">
            <div class={twMerge(boxStyles.box, "px-10 py-6 flex-col items-center")}>
                <ProfilePicture class="size-22" />
                <h2 class="mt-4 text-lg text-center font-semibold">{account.username}</h2>
                <p class="mt-1 text-sm text-center text-slate-500">
                    {i18n.t("account.settings.since")}
                    <br />
                    {account.createdAt.toLocaleDateString(i18n.language)}
                </p>
            </div>
        </div>
    </div>
    <div class="w-full flex justify-center">
        <Button class="w-32" onclick={() => deleteAlert = true}>{i18n.t("account.delete.continue")}</Button>
    </div>
</PageLayout>
<Dialog bind:show={deleteAlert} title={i18n.t("dialog.deleteConfirm")} text={i18n.t("account.delete.continue")} onsubmit={() => goto("/account/delete/confirm")}>
    <p>{i18n.t("dialog.deleteConfirmDesc")}</p>
</Dialog>