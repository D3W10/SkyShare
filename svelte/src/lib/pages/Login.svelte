<script lang="ts">
    import { fade, fly, scale } from "svelte/transition";
    import { i18n } from "$lib/stores/i18nStore";
    import { page } from "$lib/stores/pageStore";
    import { transition } from "$lib/stores/transitionStore";
    import { disable } from "$lib/stores/disableStore";
    import { account } from "$lib/stores/accountStore";
    import { error, ErrorCode } from "$lib/stores/errorStore";
    import { VEStore, validators } from "$lib/models/VEStore.class";
    import Columns from "$lib/components/layout/Columns.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import Input from "$lib/components/Input.svelte";
    import Button from "$lib/components/Button.svelte";
    import Modal from "$lib/components/Modal.svelte";

    let loginData = new VEStore(2, "", validators.string);
    let signupData = new VEStore(3, "", validators.string), signupModal: boolean = false, repeatPassword: string = "";

    async function onLogin() {
        disable.lock();

        if (loginData.a[0][1])
            error.set(ErrorCode.INVALID_USERNAME);
        else if (await account.login(loginData.a[0][0], loginData.a[1][0]))
            page.set("welcome", 2);

        disable.unlock();
    }

    function onRecovery() {

    }

    async function onSignup() {
        disable.lock();

        repeatPassword = "";
        if (signupData.a[0][1])
            error.set(ErrorCode.INVALID_USERNAME);
        else if (signupData.a[1][1])
            error.set(ErrorCode.INVALID_EMAIL);
        else if (signupData.a[2][1])
            error.set(ErrorCode.INVALID_PASSWORD);
        else {
            let check = await account.check(signupData.a[0][0]);

            if (check.success && !check.data)
                error.set(ErrorCode.USERNAME_UNAVAILABLE);
            else
                page.set("login", 5);
        }

        disable.unlock();
    }
</script>

<div class="w-full h-full p-6 space-y-4" in:fade={$transition.pageIn} out:fade={$transition.pageOut}>
    {#if $page.subPage == 0}
        <form class="w-full h-full flex flex-col" in:fly={$transition.subpageIn} out:fly={$transition.subpageOut} on:submit|preventDefault={onLogin}>
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
                                <Input type="username" bind:value={loginData.a[0][0]} bind:error={loginData.a[0][1]} placeholder={$i18n.t("common.required")} on:input={() => loginData.announceChange()} />
                            </div>
                            <div class="space-y-1">
                                <p class="font-semibold">{$i18n.t("login.0.password")}:</p>
                                <Input type="password" bind:value={loginData.a[1][0]} bind:error={loginData.a[1][1]} placeholder={$i18n.t("common.required")} errorChecking={false} on:input={() => loginData.announceChange()} />
                            </div>
                            <div class="flex flex-col items-center space-y-3">
                                <Button type="text" on:click={() => page.set("login", 1)}>{$i18n.t("login.0.forgot")}</Button>
                                <Button type="text" on:click={() => page.set("login", 4)}>{$i18n.t("login.0.create")}</Button>
                            </div>
                        </div>
                    </div>
                    <Button className="w-fit" disabled={!$loginData.isFilled()} submit>{$i18n.t("login.0.login")}</Button>
                </div>
            </Columns>
        </form>
    {:else if $page.subPage == 1}
        <div class="w-full h-full flex flex-col" in:fly={$transition.subpageIn} out:fly={$transition.subpageOut}>
            <div class="flex justify-between items-center">
                <h1 class="w-full text-xl font-semibold">{$i18n.t("login.1.title")}</h1>
                <Button type="invisible" className="h-fit flex items-center text-primary font-semibold" on:click={() => page.set("login", 0)}>
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
                                <Input type="email" placeholder={$i18n.t("common.required")} />
                            </div>
                        </div>
                    </div>
                    <Button className="w-fit" disabled={$disable.d} on:click={onRecovery}>{$i18n.t("login.1.reset")}</Button>
                </div>
            </Columns>
        </div>
    {:else if $page.subPage == 4}
        <form class="w-full h-full flex flex-col" in:fly={$transition.subpageIn} out:fly={$transition.subpageOut} on:submit|preventDefault={() => signupModal = true}>
            <div class="flex justify-between items-center">
                <h1 class="w-full text-xl font-semibold">{$i18n.t("login.4.title")}</h1>
                <Button type="invisible" className="h-fit flex items-center text-primary font-semibold" on:click={() => page.set("login", 0)}>
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
                                <Input type="username" bind:value={signupData.a[0][0]} bind:error={signupData.a[0][1]} placeholder={$i18n.t("common.required")} on:input={() => signupData.announceChange()} />
                            </div>
                            <div class="space-y-1">
                                <p class="font-semibold">{$i18n.t("login.4.email")}:</p>
                                <Input type="email" bind:value={signupData.a[1][0]} bind:error={signupData.a[1][1]} placeholder={$i18n.t("common.required")} on:input={() => signupData.announceChange()} />
                            </div>
                            <div class="space-y-1">
                                <p class="font-semibold">{$i18n.t("login.4.password")}:</p>
                                <Input type="password" bind:value={signupData.a[2][0]} bind:error={signupData.a[2][1]} placeholder={$i18n.t("common.required")} on:input={() => signupData.announceChange()} />
                            </div>
                        </div>
                    </div>
                    <Button className="w-fit" disabled={!$signupData.isFilled()} submit>{$i18n.t("login.4.signup")}</Button>
                </div>
            </Columns>
        </form>
    {:else if $page.subPage == 5}
        <form class="w-full h-full flex flex-col" in:fly={$transition.subpageIn} out:fly={$transition.subpageOut} on:submit|preventDefault={() => signupModal = true}>
            <div class="flex justify-between items-center">
                <h1 class="w-full text-xl font-semibold">{$i18n.t("login.5.title")}</h1>
                <Button type="invisible" className="h-fit flex items-center text-primary font-semibold" on:click={() => page.set("login", 4)}>
                    <Icon name="chevron" className="w-5 h-5 mr-1 fill-current rotate-90" />
                    {$i18n.t("common.back")}
                </Button>
            </div>
            <Columns>
                <div slot="left" class="flex justify-center items-center" in:scale|global={$transition.iconJump}>
                    <Icon name="account" className="w-2/3 text-primary" />
                </div>
                <div slot="right" class="flex flex-col justify-between items-center">
                    <div class="w-full h-full flex justify-center items-center">
                        <div class="w-3/5 space-y-8">
                            <div class="space-y-1">
                                <p class="font-semibold">{$i18n.t("login.5.photo")}:</p>
                                <Button className="w-full" type="small" secondary>{$i18n.t("login.5.photoChoose")}</Button>
                            </div>
                        </div>
                    </div>
                    <Button className="w-fit" submit>{$i18n.t("login.4.signup")}</Button>
                </div>
            </Columns>
        </form>
    {/if}
</div>
<Modal bind:show={signupModal} title={$i18n.t("login.4.confirmModal")} disabled={signupData.a[2][0] != repeatPassword} on:submit={onSignup}>
    <p>{$i18n.t("login.4.confirmModalDesc")}</p>
    <Input type="password" bind:value={repeatPassword} placeholder={$i18n.t("common.required")} />
</Modal>