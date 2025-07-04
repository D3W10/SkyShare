<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { fade, fly } from "svelte/transition";
    import { i18n } from "$lib/data/i18n.svelte";
    import { account, login } from "$lib/data/account.svelte";
    import { setError } from "$lib/data/error.svelte";
    import PageLayout from "$lib/components/PageLayout.svelte";
    import ProfilePicture from "$lib/components/ProfilePicture.svelte";
    import { goto, transitions } from "$lib/utils";

    let loggedIn = $state(false), revealed = $state(false);
    let timeout: NodeJS.Timeout | undefined;

    onMount(async () => {
        revealed = true;

        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        const expiresOn = params.get("expires_on");

        const onError = () => {
            setError("loginError");
            goto("/account/login");
        };

        if (code === "success" && accessToken && refreshToken && expiresOn) {
            loggedIn = await login(accessToken, refreshToken, +expiresOn);

            if (loggedIn)
                timeout = setTimeout(() => goto("/account"), 3500);
            else
                onError();
        }
        else
            onError();
    });

    onDestroy(() => {
        clearTimeout(timeout);
    });
</script>

<PageLayout title={i18n.t("account.login.complete.title")}>
    {#if !loggedIn}
        <div class="size-full flex justify-center items-center" in:transitions.pageIn out:transitions.pageOut>
            {#if revealed}
                <p class="text-lg font-semibold" in:fade={{ duration: 400, delay: 400 }}>{i18n.t("account.login.complete.loggingIn")}</p>
            {/if}
        </div>
    {:else}
        <div class="size-full flex justify-center items-center" in:transitions.pageIn out:transitions.pageOut>
            <div class="flex gap-x-4">
                <div in:fly={{ duration: 1500, delay: 400, x: 100 }}>
                    <ProfilePicture />
                </div>
                <div class="min-w-24 flex flex-col justify-center">
                    <p class="text-lg" in:fly={{ duration: 1500, delay: 500, x: 100 }}>{i18n.t("account.login.complete.welcome")}</p>
                    <p class="text-xl font-semibold" in:fly={{ duration: 1500, delay: 550, x: 100 }}>{account.username}</p>
                </div>
            </div>
        </div>
    {/if}
</PageLayout>