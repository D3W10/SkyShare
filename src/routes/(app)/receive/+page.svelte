<script lang="ts">
    import { i18n } from "$lib/data/i18n.svelte";
    import { app } from "$lib/data/app.svelte";
    import { setLock, setUnlock } from "$lib/data/disable.svelte";
    import { connection } from "$lib/data/connection.svelte";
    import { cleanup } from "$lib/data/cleanup.svelte";
    import { settings } from "$lib/data/settings.svelte";
    import PageLayout from "$lib/components/PageLayout.svelte";
    import Input from "$lib/components/Input.svelte";
    import Switch from "$lib/components/Switch.svelte";
    import Dialog from "$lib/components/Dialog.svelte";
    import Button from "$lib/components/Button.svelte";
    import { WebRTC } from "$lib/models/WebRTC.class";
    import { AppError } from "$lib/models/AppError.class";
    import { goto, safeTry } from "$lib/utils";

    let n1 = $state<number | null>(null), n2 = $state<number | null>(null), n3 = $state<number | null>(null), n4 = $state<number | null>(null), n5 = $state<number | null>(null), n6 = $state<number | null>(null);
    let nearbyShare = $state(settings.nearbyShare), nearbyShareAlert = $state(false);
    const code = $derived(String(n1) + String(n2) + String(n3) + String(n4) + String(n5) + String(n6));

    function onKeydown(e: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement; }) {
        if (e.key === "Backspace" && e.currentTarget.value.length === 0 && e.currentTarget.previousElementSibling) {
            e.preventDefault();
            (e.currentTarget.previousElementSibling as HTMLInputElement).focus();
        }
    }

    function onBeforeInput(e: InputEvent & { currentTarget: EventTarget & HTMLInputElement; }) {
        if (e.data && e.currentTarget.value.length !== 0)
            e.preventDefault();
    }

    function onInput(e: Event & { currentTarget: EventTarget & HTMLInputElement; data?: string; }) {
        if (e.data && e.currentTarget.nextElementSibling)
            (e.currentTarget.nextElementSibling as HTMLInputElement).focus();
    }

    function onPaste(e: ClipboardEvent) {
        e.preventDefault();

        if (e.clipboardData) {
            const pastedCode = e.clipboardData.getData("text");

            if (/^\d{6}/.test(pastedCode)) {
                n1 = +pastedCode.slice(0, 1);
                n2 = +pastedCode.slice(1, 2);
                n3 = +pastedCode.slice(2, 3);
                n4 = +pastedCode.slice(3, 4);
                n5 = +pastedCode.slice(4, 5);
                n6 = +pastedCode.slice(5, 6);
            }
        }
    }

    function startReceive() {
        safeTry(async () => {
            setLock(true);

            const [error, data] = await app.apiCall<{ status: boolean }>("/transfer/" + code + "/check");
            if (error)
                return setUnlock();
            else if (!data.status)
                throw new AppError("invalidCode");

            connection.c = new WebRTC(await WebRTC.getCredentials());
            cleanup.push(() => connection.c?.disconnect());
            await connection.c.setUpAsReceiver(code);

            goto("/receive/code?code=" + code);
        });
    }

    $effect(() => {
        if (settings.nearbyShare !== nearbyShare) {
            if (nearbyShare)
                nearbyShareAlert = true;
            else
                settings.nearbyShare = nearbyShare;
        }
    });
</script>

<PageLayout title={i18n.t("receive.title")} class="flex flex-col items-center">
    <div class="h-full flex flex-col justify-center items-center gap-y-4">
        <h3 class="text-center text-lg font-semibold">{i18n.t("receive.code")}</h3>
        <div class="flex gap-x-4">
            <Input type="number" class="size-12 text-center text-3xl font-semibold" bind:value={n1} onkeydown={onKeydown} onbeforeinput={onBeforeInput} oninput={onInput} onpaste={onPaste} />
            <Input type="number" class="size-12 text-center text-3xl font-semibold" bind:value={n2} onkeydown={onKeydown} onbeforeinput={onBeforeInput} oninput={onInput} onpaste={onPaste} />
            <Input type="number" class="size-12 text-center text-3xl font-semibold" bind:value={n3} onkeydown={onKeydown} onbeforeinput={onBeforeInput} oninput={onInput} onpaste={onPaste} />
            <Input type="number" class="size-12 text-center text-3xl font-semibold" bind:value={n4} onkeydown={onKeydown} onbeforeinput={onBeforeInput} oninput={onInput} onpaste={onPaste} />
            <Input type="number" class="size-12 text-center text-3xl font-semibold" bind:value={n5} onkeydown={onKeydown} onbeforeinput={onBeforeInput} oninput={onInput} onpaste={onPaste} />
            <Input type="number" class="size-12 text-center text-3xl font-semibold" bind:value={n6} onkeydown={onKeydown} onbeforeinput={onBeforeInput} oninput={onInput} onpaste={onPaste} />
        </div>
    </div>
    <div class="flex gap-x-4 absolute bottom-6 left-6">
        <p class="font-semibold">{i18n.t("receive.nearbyShare")}</p>
        <Switch bind:value={nearbyShare} />
    </div>
    <Button class="w-30 mb-4" disabled={[n1, n2, n3, n4, n5, n6].includes(null)} onclick={startReceive}>{i18n.t("receive.receive")}</Button>
</PageLayout>
<Dialog bind:show={nearbyShareAlert} title={i18n.t("dialog.nearbyShare")} onsubmit={() => settings.nearbyShare = true} oncancel={() => nearbyShare = false}>
    <p>{i18n.t("dialog.nearbyShareDesc.0")}</p>
    <p>{i18n.t("dialog.nearbyShareDesc.1")}</p>
    <p>{i18n.t("dialog.nearbyShareDesc.2")}</p>
</Dialog>