<script lang="ts">
    import { onMount } from "svelte";
    import { i18n } from "$lib/data/i18n.svelte";
    import { setLock, setUnlock } from "$lib/data/disable.svelte";
    import { deleteAccount, logout } from "$lib/data/account.svelte";
    import PageLayout from "$lib/components/PageLayout.svelte";
    import Dialog from "$lib/components/Dialog.svelte";
    import { goto } from "$lib/utils";

    let successAlert = $state(false), errorAlert = $state(false);

    onMount(async () => {
        setLock();

        if (await deleteAccount()) {
            successAlert = true;
            logout();
        }
        else
            errorAlert = true;

        setUnlock();
    });
</script>

<PageLayout title={i18n.t("receive.review.title")}>
    <p class="size-full flex justify-center items-center text-lg font-semibold">{i18n.t("account.delete.confirm.deleting")}</p>
</PageLayout>
<Dialog bind:show={successAlert} title={i18n.t("dialog.deleteSuccess")} cancelable={false} onsubmit={() => goto("/")}>
    <p>{i18n.t("dialog.deleteSuccessDesc")}</p>
</Dialog>
<Dialog bind:show={errorAlert} title={i18n.t("dialog.deleteError")} cancelable={false} onsubmit={() => goto("/")}>
    <p>{i18n.t("dialog.deleteErrorDesc")}</p>
</Dialog>