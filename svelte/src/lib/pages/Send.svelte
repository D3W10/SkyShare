<script lang="ts">
    import { cubicIn, cubicInOut, cubicOut } from "svelte/easing";
    import { fade, fly } from "svelte/transition";
    import { flip } from "svelte/animate";
    import { i18n } from "$lib/stores/i18nStore";
    import { app } from "$lib/stores/appStore";
    import { page } from "$lib/stores/pageStore";
    import { transition } from "$lib/stores/transitionStore";
    import { error, ErrorCode } from "$lib/stores/errorStore";
    import Columns from "$lib/components/layout/Columns.svelte";
    import Button from "$lib/components/Button.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import Input from "$lib/components/Input.svelte";
    import type { File } from "$electron/lib/File.interface";

    let files: File[] = [], totalSize: number = 0;
    let hovering: boolean = false;
    const MAX_FILES = 20, MAX_SIZE = 3221225472;
    const addButton: File = { name: "", path: "", size: 0 };

    async function parseFiles(mode: "select" | "drop", e?: DragEvent) {
        let failedCount: number = 0, fileList: File[] = [];

        if (mode == "select") {
            let chosenFiles = await $app.showOpenDialog({
                title: $i18n.t("send.chooseTitle"),
                filters: [{ name: $i18n.t("send.chooseFilter"), extensions: ["*"] }],
                properties: ["openFile", "multiSelections", "treatPackageAsDirectory"],
                message: $i18n.t("send.chooseTitle")
            });

            if (!chosenFiles || chosenFiles?.canceled)
                return;

            fileList = chosenFiles.files;
        }
        else if (mode == "drop" && e && e.dataTransfer) {
            hovering = false;
            fileList = Array.from(e.dataTransfer.files).map(file => ({ name: file.name, path: file.path, size: file.size }));
        }
        else
            return;

        for (let file of fileList) {
            if (await $app.isDirectory(file.path))
                continue;
            else if (!files.every(f => f.name != file.name)) {
                failedCount++;
                continue;
            }
            else if (files.length + 1 > MAX_FILES) {
                error.set(ErrorCode.TOO_MANY_FILES);
                break;
            }
            else if (totalSize + file.size > MAX_SIZE) {
                error.set(ErrorCode.SIZE_LIMIT_EXCEEDED);
                break;
            }

            file.icon = await $app.getFileIcon(file.path);
            files.push(file);
        }

        if (failedCount > 0)
            error.setLocal("fileWithSameName", { num: failedCount });

        files = files;
    }
</script>

