<script lang="ts">
    import { fade, fly, scale } from "svelte/transition";
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
    import Input from "$lib/components/Input.svelte";
    import Button from "$lib/components/Button.svelte";
    import ProgressBar from "$lib/components/ProgressBar.svelte";
    import Modal from "$lib/components/Modal.svelte";

    let loginData = new FValid<[string, string]>(["", ""]);
    let requestData = new FValid<[string]>([""]);
    let recoveryData = new FValid<[string]>([""]), recoveryModal: boolean = false, recoveryRepPassword: string = "", recoveredModal: boolean = false;
    let signupData = new FValid<[string, string, string]>(["", "", ""]), signupModal: boolean = false, signupRepPassword: string = "", signupPhoto: string = "";

    async function onLogin() {
        disable.lock();

        if ($loginData[0].e)
            error.set(ErrorCode.INVALID_USERNAME);
        else if (await account.login($loginData[0].v, $loginData[1].v))
            page.set("welcome", 3);

        disable.unlock();
    }

    async function onRequest() {
        disable.lock();

        if ($requestData[0].e)
            error.set(ErrorCode.INVALID_EMAIL);
        else {
            const check = await account.request("recovery", $requestData[0].v, $settings.language);

            if (check.success)
                page.set("login", 2);
        }

        disable.unlock();
    }

    async function onRecovery() {
        disable.lock();

        if ($recoveryData[0].e)
            error.set(ErrorCode.INVALID_PASSWORD);
        else {
            const check = await account.recovery($requestData[0].v, $recoveryData[0].v);

            if (check.success)
                recoveredModal = true;
        }

        disable.unlock();
    }

    async function onSignup() {
        disable.lock();

        signupRepPassword = "";
        if ($signupData[0].e)
            error.set(ErrorCode.INVALID_USERNAME);
        else if ($signupData[1].e)
            error.set(ErrorCode.INVALID_EMAIL);
        else if ($signupData[2].e)
            error.set(ErrorCode.INVALID_PASSWORD);
        else {
            const check = await account.check($signupData[0].v, $signupData[1].v);

            if (check.success) {
                if (!check.data.username)
                    error.set(ErrorCode.USERNAME_UNAVAILABLE);
                else if (!check.data.email)
                    error.set(ErrorCode.EMAIL_UNAVAILABLE);
                else
                    page.set("login", 5);
            }
        }

        disable.unlock();
    }

    async function choosePhoto() {
        const photoDialog = await $app.showOpenDialog({
            title: $i18n.t("login.5.photoChoose"),
            properties: ["openFile"],
            filters: [{ name: "Imagens (*.png, *.jpg, *.jpeg, *.jpe, *.jif, *.jfif, *.gif)", extensions: ["png", "jpg", "jpeg", "jpe", "jif", "jfif", "gif"] }]
        })!;

        if (!photoDialog.canceled)
            signupPhoto = photoDialog.files[0].path.replace(/\\/g, "/");
    }

    async function onSignupComplete() {
        disable.lock();

        if (await account.signup($signupData[0].v, $signupData[1].v, $signupData[2].v, signupPhoto))
            page.set("welcome");

        disable.unlock();
    }
</script>

