<script lang="ts">
    import { goto } from "$app/navigation";
    import { i18n } from "$lib/data/i18n.svelte";
    import { setLock, setUnlock } from "$lib/data/disable.svelte";
    import { connection } from "$lib/data/connection.svelte";
    import { setError } from "$lib/data/error.svelte";
    import { settings } from "$lib/data/settings.svelte";
    import PageLayout from "$lib/components/PageLayout.svelte";
    import Input from "$lib/components/Input.svelte";
    import Switch from "$lib/components/Switch.svelte";
    import Dialog from "$lib/components/Dialog.svelte";
    import Button from "$lib/components/Button.svelte";
    import { WebRTC } from "$lib/models/WebRTC.class";

    let n1 = $state(""), n2 = $state(""), n3 = $state(""), n4 = $state(""), n5 = $state(""), n6 = $state("");
    let nearbyShare = $state(settings.nearbyShare), nearbyShareAlert = $state(false);
    const code = $derived(n1[0] + n2[0] + n3[0] + n4[0] + n5[0] + n6[0]);

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
                n1 = pastedCode.slice(0, 1);
                n2 = pastedCode.slice(1, 2);
                n3 = pastedCode.slice(2, 3);
                n4 = pastedCode.slice(3, 4);
                n5 = pastedCode.slice(4, 5);
                n6 = pastedCode.slice(5, 6);
            }
        }
    }

    async function startReceive() {
        setLock(true);

        connection.c = new WebRTC();
        const success = await connection.c.setUpAsReceiver(code);

        setUnlock();

        if (success)
            goto("/receive/review");
        else
            setError("invalidCode");
    }

    $effect(() => {
        if (settings.nearbyShare === nearbyShare)
            return;

        if (nearbyShare)
            nearbyShareAlert = true;
        else
            settings.nearbyShare = nearbyShare;
    });
</script>

<PageLayout title={i18n.t("receive.0.title")} class="flex flex-col items-center">
    <div class="h-full flex flex-col justify-center items-center gap-y-4">
        <h3 class="text-center text-lg font-semibold">{i18n.t("receive.0.code")}</h3>
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
        <p class="font-semibold">{i18n.t("receive.0.nearbyShare")}</p>
        <Switch bind:value={nearbyShare} />
    </div>
    <Button class="w-30 mb-4" disabled={!n1 || !n2 || !n3 || !n4 || !n5 || !n6} onclick={startReceive}>{i18n.t("receive.0.receive")}</Button>
</PageLayout>
<Dialog bind:show={nearbyShareAlert} title={i18n.t("dialog.nearbyShare")} onsubmit={() => settings.nearbyShare = true} oncancel={() => nearbyShare = false}>
    <p>{i18n.t("dialog.nearbyShareDesc.0")}</p>
    <p>{i18n.t("dialog.nearbyShareDesc.1")}</p>
    <p>{i18n.t("dialog.nearbyShareDesc.2")}</p>
</Dialog>