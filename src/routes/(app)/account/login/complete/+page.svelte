<script lang="ts">
    import { onMount } from "svelte";
    import { fly } from "svelte/transition";
    import { i18n } from "$lib/data/i18n.svelte";
    import { account, finishLogin } from "$lib/data/account.svelte";
    import PageLayout from "$lib/components/PageLayout.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import { goto, transitions } from "$lib/utils";

    let loggedIn = $state(false);

    onMount(async () => {
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        const expiresIn = params.get("expires_in");

        if (accessToken && refreshToken && expiresIn) {
            loggedIn = await finishLogin(accessToken, refreshToken, +expiresIn);

            if (loggedIn)
                setTimeout(() => goto("/account"), 3500);
        }
        else
            goto("/account/login");
    });
</script>

<PageLayout title={i18n.t("account.login.complete.title")}>
    {#if !loggedIn}
        <p class="size-full flex justify-center items-center text-lg font-semibold" in:transitions.pageIn out:transitions.pageOut>{i18n.t("account.login.complete.loggingIn")}</p>
    {:else}
        <div class="size-full flex justify-center items-center" in:transitions.pageIn out:transitions.pageOut>
            <div class="flex gap-x-4">
                <div in:fly={{ duration: 1500, delay: 400, x: 100 }}>
                    {#if !account.picture}
                        <Icon name="account" class="size-20 rounded-full" />
                    {:else}
                        <img src={account.picture} class="size-20 rounded-full aspect-square" alt="{account.username} Profile Picture" />
                    {/if}
                </div>
                <div class="min-w-24 flex flex-col justify-center">
                    <p class="text-lg" in:fly={{ duration: 1500, delay: 500, x: 100 }}>{i18n.t("account.login.complete.welcome")}</p>
                    <p class="text-xl font-semibold" in:fly={{ duration: 1500, delay: 550, x: 100 }}>{account.username}</p>
                </div>
            </div>
        </div>
    {/if}
</PageLayout>