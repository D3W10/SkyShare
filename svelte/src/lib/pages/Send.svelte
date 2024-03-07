<script lang="ts">
    import { fade, fly } from "svelte/transition";
    import { i18n } from "$lib/stores/i18nStore";
    import { app } from "$lib/stores/appStore";
    import { page } from "$lib/stores/pageStore";
    import { transition } from "$lib/stores/transitionStore";
    import { error } from "$lib/stores/errorStore";
    import Columns from "$lib/components/layout/Columns.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import Input from "$lib/components/Input.svelte";
    import Button from "$lib/components/Button.svelte";
    import type { File } from "$electron/lib/File.interface";

    let files: File[] = [], totalSize: number = 0, refresh: boolean = false;
    let hovering: boolean = false;
    const MAX_FILES = 20, MAX_SIZE = 3221225472;

    async function parseFiles(mode: "select" | "drop", e?: DragEvent) {
        let failedCount: number = 0, fileList: File[] | FileList = [];

        if (mode == "select") {
        let chosenFiles = await $app?.showOpenDialog({
            title: $i18n.t("send.chooseTitle"),
            filters: [{ name: $i18n.t("send.chooseFilter"), extensions: ["*"] }],
            properties: ["openFile", "multiSelections", "treatPackageAsDirectory"],
            message: $i18n.t("send.chooseTitle")
        }), failedCount = 0;

        if (!chosenFiles || chosenFiles?.canceled)
            return;

            fileList = chosenFiles.files;
        }
        else if (mode == "drop") {
            hovering = false;
            fileList = e?.dataTransfer?.files!;
        }

        for (let file of fileList) {
            if (await $app?.isDirectory(file.path))
                continue;
            else if (!files.every((f) => f.name != file.name)) {
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
            <Columns>
                <div slot="left">
                    <div class={`w-full h-full flex justify-center items-center rounded-2xl border-[5px] ${!hovering ? "border-secondary" : "border-primary"} transition-colors`}>
                        {#key refresh}
                            {#if files.length == 0}
                                <button class="w-full h-full flex justify-center items-center" on:click={() => parseFiles("select")} on:dragenter={() => hovering = true} on:dragleave={() => hovering = false} on:dragover={(e) => e.preventDefault()} on:drop|preventDefault={(e) => parseFiles("drop", e)}>
                                    <div class="flex flex-col items-center space-y-2 pointer-events-none">
                                        <Icon name="files" className="w-12" />
                                        <div class="text-center">
                                            <p class="font-semibold">{!hovering ? $i18n.t("send.chooseTitle") : $i18n.t("send.chooseHoverTitle")}</p>
                                            <p class="text-sm text-foreground/70">{!hovering ? $i18n.t("send.chooseSubtitle") : $i18n.t("send.chooseHoverSubtitle")}</p>
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
                                    <button class="w-full p-2 flex items-center bg-secondary rounded-lg space-x-1.5" on:click={() => parseFiles("select")}>
                                        <Icon name="add" className="h-6" />
                                        <p>{$i18n.t("send.chooseAddFiles")}</p>
                                    </button>
                                </div>
                            {/if}
                        {/key}
                    </div>
                </div>
                <div slot="right" class="flex flex-col justify-between items-center">
                    <div class="w-full h-full flex justify-center items-center">
                        <div class="w-3/5 space-y-8">
                            {#key refresh}
                                <div class="space-y-1">
                                    <p class="font-semibold">{$i18n.t("send.message")}:</p>
                                    <Input type="text" placeholder={$i18n.t("common.optional")} maxlength={255} disabled={files.length == 0} />
                                </div>
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
                    <Button className="w-fit" on:click={() => page.set("send", 1)}>{$i18n.t("send.send")}</Button>
                </div>
            </Columns>
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