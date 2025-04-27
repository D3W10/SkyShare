<script lang="ts">
    import { i18n } from "$lib/data/i18n.svelte";
    import PageLayout from "$lib/components/PageLayout.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import Input from "$lib/components/Input.svelte";
    import Link from "$lib/components/Link.svelte";
    import Button from "$lib/components/Button.svelte";

    let username = $state(""), password = $state("");
</script>

<PageLayout title={i18n.t("login.0.title")} class="flex gap-x-6">
    <div class="flex justify-center items-center flex-1">
        <Icon name="account64" class="w-44 text-accent" />
    </div>
    <div class="flex flex-col items-center flex-1">
        <div class="w-full px-14 flex flex-col justify-center flex-1 gap-y-6">
            <div class="space-y-2">
                <h3 class="font-semibold">{i18n.t("login.0.username")}</h3>
                <Input type="text" class="w-full" bind:value={username} placeholder={i18n.t("common.required")} />
            </div>
            <div class="space-y-2">
                <h3 class="font-semibold">{i18n.t("login.0.password")}</h3>
                <Input type="password" class="w-full" bind:value={password} placeholder={i18n.t("common.required")} />
            </div>
            <div class="space-y-2">
                <Link href="/account/recovery" class="text-center">{i18n.t("login.0.recovery")}</Link>
                <Link href="/account/signup" class="text-center">{i18n.t("login.0.signup")}</Link>
            </div>
        </div>
        <Button class="w-30 mb-4" disabled={false}>{i18n.t("login.0.login")}</Button>
    </div>
</PageLayout>