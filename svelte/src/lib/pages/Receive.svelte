<script lang="ts">
    import { fade, fly } from "svelte/transition";
    import { i18n } from "$lib/stores/i18nStore";
    import { app } from "$lib/stores/appStore";
    import { page } from "$lib/stores/pageStore";
    import { disable } from "$lib/stores/disableStore";
    import { transition } from "$lib/stores/transitionStore";
    import { settings } from "$lib/stores/settingsStore";
    import Columns from "$lib/components/layout/Columns.svelte";
    import Input from "$lib/components/Input.svelte";
    import Button from "$lib/components/Button.svelte";
    import Modal from "$lib/components/Modal.svelte";

    let code: number[] = [], elms: Input[] = [];
    let nearbyShareAlert: boolean = false;
    let peerConnection: RTCPeerConnection | null = null

    function onKeydown(i: number, e: KeyboardEvent) {
        const isNum = !isNaN(+e.key);

        if (e.key == "Backspace" && !code[i] && i != 0 || e.key == "ArrowLeft" && i != 0)
            elms[i - 1].input.elm.focus();
        else if (e.key == "ArrowRight" && i != 5)
            elms[i + 1].input.elm.focus();
        else if (code[i] && isNum)
            e.preventDefault();
        else if (isNum && i != 5)
            setTimeout(() => elms[i + 1].input.elm.focus(), 10);
    }

    function onPaste(e: ClipboardEvent) {
        e.preventDefault();

        if (e.clipboardData != null) {
            let pastedCode = e.clipboardData.getData("text");

            if (/^\d{6}$/.test(pastedCode))
                code = pastedCode.split("").slice(0, 6).map(c => +c);
        }
    }

    async function joinChannel() {
        if (code.some(n => typeof n != "number"))
            return;

        disable.lock();

        $app.log("Creating a new remote RTC connection...");
        peerConnection = new RTCPeerConnection(await $app.getServers());

        disable.unlock();
    }
</script>

<div class="w-full h-full p-6" in:fade={$transition.pageIn} out:fade={$transition.pageOut}>
    {#if $page.subPage == 0}
        <div class="w-full h-full flex flex-col space-y-4" in:fly={$transition.subpageIn} out:fly={$transition.subpageOut}>
            <h1 class="w-full text-xl font-semibold">{$i18n.t("receive.0.title")}</h1>
            <Columns invert>
                <div slot="left" class="flex flex-col justify-between items-center">
                    <div class="h-6" />
                    <div class="flex flex-col items-center space-y-4">
                        <p class="text-lg font-semibold">{$i18n.t("receive.0.code")}:</p>
                        <div class="flex space-x-2">
                            <Input bind:this={elms[0]} type="number" className="aspect-square" innerClassName="!px-0.5 !py-0 !text-2xl !font-semibold text-center !leading-tight" bind:value={code[0]} on:keydown={e => onKeydown(0, e)} on:paste={onPaste} />
                            <Input bind:this={elms[1]} type="number" className="aspect-square" innerClassName="!px-0.5 !py-0 !text-2xl !font-semibold text-center !leading-tight" bind:value={code[1]} on:keydown={e => onKeydown(1, e)} on:paste={onPaste} />
                            <Input bind:this={elms[2]} type="number" className="aspect-square" innerClassName="!px-0.5 !py-0 !text-2xl !font-semibold text-center !leading-tight" bind:value={code[2]} on:keydown={e => onKeydown(2, e)} on:paste={onPaste} />
                            <Input bind:this={elms[3]} type="number" className="aspect-square" innerClassName="!px-0.5 !py-0 !text-2xl !font-semibold text-center !leading-tight" bind:value={code[3]} on:keydown={e => onKeydown(3, e)} on:paste={onPaste} />
                            <Input bind:this={elms[4]} type="number" className="aspect-square" innerClassName="!px-0.5 !py-0 !text-2xl !font-semibold text-center !leading-tight" bind:value={code[4]} on:keydown={e => onKeydown(4, e)} on:paste={onPaste} />
                            <Input bind:this={elms[5]} type="number" className="aspect-square" innerClassName="!px-0.5 !py-0 !text-2xl !font-semibold text-center !leading-tight" bind:value={code[5]} on:keydown={e => onKeydown(5, e)} on:paste={onPaste} />
                        </div>
                    </div>
                    <div class="flex space-x-4">
                        <p class="font-semibold">{$i18n.t("receive.0.nearbyShare")}</p>
                        <Input type="switch" value={$settings.nearbyShare} on:input={(e) => { settings.update("nearbyShare", e.detail.value); if (e.detail.value) nearbyShareAlert = true; }} />
                    </div>
                </div>
                <div slot="right" class="flex flex-col justify-between items-center space-y-6">
                    <div class="w-full h-full p-1 bg-secondary rounded-xl shadow-md ring-1 ring-foreground/10 space-y-1">
                        <canvas></canvas>
                    </div>
                    <Button className="w-fit" disabled={code.some(n => typeof n != "number")} on:click={joinChannel}>{$i18n.t("receive.0.receive")}</Button>
                </div>
            </Columns>
        </div>
    {/if}
</div>
<Modal bind:show={nearbyShareAlert} title={$i18n.t("modal.nearbyShare")} canCancel={false}>
    <p>{$i18n.t("modal.nearbyShareDesc.0")}</p>
    <p>{$i18n.t("modal.nearbyShareDesc.1")}</p>
    <p>{$i18n.t("modal.nearbyShareDesc.2")}</p>
</Modal>