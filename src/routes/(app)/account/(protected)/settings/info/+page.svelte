<script lang="ts">
    import { i18n } from "$lib/data/i18n.svelte";
    import { account, editInfo } from "$lib/data/account.svelte";
    import Input from "$lib/components/Input.svelte";
    import Button from "$lib/components/Button.svelte";
    import { transitions } from "$lib/utils";

    let username = $state(account.username), email = $state(account.email);
    let changesMade = $state(false);

    $effect(() => {
        changesMade = true;
        [username, email];
    });
</script>

<div class="w-full py-2 flex flex-col space-y-6" in:transitions.pageIn out:transitions.pageOut>
    <div class="w-full flex justify-between items-center gap-x-6">
        <div>
            <h3 class="mb-1 font-semibold">{i18n.t("account.settings.username")}</h3>
            <p class="text-sm text-slate-500">{i18n.t("account.settings.usernameDesc")}</p>
        </div>
        <Input class="w-38 text-sm" bind:value={username} />
    </div>
    <div class="w-full flex justify-between items-center gap-x-6">
        <div>
            <h3 class="mb-1 font-semibold">{i18n.t("account.settings.email")}</h3>
            <p class="text-sm text-slate-500">{i18n.t("account.settings.emailDesc")}</p>
        </div>
        <Input class="w-38 text-sm" bind:value={email} />
    </div>
    <div class="w-full flex justify-center">
        <Button class="w-32" disabled={!changesMade} onclick={() => editInfo(username, email)}>{i18n.t("account.settings.save")}</Button>
    </div>
</div>