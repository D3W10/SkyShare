<script lang="ts">
    import { fade, fly, scale } from "svelte/transition";
    import { i18n } from "$lib/stores/i18nStore";
    import { page } from "$lib/stores/pageStore";
    import { transition } from "$lib/stores/transitionStore";
    import { disable } from "$lib/stores/disableStore";
    import { account } from "$lib/stores/accountStore";
    import { getVE } from "$lib/models/VEPair.type";
    import Columns from "$lib/components/layout/Columns.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import Input from "$lib/components/Input.svelte";
    import Button from "$lib/components/Button.svelte";

    let loginInfo = [getVE(""), getVE("")], loginDisable: boolean = true;

    const onLoginInput = () => loginDisable = loginInfo[0][0] == "" || loginInfo[1][0] == "";

    async function onLogin() {
        disable.lock();

        if (await account.login(loginInfo[0][0], loginInfo[1][0]))
            page.set("home");

        disable.unlock();
    }

    function onRecovery() {

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
                                <Input type="username" bind:value={loginInfo[0][0]} bind:error={loginInfo[0][1]} placeholder={$i18n.t("common.required")} on:input={onLoginInput} />
                            </div>
                            <div class="space-y-1">
                                <p class="font-semibold">{$i18n.t("login.0.password")}:</p>
                                <Input type="password" bind:value={loginInfo[1][0]} bind:error={loginInfo[1][1]} placeholder={$i18n.t("common.required")} errorChecking={false} on:input={onLoginInput} />
                            </div>
                            <div class="flex flex-col items-center space-y-3">
                                <Button type="text" on:click={() => page.set("login", 1)}>{$i18n.t("login.0.forgot")}</Button>
                                <Button type="text" on:click={() => page.set("login", 4)}>{$i18n.t("login.0.create")}</Button>
                            </div>
                        </div>
                    </div>
                    <Button className="w-fit" disabled={loginDisable} submit>{$i18n.t("login.0.login")}</Button>
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
                                <Input type="email" placeholder={$i18n.t("common.required")} maxlength={250} disabled={$disable.d} />
                            </div>
                        </div>
                    </div>
                    <Button className="w-fit" disabled={$disable.d} on:click={onRecovery}>{$i18n.t("login.1.reset")}</Button>
                </div>
            </Columns>
        </div>
    {/if}
</div>