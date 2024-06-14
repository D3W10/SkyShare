<script lang="ts">
    import { fade, fly } from "svelte/transition";
    import { scale } from "svelte/transition";
    import { quartIn, quartOut } from "svelte/easing";
    import { i18n } from "$lib/stores/i18nStore";
    import { app } from "$lib/stores/appStore";
    import { page } from "$lib/stores/pageStore";
    import { transition } from "$lib/stores/transitionStore";
    import { disable } from "$lib/stores/disableStore";
    import { account } from "$lib/stores/accountStore";
    import { error, ErrorCode } from "$lib/stores/errorStore";
    import { settings } from "$lib/stores/settingsStore";
    import { FValid } from "$lib/models/FValid.class";
    import Columns from "$lib/components/layout/Columns.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import BlockLink from "$lib/components/BlockLink.svelte";
    import Button from "$lib/components/Button.svelte";
    import Input from "$lib/components/Input.svelte";
    import Modal from "$lib/components/Modal.svelte";

    type settingsPages = "informations" | "password" | "personalization" | "history" | "about";

    let currentPage: settingsPages = "informations", showModal = false;
    let editData = new FValid<[string, string, string | undefined]>(["", "", $account.photo]);

    // TODO Temp
    let historyEnabled: boolean = true;

    function onLogout() {
        account.logout();
        page.set("home");
    }

    $: saveEnable = ["informations", "personalization"].includes(currentPage) && ($editData[0].v != "" || $editData[1].v != "" || $editData[2].v != $account.photo);

    async function choosePhoto() {
        let photoDialog = await $app.showOpenDialog({
            title: $i18n.t("account.2.photoChoose"),
            properties: ["openFile"],
            filters: [{ name: "Imagens (*.png, *.jpg, *.jpeg, *.jpe, *.jif, *.jfif, *.gif)", extensions: ["png", "jpg", "jpeg", "jpe", "jif", "jfif", "gif"] }]
        })!;

        if (!photoDialog.canceled)
            $editData[2].v = photoDialog.files[0].path.replace(/\\/g, "/");
    }

    async function onSave() {
        disable.lock();

        if ($editData[0].v && $editData[0].e)
            error.set(ErrorCode.INVALID_USERNAME);
        else if ($editData[1].v && $editData[1].e)
            error.set(ErrorCode.INVALID_EMAIL);
        else {
            let edit = await account.edit($editData[0].v, $editData[1].v, $editData[2].v == $account.photo ? undefined : $editData[2].v == undefined ? null : $editData[2].v);

            if (edit.success) {
                $editData[0].v = $editData[1].v = "";
                $editData[2].v = $account.photo;
            }
        }

        disable.unlock();
    }
</script>

