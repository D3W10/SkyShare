<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { i18n } from "$lib/data/i18n.svelte";
    import { setLock, setUnlock } from "$lib/data/disable.svelte";
    import { finishLogin } from "$lib/data/account.svelte";
    import PageLayout from "$lib/components/PageLayout.svelte";

    setLock(true);

    onMount(() => {
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        const expiresIn = params.get("expires_in");

        if (accessToken && refreshToken && expiresIn)
            finishLogin(accessToken, refreshToken, +expiresIn);

        return () => setUnlock();
    });
</script>


<PageLayout title={i18n.t("receive.1")}>
    <p class="size-full flex justify-center items-center text-lg font-semibold">{i18n.t("receive.1")}</p>
</PageLayout>