<div class="w-full h-full p-6" in:fade={$transition.pageIn} out:fade={$transition.pageOut}>
    {#if $page.subPage == 0}
        <div class="w-full h-full flex flex-col space-y-4" in:fly={$transition.subpageIn} out:fly={$transition.subpageOut}>
            <h1 class="w-full text-xl font-semibold">{$i18n.t("send.title")}</h1>
            <Columns>
                <div slot="left">
                    <div class="w-full h-full p-1 flex justify-center items-center relative rounded-2xl overflow-hidden z-0 before:w-[210%] before:h-[130%] before:absolute {!hovering ? "before:opacity-0" : "before:opacity-100"} before:-z-10 before:transition-opacity before:animate-[rotate_1s_linear_infinite] {!hovering ? "before:[animation-play-state:paused]" : ""} before:[background-image:conic-gradient(#ef4444,#f97316,#eab308,#22c55e,#0ea5e9,#3b82f6,#a855f7,#ef4444)]">
                        <div class="w-full h-full flex justify-center items-center relative bg-background ring-4 {!hovering ? "ring-foreground/10" : "ring-foreground/0"} rounded-[12px] overflow-hidden">
                            {#if files.length == 0}
                                <div class="w-full h-full" in:fade={{ duration: 200, delay: 200, easing: cubicOut }} out:fade={{ duration: 200, easing: cubicIn }}>
                                    <Button type="invisible" className="w-full h-full !rounded-xl" on:click={() => parseFiles("select")}>
                                        <div class="w-full h-full flex justify-center items-center" role="none" on:dragenter={() => hovering = true} on:dragleave={() => hovering = false} on:dragover={(e) => e.preventDefault()} on:drop|preventDefault={(e) => parseFiles("drop", e)}>
                                            <div class="flex flex-col items-center space-y-2 pointer-events-none">
                                                <Icon name="files" className="w-12" />
                                                <div class="text-center">
                                                    <p class="font-semibold">{!hovering ? $i18n.t("send.chooseTitle") : $i18n.t("send.chooseHoverTitle")}</p>
                                                    <p class="text-sm text-foreground/70">{!hovering ? $i18n.t("send.chooseSubtitle") : $i18n.t("send.chooseHoverSubtitle")}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </Button>
                                </div>
                            {:else}
                                <div class="w-full h-full p-2 absolute overflow-y-auto space-y-2" role="none" on:dragenter={() => hovering = true} on:dragleave={() => hovering = false} on:dragover={(e) => e.preventDefault()} on:drop|preventDefault={(e) => parseFiles("drop", e)} in:fade={{ duration: 200, delay: 200, easing: cubicOut }} out:fade={{ duration: 200, easing: cubicIn }}>
                                    {#each [...files, addButton] as file (file.name)}
                                        <div transition:fade={{ duration: 400, easing: cubicOut }} animate:flip={{ duration: 400, easing: cubicInOut}}>
                                            {#if file.name}
                                                <div class="w-full px-2 py-1.5 flex items-center relative bg-secondary rounded-lg space-x-2 overflow-hidden group">
                                                    <img src="data:image/png;base64,{file.icon}" class="h-6" alt={$i18n.t("send.fileIcon")} />
                                                    <div class="flex flex-col space-y-0.5">
                                                        <p class="text-sm overflow-hidden [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]" title={file.name}>{file.name}</p>
                                                        <p class="text-xs text-foreground/70">{$app.fileSizeFormat(file.size)}</p>
                                                    </div>
                                                    <div class="w-7 group-hover:w-14 absolute top-0 bottom-0 right-0 bg-gradient-to-l from-secondary from-75% opacity-0 group-hover:opacity-100 transition-[width,opacity]" />
                                                    <div class="flex justify-end items-center absolute top-0 bottom-0 right-3 opacity-0 group-hover:opacity-100 invisible group-hover:visible aspect-square transition-opacity">
                                                        <button class="hover:text-primary transition-colors" on:click={() => files = files.filter(f => f.name != file.name)}>   
                                                            <Icon name="remove" className="w-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            {:else}
                                                <Button type="invisible" className="w-full p-2 flex items-center hover:text-primary bg-secondary rounded-lg space-x-1.5 transition-colors" on:click={() => parseFiles("select")}>
                                                    <Icon name="add" className="h-6" />
                                                    <p>{$i18n.t("send.chooseAddFiles")}</p>
                                                </Button>
                                            {/if}
                                        </div>
                                    {/each}
                                </div>
                            {/if}
                        </div>
                    </div>
                </div>
                <div slot="right" class="flex flex-col justify-between items-center">
                    <div class="w-full h-full flex justify-center items-center">
                        <div class="w-3/5 space-y-8">
                            <div class="space-y-1">
                                <p class="font-semibold">{$i18n.t("send.message")}:</p>
                                <Input type="text" placeholder={$i18n.t("common.optional")} maxlength={255} disabled={files.length == 0} />
                            </div>
                            <div class="space-y-1">
                                <p class="font-semibold">{$i18n.t("send.size")}:</p>
                                <p class="text-foreground/70">{$app.fileSizeFormat(files.reduce((previous, current) => previous + current.size, 0))}</p>
                            </div>
                            <div class="space-y-1">
                                <p class="font-semibold">{$i18n.t("send.quantity")}:</p>
                                <p class="text-foreground/70">{files.length} {$i18n.t("send.file", { count: files.length })}</p>
                            </div>
                        </div>
                    </div>
                    <Button className="w-fit" disabled={files.length == 0} on:click={() => page.set("send", 1)}>{$i18n.t("send.send")}</Button>
                </div>
            </Columns>
        </div>
    {:else if $page.subPage == 1}
        <div class="space-y-4" in:fly={$transition.subpageIn} out:fly={$transition.subpageOut}>
            <div class="flex justify-between items-center">
                <h1 class="w-full text-xl font-semibold">Haha</h1>
                <Button type="invisible" className="h-fit flex items-center text-primary font-semibold" on:click={() => page.set("send", 0)}>
                    <Icon name="chevron" className="w-5 h-5 mr-1 fill-current rotate-90" />
                    {$i18n.t("common.back")}
                </Button>
            </div>
        </div>
    {/if}
</div>