<script lang="ts">
    import { fade, fly } from "svelte/transition";
    import { i18n } from "$lib/stores/i18nStore";
    import { page } from "$lib/stores/pageStore";
    import { transition } from "$lib/stores/transitionStore";
    import Columns from "$lib/components/layout/Columns.svelte";
    import Input from "$lib/components/Input.svelte";

    let code: number[] = [], elms: HTMLInputElement[] = [];

    function onKeydown(i: number, e: KeyboardEvent) {
        const isNum = !isNaN(+e.key);

        if (e.key == "Backspace" && !code[i] && i != 0 || e.key == "ArrowLeft" && i != 0)
            elms[i - 1].focus();
        else if (e.key == "ArrowRight" && i != 5)
            elms[i + 1].focus();
        else if (code[i] && isNum)
            e.preventDefault();
        else if (isNum && i != 5)
            setTimeout(() => elms[i + 1].focus(), 10);
    }
</script>

<div class="w-full h-full p-6" in:fade={$transition.pageIn} out:fade={$transition.pageOut}>
    {#if $page.subPage == 0}
        <div class="w-full h-full flex flex-col space-y-4" in:fly={$transition.subpageIn} out:fly={$transition.subpageOut}>
            <h1 class="w-full text-xl font-semibold">{$i18n.t("receive.title")}</h1>
            <Columns>
                <div class="!w-[60%] flex flex-col justify-between items-center" slot="left">
                    <div class="h-6" />
                    <div class="flex flex-col items-center space-y-4">
                        <p class="text-lg font-semibold">{$i18n.t("receive.code")}:</p>
                        <div class="flex space-x-2">
                            <Input className="aspect-square" type="number" innerClassName="!px-0.5 !py-0 !text-2xl !font-semibold !text-center leading-tight" bind:value={code[0]} bind:inputElm={elms[0]} on:keydown={e => onKeydown(0, e)} />
                            <Input className="aspect-square" type="number" innerClassName="!px-0.5 !py-0 !text-2xl !font-semibold !text-center leading-tight" bind:value={code[1]} bind:inputElm={elms[1]} on:keydown={e => onKeydown(1, e)} />
                            <Input className="aspect-square" type="number" innerClassName="!px-0.5 !py-0 !text-2xl !font-semibold !text-center leading-tight" bind:value={code[2]} bind:inputElm={elms[2]} on:keydown={e => onKeydown(2, e)} />
                            <Input className="aspect-square" type="number" innerClassName="!px-0.5 !py-0 !text-2xl !font-semibold !text-center leading-tight" bind:value={code[3]} bind:inputElm={elms[3]} on:keydown={e => onKeydown(3, e)} />
                            <Input className="aspect-square" type="number" innerClassName="!px-0.5 !py-0 !text-2xl !font-semibold !text-center leading-tight" bind:value={code[4]} bind:inputElm={elms[4]} on:keydown={e => onKeydown(4, e)} />
                            <Input className="aspect-square" type="number" innerClassName="!px-0.5 !py-0 !text-2xl !font-semibold !text-center leading-tight" bind:value={code[5]} bind:inputElm={elms[5]} on:keydown={e => onKeydown(5, e)} />
                        </div>
                    </div>
                    <div class="flex space-x-4">
                        <Input type="switch" />
                        <p class="font-semibold">{$i18n.t("receive.nearbyShare")}</p>
                    </div>
                </div>
                <div class="!w-[40%]" slot="right">
                    <div class="w-full h-full p-1 bg-secondary rounded-xl shadow-md ring-1 ring-foreground/10 space-y-1">
                        <canvas></canvas>
                    </div>
                </div>
            </Columns>
        </div>
    {/if}
</div>