<script lang="ts">
    import { i18n } from "$lib/data/i18n.svelte";
    import PageLayout from "$lib/components/PageLayout.svelte";
    import Input from "$lib/components/Input.svelte";
    import Button from "$lib/components/Button.svelte";

    let n1 = $state(""), n2 = $state(""), n3 = $state(""), n4 = $state(""), n5 = $state(""), n6 = $state("");
    const code = $derived(+(n1[0] + n2[0] + n3[0] + n4[0] + n5[0] + n6[0]));

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
</script>

<PageLayout title={i18n.t("receive.0.title")} class="pb-8 flex flex-col items-center">
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
    <Button class="w-30" disabled={!n1 || !n2 || !n3 || !n4 || !n5 || !n6}>{i18n.t("receive.0.receive")}</Button>
</PageLayout>