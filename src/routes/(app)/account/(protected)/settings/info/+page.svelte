<script lang="ts">
    import { i18n } from "$lib/data/i18n.svelte";
    import { setLock, setUnlock } from "$lib/data/disable.svelte";
    import { setError } from "$lib/data/error.svelte";
    import { account, editInfo, logout } from "$lib/data/account.svelte";
    import Input from "$lib/components/Input.svelte";
    import Button from "$lib/components/Button.svelte";
    import Link from "$lib/components/Link.svelte";
    import Dialog from "$lib/components/Dialog.svelte";
    import { goto, transitions } from "$lib/utils";

    let username = $state(account.username), email = $state(account.email);
    let logoffAlert = $state(false), changesMade = $state(false);

    async function onSave(bypass = false) {
        let shutdown = username !== account.username;

        if (shutdown && !bypass) {
            logoffAlert = true;
            return;
        }

        setLock(true);

        if (!(await editInfo(username, email)))
            setError("editError");

        if (shutdown) {
            logout();
            goto("/account");
        }

        setUnlock();
    }

    $effect(() => {
        changesMade = username !== account.username || email !== account.email;
    });
</script>

<div class="w-full py-2 flex flex-col justify-between items-center" in:transitions.pageIn out:transitions.pageOut>
    <div class="w-full flex flex-col gap-y-6">
        <div class="w-full flex justify-between items-center gap-x-6">
            <div>
                <h3 class="mb-1 font-semibold">{i18n.t("account.settings.username")}</h3>
                <p class="text-sm text-slate-500">{i18n.t("account.settings.usernameDesc")}</p>
            </div>
            <Input class="w-38 text-sm" bind:value={username} placeholder={account.username} />
        </div>
        <div class="w-full flex justify-between items-center gap-x-6">
            <div>
                <h3 class="mb-1 font-semibold">{i18n.t("account.settings.email")}</h3>
                <p class="text-sm text-slate-500">{i18n.t("account.settings.emailDesc")}</p>
            </div>
            <Input class="w-38 text-sm" bind:value={email} placeholder={account.email} />
        </div>
        <div class="w-full flex justify-between items-center gap-x-6">
            <div>
                <h3 class="mb-1 font-semibold">{i18n.t("account.settings.delete")}</h3>
                <p class="text-sm text-slate-500">{i18n.t("account.settings.deleteDesc")}</p>
            </div>
            <Link class="w-32" type="button" href="/account/delete">{i18n.t("account.settings.deleteButton")}</Link>
        </div>
    </div>
    <Button class="w-32" disabled={!changesMade} onclick={() => onSave()}>{i18n.t("account.settings.save")}</Button>
</div>
<Dialog bind:show={logoffAlert} title={i18n.t("dialog.logoutRequired")} text={i18n.t("dialog.yes")} cancelText={i18n.t("dialog.no")} onsubmit={() => onSave(true)}>
    <p>{i18n.t("dialog.logoutRequiredDesc")}</p>
</Dialog>