<div class="w-full h-full p-6" in:fade={$transition.pageIn} out:fade={$transition.pageOut}>
    {#if $page.subPage == 0}
        <div class="w-full h-full flex flex-col space-y-4" in:fly={$transition.subpageIn} out:fly={$transition.subpageOut}>
            <h1 class="w-full text-xl font-semibold">{$i18n.t("account.0.title")}</h1>
            <Columns>
                <div slot="left" class="flex flex-col justify-center items-center space-y-6">
                    {#if !$account.loggedIn || !$account.photo}
                        <Icon name="account" className="w-3/5 text-primary" />
                    {:else}
                        <img src={$account.photo} alt="{$account.username} Profile Picture" class="w-3/5 rounded-full aspect-square" />
                    {/if}
                    <p class="text-lg font-semibold">{$account.username}</p>
                </div>
                <div slot="right" class="flex flex-col justify-center space-y-4">
                    <BlockLink text={$i18n.t("account.0.history")} icon="history-bold" on:click={() => page.set("account", 1)} />
                    <BlockLink text={$i18n.t("account.0.edit")} icon="editAccount" on:click={() => page.set("account", 2)} />
                    <BlockLink text={$i18n.t("account.0.logout")} icon="logout" on:click={() => showModal = true} />
                </div>
            </Columns>
        </div>
    {:else if $page.subPage == 1}
        <div class="w-full h-full flex flex-col space-y-4" in:fly={$transition.subpageIn} out:fly={$transition.subpageOut}>
            <div class="flex justify-between items-center">
                <h1 class="w-full text-xl font-semibold">{$i18n.t("account.1.title")}</h1>
                <Button type="invisible" className="h-fit flex items-center text-primary font-semibold" on:click={() => page.set("account")}>
                    <Icon name="chevron" className="w-5 h-5 mr-1 fill-current rotate-90" />
                    {$i18n.t("common.back")}
                </Button>
            </div>
        </div>
    {:else if $page.subPage == 2}
        <div class="w-full h-full flex flex-col space-y-4" in:fly={$transition.subpageIn} out:fly={$transition.subpageOut}>
            <div class="flex justify-between items-center">
                <h1 class="w-full text-xl font-semibold">{$i18n.t("account.2.title")}</h1>
                <Button type="invisible" className="h-fit flex items-center text-primary font-semibold" on:click={() => page.set("account")}>
                    <Icon name="chevron" className="w-5 h-5 mr-1 fill-current rotate-90" />
                    {$i18n.t("common.back")}
                </Button>
            </div>
            <Columns className="!space-x-0">
                <div slot="left" class="!w-1/3 pr-5">
                    <div class="w-full h-full p-1 flex flex-col justify-between bg-secondary rounded-xl shadow-md ring-1 ring-foreground/10 space-y-1">
                        <div>
                            <Button type="invisible" className="w-full p-2 flex items-center {currentPage == "informations" ? "text-primary" : ""} hover:bg-foreground/5 !rounded-lg hover:shadow-sm ring-1 ring-transparent hover:ring-foreground/10 space-x-1.5" on:click={() => currentPage = "informations"}>
                                <Icon name="user" className="h-6" />
                                <p>{$i18n.t("account.2.informations")}</p>
                            </Button>
                            <Button type="invisible" className="w-full p-2 flex items-center {currentPage == "password" ? "text-primary" : ""} hover:bg-foreground/5 !rounded-lg hover:shadow-sm ring-1 ring-transparent hover:ring-foreground/10 space-x-1.5" on:click={() => currentPage = "password"}>
                                <Icon name="password" className="h-6" />
                                <p>{$i18n.t("account.2.password")}</p>
                            </Button>
                            <Button type="invisible" className="w-full p-2 flex items-center {currentPage == "personalization" ? "text-primary" : ""} hover:bg-foreground/5 !rounded-lg hover:shadow-sm ring-1 ring-transparent hover:ring-foreground/10 space-x-1.5" on:click={() => currentPage = "personalization"}>
                                <Icon name="appearance" className="h-6" />
                                <p>{$i18n.t("account.2.personalization")}</p>
                            </Button>
                            <Button type="invisible" className="w-full p-2 flex items-center {currentPage == "history" ? "text-primary" : ""} hover:bg-foreground/5 !rounded-lg hover:shadow-sm ring-1 ring-transparent hover:ring-foreground/10 space-x-1.5" on:click={() => currentPage = "history"}>
                                <Icon name="history-bold" className="h-6" />
                                <p>{$i18n.t("account.2.history")}</p>
                            </Button>
                            <Button type="invisible" className="w-full p-2 flex items-center {currentPage == "about" ? "text-primary" : ""} hover:bg-foreground/5 !rounded-lg hover:shadow-sm ring-1 ring-transparent hover:ring-foreground/10 space-x-1.5" on:click={() => currentPage = "about"}>
                                <Icon name="about" className="h-6" />
                                <p>{$i18n.t("account.2.about")}</p>
                            </Button>
                        </div>
                        <Button className="w-full !py-1.5 flex items-center disabled:text-foreground/50 disabled:bg-foreground/10 !rounded-lg shadow-sm ring-1 ring-transparent disabled:ring-foreground/20 !duration-200" disabled={!saveEnable} on:click={onSave}>{$i18n.t("account.2.save")}</Button>
                    </div>
                </div>
                <div slot="right" class="!w-2/3 !ml-6 py-3.5 pl-5">
                    {#if currentPage == "informations"}
                        <div class="space-y-6" in:fade={$transition.pageIn} out:fade={$transition.pageOut}>
                            <div class="flex justify-between items-center">
                                <div>
                                    <p>{$i18n.t("account.2.username")}</p>
                                    <p class="mt-0.5 text-foreground/70 text-sm font-normal">{$i18n.t("account.2.usernameDesc")}</p>
                                </div>
                                <Input type="username" value={$editData[0].v} error={$editData[0].e} placeholder={$account.username} on:input={e => editData.update(0, e.detail.value, e.detail.error)} />
                            </div>
                            <div class="flex justify-between items-center">
                                <div>
                                    <p>{$i18n.t("account.2.email")}</p>
                                    <p class="mt-0.5 text-foreground/70 text-sm font-normal">{$i18n.t("account.2.emailDesc")}</p>
                                </div>
                                <Input type="email" value={$editData[1].v} error={$editData[1].e} placeholder={$account.email} on:input={e => editData.update(1, e.detail.value, e.detail.error)} />
                            </div>
                            <div class="flex justify-between items-center">
                                <div>
                                    <p>{$i18n.t("account.2.delete")}</p>
                                    <p class="mt-0.5 text-foreground/70 text-sm font-normal">{$i18n.t("account.2.deleteDesc")}</p>
                                </div>
                                <Button type="small" secondary on:click={() => {/* TODO */}}>{$i18n.t("account.2.deleteButton")}</Button>
                            </div>
                        </div>
                    {:else if currentPage == "password"}
                        <div class="space-y-6" in:fade={$transition.pageIn} out:fade={$transition.pageOut}>
                        </div>
                    {:else if currentPage == "personalization"}
                        <div class="w-full h-full flex justify-center items-center" in:fade={$transition.pageIn} out:fade={$transition.pageOut}>
                            <div class="flex flex-col items-center text-center space-y-5">
                                <div class="w-32 h-32 relative">
                                    {#key $editData[2].v}
                                        {#if $editData[2].v == undefined}
                                            <div class="flex justify-center items-center absolute inset-0" in:scale|global={{ duration: 1000, delay: 750, easing: quartOut, opacity: 1 }} out:scale|global={{ duration: 750, easing: quartIn, opacity: 1 }}>
                                                <Icon name="account" className="w-full text-primary" />
                                            </div>
                                        {:else}
                                            <div class="flex justify-center items-center absolute inset-0" in:scale|global={{ duration: 1000, delay: 750, easing: quartOut, opacity: 1 }} out:scale|global={{ duration: 750, easing: quartIn, opacity: 1 }}>
                                                <img src={($editData[2].v != $account.photo ? "app://" : "") + $editData[2].v} alt="{$account.username} Profile Picture" class="w-full absolute rounded-full aspect-square" />
                                            </div>
                                        {/if}
                                    {/key}
                                </div>
                                <div class="flex space-x-2">
                                    <Button className="min-w-8 min-h-8 !p-1" type="small" secondary disabled={$account.photo == undefined || $editData[2].v == $account.photo} on:click={() => $editData[2].v = $account.photo}>
                                        <Icon name="reset" className="w-6 aspect-square" />
                                    </Button>
                                    <Button className="w-full" type="small" secondary on:click={choosePhoto}>{$i18n.t("account.2.photoChoose")}</Button>
                                    <Button className="min-w-8 min-h-8 !p-1" type="small" secondary disabled={$editData[2].v == undefined} on:click={() => $editData[2].v = undefined}>
                                        <Icon name="dismiss" className="w-6 aspect-square" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    {:else if currentPage == "history"}
                        <div class="space-y-6" in:fade={$transition.pageIn} out:fade={$transition.pageOut}>
                            <div class="flex justify-between items-center">
                                <div>
                                    <p>{$i18n.t("account.2.enableHistory")}</p>
                                    <p class="mt-0.5 text-foreground/70 text-sm font-normal">{$i18n.t("account.2.enableHistoryDesc")}</p>
                                </div>
                                <Input type="switch" value={historyEnabled} on:input={(e) => historyEnabled = e.detail.value} />
                            </div>
                            <div class="flex justify-between items-center">
                                <div>
                                    <p>{$i18n.t("account.2.clearHistory")}</p>
                                    <p class="mt-0.5 text-foreground/70 text-sm font-normal">{$i18n.t("account.2.clearHistoryDesc")}</p>
                                </div>
                                <Button type="small" secondary on:click={() => {/* TODO */}}>{$i18n.t("account.2.clearHistoryButton")}</Button>
                            </div>
                        </div>
                    {:else if currentPage == "about"}
                        <div class="w-full h-full flex justify-center items-center" in:fade={$transition.pageIn} out:fade={$transition.pageOut}>
                            <div class="flex flex-col items-center text-center space-y-5">
                                {#if !$account.photo}
                                    <Icon name="account" className="w-32 text-primary" />
                                {:else}
                                    <img src={$account.photo} alt="{$account.username} Profile Picture" class="w-32 rounded-full aspect-square" />
                                {/if}
                                <div class="flex flex-col space-y-1">
                                    <p class="text-2xl font-semibold">{$account.username}</p>
                                    <p class="text-foreground/70">{$i18n.t("account.2.memberSince", { date: $account.createdAt.toLocaleDateString($settings.language), interpolation: { escapeValue: false } })}</p>
                                </div>
                            </div>
                        </div>
                    {/if}
                </div>
            </Columns>
        </div>
    {/if}
</div>
<Modal bind:show={showModal} title={$i18n.t("modal.logout")} button={$i18n.t("modal.yes")} cancelButton={$i18n.t("modal.no")} on:submit={onLogout}>
    <p>{$i18n.t("modal.logoutDesc")}</p>
</Modal>