<div class="w-full h-full p-6" in:fade={$transition.pageIn} out:fade={$transition.pageOut}>
    {#if $page.subPage == 0}
        <form class="w-full h-full flex flex-col space-y-4" in:fly={$transition.subpageIn} out:fly={$transition.subpageOut} on:submit|preventDefault={onLogin}>
            <h1 class="w-full text-xl font-semibold">{$i18n.t("login.0.title")}</h1>
            <Columns>
                <div slot="left" class="flex justify-center items-center" in:scale|global={$transition.iconJump}>
                    <Icon name="account" className="w-2/3 text-primary" />
                </div>
                <div slot="right" class="flex flex-col justify-between items-center">
                    <div class="w-full h-full flex justify-center items-center">
                        <div class="w-3/5 space-y-8">
                            <div class="space-y-1">
                                <p class="font-semibold">{$i18n.t("login.0.username")}:</p>
                                <Input type="username" value={$loginData[0].v} error={$loginData[0].e} placeholder={$i18n.t("common.required")} on:input={e => loginData.update(0, e.detail.value, e.detail.error)} />
                            </div>
                            <div class="space-y-1">
                                <p class="font-semibold">{$i18n.t("login.0.password")}:</p>
                                <Input type="password" value={$loginData[1].v} error={$loginData[1].e} placeholder={$i18n.t("common.required")} errorChecking={false} on:input={e => loginData.update(1, e.detail.value, e.detail.error)} />
                            </div>
                            <div class="flex flex-col items-center space-y-3">
                                <Button type="text" on:click={() => page.set("login", 1)}>{$i18n.t("login.0.forgot")}</Button>
                                <Button type="text" on:click={() => page.set("login", 4)}>{$i18n.t("login.0.create")}</Button>
                            </div>
                        </div>
                    </div>
                    <Button className="w-fit" disabled={!$loginData.every(loginData.verifier)} submit>{$i18n.t("login.0.login")}</Button>
                </div>
            </Columns>
        </form>
    {:else if $page.subPage == 1}
        <form class="w-full h-full flex flex-col space-y-4" in:fly={$transition.subpageIn} out:fly={$transition.subpageOut} on:submit|preventDefault={onRequest}>
            <div class="flex justify-between items-center">
                <h1 class="w-full text-xl font-semibold">{$i18n.t("login.1.title")}</h1>
                <Button type="invisible" className="h-fit flex items-center text-primary font-semibold" on:click={() => page.set("login")}>
                    <Icon name="chevron" className="w-5 h-5 mr-1 fill-current rotate-90" />
                    {$i18n.t("common.back")}
                </Button>
            </div>
            <Columns>
                <div slot="left" class="flex justify-center items-center" in:scale|global={$transition.iconJump}>
                    <Icon name="accountRecovery" className="w-2/3 text-primary" />
                </div>
                <div slot="right" class="flex flex-col justify-between items-center">
                    <div class="w-full h-full flex justify-center items-center">
                        <div class="w-3/5 space-y-8">
                            <div class="space-y-1">
                                <p class="font-semibold">{$i18n.t("login.1.email")}:</p>
                                <Input type="email" value={$requestData[0].v} error={$requestData[0].e} placeholder={$i18n.t("common.required")} on:input={e => requestData.update(0, e.detail.value, e.detail.error)} />
                            </div>
                        </div>
                    </div>
                    <Button className="w-fit" disabled={!$requestData.every(requestData.verifier)} submit>{$i18n.t("login.1.recover")}</Button>
                </div>
            </Columns>
        </form>
    {:else if $page.subPage == 2}
        <div class="w-full h-full flex flex-col space-y-4" in:fly={$transition.subpageIn} out:fly={$transition.subpageOut}>
            <h1 class="w-full text-xl font-semibold">{$i18n.t("login.2.title")}</h1>
            <Columns>
                <div slot="left">
                    <div class="w-full h-full flex justify-center items-center relative p-5 bg-secondary rounded-xl shadow-md ring-1 ring-foreground/10 overflow-hidden space-y-1">
                        <ProgressBar className="!absolute top-0 left-0 right-0 rounded-none" indeterminate />
                        <div class="flex flex-col items-center space-y-1.5">
                            <Icon name="email" className="w-1/3 text-account mb-2" />
                            <p class="text-center font-semibold">{$i18n.t("login.2.sent")}</p>
                            <p class="text-sm text-center">{$i18n.t("login.2.sentDesc")}</p>
                        </div>
                    </div>
                </div>
                <div slot="right" class="flex flex-col justify-between items-center">
                    <div class="w-full h-full flex justify-center items-center">
                        <div class="w-3/5 space-y-8">
                            <p class="text-center font-semibold">{$i18n.t("login.2.notes.0")}</p>
                            <p class="text-center font-semibold">{$i18n.t("login.2.notes.1")}</p>
                        </div>
                    </div>
                </div>
            </Columns>
        </div>
    {:else if $page.subPage == 3}
        <form class="w-full h-full flex flex-col space-y-4" in:fly={$transition.subpageIn} out:fly={$transition.subpageOut} on:submit|preventDefault={() => recoveryModal = true}>
            <h1 class="w-full text-xl font-semibold">{$i18n.t("login.3.title")}</h1>
            <Columns>
                <div slot="left" class="flex justify-center items-center" in:scale|global={$transition.iconJump}>
                    <Icon name="accountRecovery" className="w-2/3 text-primary" />
                </div>
                <div slot="right" class="flex flex-col justify-between items-center">
                    <div class="w-full h-full flex justify-center items-center">
                        <div class="w-3/5 space-y-8">
                            <div class="space-y-1">
                                <p class="font-semibold">{$i18n.t("login.3.password")}:</p>
                                <Input type="password" value={$recoveryData[0].v} error={$recoveryData[0].e} placeholder={$i18n.t("common.required")} on:input={e => recoveryData.update(0, e.detail.value, e.detail.error)} />
                            </div>
                        </div>
                    </div>
                    <Button className="w-fit" disabled={!$recoveryData.every(recoveryData.verifier)} submit>{$i18n.t("login.3.recover")}</Button>
                </div>
            </Columns>
        </form>
    {:else if $page.subPage == 4}
        <form class="w-full h-full flex flex-col space-y-4" in:fly={$transition.subpageIn} out:fly={$transition.subpageOut} on:submit|preventDefault={() => signupModal = true}>
            <div class="flex justify-between items-center">
                <h1 class="w-full text-xl font-semibold">{$i18n.t("login.4.title")}</h1>
                <Button type="invisible" className="h-fit flex items-center text-primary font-semibold" on:click={() => page.set("login")}>
                    <Icon name="chevron" className="w-5 h-5 mr-1 fill-current rotate-90" />
                    {$i18n.t("common.back")}
                </Button>
            </div>
            <Columns>
                <div slot="left" class="flex justify-center items-center" in:scale|global={$transition.iconJump}>
                    <Icon name="accountCreate" className="w-2/3 text-primary" />
                </div>
                <div slot="right" class="flex flex-col justify-between items-center">
                    <div class="w-full h-full flex justify-center items-center">
                        <div class="w-3/5 space-y-8">
                            <div class="space-y-1">
                                <p class="font-semibold">{$i18n.t("login.4.username")}:</p>
                                <Input type="username" value={$signupData[0].v} error={$signupData[0].e} placeholder={$i18n.t("common.required")} on:input={e => signupData.update(0, e.detail.value, e.detail.error)} />
                            </div>
                            <div class="space-y-1">
                                <p class="font-semibold">{$i18n.t("login.4.email")}:</p>
                                <Input type="email" value={$signupData[1].v} error={$signupData[1].e} placeholder={$i18n.t("common.required")} on:input={e => signupData.update(1, e.detail.value, e.detail.error)} />
                            </div>
                            <div class="space-y-1">
                                <p class="font-semibold">{$i18n.t("login.4.password")}:</p>
                                <Input type="password" value={$signupData[2].v} error={$signupData[2].e} placeholder={$i18n.t("common.required")} on:input={e => signupData.update(2, e.detail.value, e.detail.error)} />
                            </div>
                        </div>
                    </div>
                    <Button className="w-fit" disabled={!$signupData.every(signupData.verifier)} submit>{$i18n.t("login.4.signup")}</Button>
                </div>
            </Columns>
        </form>
    {:else if $page.subPage == 5}
        <form class="w-full h-full flex flex-col space-y-4" in:fly={$transition.subpageIn} out:fly={$transition.subpageOut} on:submit|preventDefault={onSignupComplete}>
            <div class="flex justify-between items-center">
                <h1 class="w-full text-xl font-semibold">{$i18n.t("login.5.title")}</h1>
                <Button type="invisible" className="h-fit flex items-center text-primary font-semibold" on:click={() => page.set("login", 4)}>
                    <Icon name="chevron" className="w-5 h-5 mr-1 fill-current rotate-90" />
                    {$i18n.t("common.back")}
                </Button>
            </div>
            <Columns>
                <div slot="left" class="relative" in:scale|global={$transition.iconJump}>
                    {#if signupPhoto == ""}
                        <div class="flex justify-center items-center absolute inset-0" in:scale={{ duration: 1000, delay: 750, easing: quartOut, opacity: 1 }} out:scale={{ duration: 750, easing: quartIn, opacity: 1 }}>
                            <Icon name="account" className="w-2/3 text-primary" />
                        </div>
                    {:else}
                        <div class="flex justify-center items-center absolute inset-0" in:scale={{ duration: 1000, delay: 750, easing: quartOut, opacity: 1 }} out:scale={{ duration: 750, easing: quartIn, opacity: 1 }}>
                            <img src="app://{signupPhoto}" alt="{$signupData[0].v} Profile Picture" class="w-2/3 absolute rounded-full aspect-square" />
                        </div>
                    {/if}
                </div>
                <div slot="right" class="flex flex-col justify-between items-center">
                    <div class="w-full h-full flex justify-center items-center">
                        <div class="w-3/5 space-y-8">
                            <div class="space-y-1">
                                <p class="font-semibold">{$i18n.t("login.5.photo")}:</p>
                                <div class="flex space-x-2">
                                    <Button className="w-full" type="small" secondary on:click={choosePhoto}>{$i18n.t("login.5.photoChoose")}</Button>
                                    <Button className="min-w-8 min-h-8 !p-1" type="small" secondary disabled={signupPhoto == ""} on:click={() => signupPhoto = ""}>
                                        <Icon name="dismiss" className="w-6 aspect-square" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Button className="w-fit" submit>{$i18n.t("login.4.signup")}</Button>
                </div>
            </Columns>
        </form>
    {/if}
</div>
<Modal bind:show={recoveryModal} title={$i18n.t("modal.confirmPasswordRecovery")} disabled={$recoveryData[0].v != recoveryRepPassword} on:submit={onRecovery}>
    <p>{$i18n.t("modal.confirmPasswordRecoveryDesc")}</p>
    <Input type="password" bind:value={recoveryRepPassword} placeholder={$i18n.t("common.required")} />
</Modal>
<Modal bind:show={recoveredModal} title={$i18n.t("modal.accountRecovered")} canCancel={false} on:submit={() => page.set("login")}>
    <p>{$i18n.t("modal.accountRecoveredDesc")}</p>
</Modal>
<Modal bind:show={signupModal} title={$i18n.t("modal.confirmPasswordSignup")} disabled={$signupData[2].v != signupRepPassword} on:submit={onSignup}>
    <p>{$i18n.t("modal.confirmPasswordSignupDesc")}</p>
    <Input type="password" bind:value={signupRepPassword} placeholder={$i18n.t("common.required")} />
</Modal>