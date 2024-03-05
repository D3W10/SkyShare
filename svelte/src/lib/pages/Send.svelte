<script lang="ts">
    import { fade, fly } from "svelte/transition";
    import { i18n } from "$lib/stores/i18nStore";
    import { app } from "$lib/stores/appStore";
    import { page } from "$lib/stores/pageStore";
    import { transition } from "$lib/stores/transitionStore";
    import { error } from "$lib/stores/errorStore";
    import Icon from "$lib/components/Icon.svelte";
    import Button from "$lib/components/Button.svelte";
    import type { File } from "$electron/lib/File.interface";

    let files: File[] = [], totalSize: number = 0, refresh: boolean = false;
    const MAX_FILES = 20, MAX_SIZE = 3221225472;

    async function openFile() {
        let chosenFiles = await $app?.showOpenDialog({
            title: $i18n.t("send.chooseTitle"),
            filters: [{ name: $i18n.t("send.chooseFilter"), extensions: ["*"] }],
            properties: ["openFile", "multiSelections", "treatPackageAsDirectory"],
            message: $i18n.t("send.chooseTitle")
        }), failedCount = 0;

        if (!chosenFiles || chosenFiles?.canceled)
            return;

        for (let file of chosenFiles.files) {
            if (!files.every((f) => f.name != file.name)) {
                failedCount++;
                continue;
            }
            else if (totalSize + file.size > MAX_SIZE) {
                error.set("sizeLimitExceeded");
                break;
            }
            else if (files.length + 1 > MAX_FILES) {
                error.set("tooManyFiles");
                break;
            }

            files.push(file);
        }

        if (failedCount > 0)
            error.set("fileWithSameName", { num: failedCount });

        refresh = !refresh;
    }
</script>

<div class="w-full h-full p-6 space-y-4" in:fade={$transition.pageIn} out:fade={$transition.pageOut}>
    {#if $page.subPage == 0}
        <div class="w-full h-full flex flex-col" in:fly={$transition.pageIn} out:fly={$transition.pageOut}>
            <h1 class="w-full text-xl font-semibold">{$i18n.t("send.title")}</h1>
            <div class="h-full p-5 flex space-x-8">
                <div class="w-5/12">
                    <div class="w-full h-full flex justify-center items-center rounded-2xl border-[5px] border-shade/10">
                        {#key refresh}
                            {#if files.length == 0}
                                <button class="w-full h-full flex justify-center items-center" on:click={openFile}>
                                    <div class="flex flex-col items-center space-y-2">
                                        <Icon name="files" className="w-12" />
                                        <div class="text-center">
                                            <p class="font-semibold">{$i18n.t("send.chooseTitle")}</p>
                                            <p class="text-sm text-foreground/70">{$i18n.t("send.chooseSubtitle")}</p>
                                        </div>
                                    </div>
                                </button>
                            {:else}
                                <div class="w-full h-full p-2 [overflow-y:overlay] space-y-2">
                                    {#each files as file}
                                        <div class="w-full px-2 py-1.5 flex items-center bg-secondary rounded-lg space-x-2">
                                            {#await $app?.getFileIcon(file.path) then icon}
                                                <img src={`data:image/png;base64,${icon}`} class="h-6" alt="" />
                                            {/await}
                                            <div class="flex flex-col space-y-0.5">
                                                <p class="text-sm">{file.name}</p>
                                                <p class="text-xs text-foreground/70">{$app?.fileSizeFormat(file.size)}</p>
                                            </div>
                                        </div>
                                    {/each}
                                    <button class="w-full p-2 flex items-center bg-secondary rounded-lg space-x-1.5" on:click={openFile}>
                                        <Icon name="add" className="h-6" />
                                        <p>{$i18n.t("send.chooseAddFiles")}</p>
                                    </button>
                                </div>
                            {/if}
                        {/key}
                    </div>
                </div>
                <div class="w-7/12 flex flex-col justify-between items-center">
                    <div class="w-full h-full flex justify-center items-center">
                        <div class="w-1/2 space-y-8">
                            <div class="space-y-1">
                                <p class="font-semibold">{$i18n.t("send.message")}:</p>
                                <input type="text" placeholder={$i18n.t("send.optional")} maxlength="255">
                            </div>
                            {#key refresh}
                                <div class="space-y-1">
                                    <p class="font-semibold">{$i18n.t("send.size")}:</p>
                                    <p class="text-foreground/70">{$app?.fileSizeFormat(files.reduce((previous, current) => previous + current.size, 0))}</p>
                                </div>
                                <div class="space-y-1">
                                    <p class="font-semibold">{$i18n.t("send.quantity")}:</p>
                                    <p class="text-foreground/70">{files.length} {$i18n.t("send.file", { count: files.length })}</p>
                                </div>
                            {/key}
                        </div>
                    </div>
                    <Button className="w-fit">{$i18n.t("send.send")}</Button>
                </div>
            </div>
        </div>
    {:else if $page.subPage == 1}
        <div in:fly={$transition.pageIn} out:fly={$transition.pageOut}>
            <div class="flex justify-between items-center">
                <h1 class="w-full text-xl font-semibold">Haha</h1>
                <Button type="invisible" className="h-fit flex items-center text-primary" on:click={() => page.set("home", 0)}>
                    <Icon name="chevron" className="w-5 h-5 mr-1 fill-current rotate-90" />
                    Back
                </Button>
            </div>
        </div>
    {/if}
</div>