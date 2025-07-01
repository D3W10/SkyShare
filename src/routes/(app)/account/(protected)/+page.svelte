<script lang="ts">
    import { i18n } from "$lib/data/i18n.svelte";
    import { account, logout, verifyEmail } from "$lib/data/account.svelte";
    import PageLayout from "$lib/components/PageLayout.svelte";
    import OneAction from "$lib/components/OneAction.svelte";
    import ProfilePicture from "$lib/components/ProfilePicture.svelte";
    import Dialog from "$lib/components/Dialog.svelte";
    import { accountSettingsPath, goto } from "$lib/utils";

    let verifyAlert = $state(false), logoutAlert = $state(false);
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
            <OneAction type="button" icon="warning" class="mt-4 text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 ring-amber-500/40 dark:ring-amber-500/40" onclick={() => verifyAlert = true}>{i18n.t("account.notVerified")}</OneAction>
        {:else}
            <div class="h-8 mt-4"></div>
        {/if}
    </div>
    <div class="w-1/2 h-full pr-16 flex flex-col justify-center items-center gap-y-2.5">
        <!-- TODO: History preview -->
    </div>
</PageLayout>
<Dialog bind:show={verifyAlert} title={i18n.t("dialog.verify")} text={i18n.t("dialog.yes")} cancelText={i18n.t("dialog.no")} onsubmit={verifyEmail}>
    <p>{i18n.t("dialog.verifyDesc")}</p>
</Dialog>
<Dialog bind:show={logoutAlert} title={i18n.t("dialog.logout")} text={i18n.t("dialog.yes")} cancelText={i18n.t("dialog.no")} onsubmit={() => { logout(); goto("/"); }}>
    <p>{i18n.t("dialog.logoutDesc")}</p>
</Dialog>