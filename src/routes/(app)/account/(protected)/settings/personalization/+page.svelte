<script lang="ts">
    import { scale } from "svelte/transition";
    import { i18n } from "$lib/data/i18n.svelte";
    import { app } from "$lib/data/app.svelte";
    import { setLock, setUnlock } from "$lib/data/disable.svelte";
    import { setError } from "$lib/data/error.svelte";
    import { account, changePicture } from "$lib/data/account.svelte";
    import Button from "$lib/components/Button.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import ProfilePicture from "$lib/components/ProfilePicture.svelte";
    import { transitions } from "$lib/utils";

    let picture = $state(account.picture);

    async function selectPicture() {
        const photoDialog = await app.showOpenDialog({
            title: i18n.t("account.settings.choosePicture"),
            properties: ["openFile"],
            filters: [{ name: "Imagens (*.png, *.jpg, *.jpeg, *.jpe, *.jif, *.jfif, *.gif)", extensions: ["png", "jpg", "jpeg", "jpe", "jif", "jfif", "gif"] }]
        });

        if (!photoDialog.canceled)
            picture = "io://i?path=" + photoDialog.files[0].path;
    }

    async function savePicture() {
        setLock(true);

        if (!(await changePicture(picture)))
            setError("editError");

        setUnlock();
    }
</script>

<div class="w-full flex justify-center items-center relative" in:transitions.pageIn out:transitions.pageOut>
    <div class="flex flex-col items-center gap-y-6">
        <div class="grid *:col-[1] *:row-[1]">
            {#key picture}
                <div in:scale={{ duration: 300, delay: 300, start: 0.5 }} out:scale={{ duration: 300, start: 0.5 }}>
                    <ProfilePicture class="size-24" {picture} />
                </div>
            {/key}
        </div>
        <div class="flex gap-x-2">
            <Button class="p-2" type="secondary" disabled={picture === account.picture} onclick={() => picture = account.picture}>
                <Icon name="undo" class="size-6" />
            </Button>
            <Button class="w-40" type="secondary" onclick={selectPicture}>{i18n.t("account.settings.choosePicture")}</Button>
            <Button class="p-2" type="secondary" disabled={picture === ""} onclick={() => picture = ""}>
                <Icon name="delete" class="size-6" />
            </Button>
        </div>
        <Button class="w-32 absolute bottom-0" disabled={picture === account.picture} onclick={savePicture}>{i18n.t("account.settings.save")}</Button>
    </div>
</div>