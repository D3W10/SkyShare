<script lang="ts">
    import { i18n } from "$lib/data/i18n.svelte";
    import { account, logout } from "$lib/data/account.svelte";
    import PageLayout from "$lib/components/PageLayout.svelte";
    import OneAction from "$lib/components/OneAction.svelte";
    import ProfilePicture from "$lib/components/ProfilePicture.svelte";
    import Dialog from "$lib/components/Dialog.svelte";
    import { goto } from "$lib/utils";

    let logoutAlert = $state(false);
</script>

<PageLayout title={i18n.t("account.title")} class="px-14 pb-8 flex gap-x-8">
    <div class="w-1/2 h-full flex flex-col justify-center items-center gap-y-4">
        <ProfilePicture class="size-28" />
        <h2 class="text-lg text-center font-semibold">{account.username}</h2>
        <div class="flex gap-x-2.5">
            <OneAction icon="brush" href="/account/settings" class="px-2 rounded-lg" />
            <OneAction type="button" icon="logout" class="px-2 rounded-lg" onclick={() => logoutAlert = true} />
        </div>
    </div>
    <div class="w-1/2 h-full pr-16 flex flex-col justify-center items-center gap-y-2.5">
        <!-- TODO: History preview -->
    </div>
</PageLayout>
<Dialog bind:show={logoutAlert} title={i18n.t("dialog.logout")} text={i18n.t("dialog.yes")} cancelText={i18n.t("dialog.no")} onsubmit={() => { logout(); goto("/"); }}>
    <p>{i18n.t("dialog.logoutDesc")}</p>
</Dialog>