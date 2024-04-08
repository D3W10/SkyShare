<script lang="ts">
    import { fade, fly } from "svelte/transition";
    import { i18n } from "$lib/stores/i18nStore";
    import { page } from "$lib/stores/pageStore";
    import { transition } from "$lib/stores/transitionStore";
    import { account } from "$lib/stores/accountStore";
    import Columns from "$lib/components/layout/Columns.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import BlockLink from "$lib/components/BlockLink.svelte";
    import Modal from "$lib/components/Modal.svelte";

    let showModal = false;

    function onLogout() {
        account.logout();
        page.set("home");
    }
</script>

<div class="w-full h-full p-6 space-y-4" in:fade={$transition.pageIn} out:fade={$transition.pageOut}>
    {#if $page.subPage == 0}
        <div class="w-full h-full flex flex-col" in:fly={$transition.subpageIn} out:fly={$transition.subpageOut}>
            <h1 class="w-full text-xl font-semibold">{$i18n.t("account.0.title")}</h1>
            <Columns>
                <div slot="left" class="flex flex-col justify-center items-center space-y-6">
                    {#if !$account || !$account.photo}
                        <Icon name="account" className="w-3/5 text-primary" />
                    {:else}
                        <img src={$account.photo} alt="{$account.username} Profile Picture" class="w-3/5 rounded-full aspect-square" />
                    {/if}
                    <p class="text-lg font-semibold">{$account?.username}</p>
                </div>
                <div slot="right" class="flex flex-col justify-center space-y-4">
                    <BlockLink text={$i18n.t("account.0.edit")} icon="editAccount" on:click={() => {}} />
                    <BlockLink text={$i18n.t("account.0.logout")} icon="logout" on:click={() => showModal = true} />
                </div>
            </Columns>
        </div>
    {/if}
</div>
<Modal bind:show={showModal} title={$i18n.t("modal.logout")} button="Yes" cancelButton="No" on:submit={onLogout}>
    <p>{$i18n.t("modal.logoutDesc")}</p>
</Modal>