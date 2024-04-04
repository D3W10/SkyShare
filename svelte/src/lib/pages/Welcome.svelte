<script lang="ts">
    import { fade, fly, scale } from "svelte/transition";
    import { i18n } from "$lib/stores/i18nStore";
    import { info } from "$lib/stores/infoStore";
    import { page } from "$lib/stores/pageStore";
    import { transition } from "$lib/stores/transitionStore";
    import { account } from "$lib/stores/accountStore";
    import Columns from "$lib/components/layout/Columns.svelte";
    import Button from "$lib/components/Button.svelte";
    import Icon from "$lib/components/Icon.svelte";
</script>

<div class="w-full h-full p-6 space-y-4" in:fade={$transition.pageIn} out:fade={$transition.pageOut}>
    {#if $page.subPage == 0}
        <div class="w-full h-full flex flex-col" in:fly={$transition.subpageIn} out:fly={$transition.subpageOut}>
            <h1 class="w-full text-xl font-semibold">{$i18n.t("welcome.0.title")}</h1>
            <Columns>
                <div slot="left" class="flex flex-col justify-center items-center space-y-2">
                    <img class="w-3/6" src="./logo.png" alt="{$info.name} Logo" in:scale|global={$transition.iconJump} />
                </div>
                <div slot="right" class="flex flex-col justify-between items-center">
                    <div class="w-full h-full flex justify-center items-center">
                        <div class="w-3/5 space-y-8">
                            <!-- TODO: Finish welcome intro-->
                        </div>
                    </div>
                    <Button className="w-fit" on:click={() => page.set("welcome", 1)}>{$i18n.t("common.next")}</Button>
                </div>
            </Columns>
        </div>
    {:else if $page.subPage == 1}
        <div class="w-full h-full flex flex-col" in:fly={$transition.subpageIn} out:fly={$transition.subpageOut}>
            <h1 class="w-full text-xl font-semibold">{$i18n.t("welcome")}</h1>
            <div class="w-full h-full p-5 grid grid-rows-3 gap-5">
                <!-- TODO: Finish welcome features list-->
                <div class="w-full h-full p-1 bg-secondary rounded-xl shadow-md ring-1 ring-foreground/10 space-y-1"></div>
                <div class="w-full h-full p-1 bg-secondary rounded-xl shadow-md ring-1 ring-foreground/10 space-y-1"></div>
                <div class="w-full h-full p-1 bg-secondary rounded-xl shadow-md ring-1 ring-foreground/10 space-y-1"></div>
                <Button className="w-fit mx-auto mt-2" on:click={() => page.set("welcome", 1)}>{$i18n.t("common.next")}</Button>
            </div>
        </div>
    {:else if $page.subPage == 2}
        <div class="w-full h-full flex flex-col" in:fly={$transition.subpageIn} out:fly={$transition.subpageOut}>
            <h1 class="w-full text-xl font-semibold">{$i18n.t("welcome")}</h1>
            <div class="w-full h-full p-5 flex flex-col">
                <div class="h-full flex flex-col justify-center items-center">
                    <div class="w-40 h-40" in:scale={{ duration: 1000, delay: 400, start: 1.5 }}>
                        {#if !$account || !$account.photo}
                            <Icon name="account" className="w-full text-primary transition-colors" />
                        {:else}
                            <img src={$account.photo} alt="{$account.username} Profile Picture" class="w-full h-full rounded-full" />
                        {/if}
                    </div>
                    <h1 class="mt-6 text-xl font-semibold">{$i18n.t("welcome.2.welcome")}</h1>
                    <h2 class="mt-3">{$account?.username}</h2>
                </div>
                <Button className="w-fit ml-auto" on:click={() => page.set("account")}>{$i18n.t("welcome.2.continue")}</Button>
            </div>
        </div>
    {/if}
</div>