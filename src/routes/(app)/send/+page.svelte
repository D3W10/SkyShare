<script lang="ts">
    import { blur, fade } from "svelte/transition";
    import { flip } from "svelte/animate";
    import { cubicInOut, cubicOut } from "svelte/easing";
    import { twMerge } from "tailwind-merge";
    import { goto } from "$app/navigation";
    import { i18n } from "$lib/data/i18n.svelte";
    import { app } from "$lib/data/app.svelte";
    import { connection } from "$lib/data/connection.svelte";
    import { disable, setLock, setUnlock } from "$lib/data/disable.svelte";
    import { setError } from "$lib/data/error.svelte";
    import PageLayout from "$lib/components/PageLayout.svelte";
    import Button from "$lib/components/Button.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import TextArea from "$lib/components/TextArea.svelte";
    import { boxStyles, transitions } from "$lib/utils.svelte";
    import { WebRTC } from "$lib/models/WebRTC.class";
    import type { File } from "$electron/lib/interfaces/File.interface";

    let files = $state<File[]>([]), hovering = $state(0), message = $state("");
    const totalSize = $derived(files.reduce((p, c) => p + c.size, 0));
    const MAX_FILES = 50, MAX_SIZE = 32212254720, MAX_MESSAGE = 500;

    async function parseFiles(mode: "select" | "drop", e?: DragEvent) {
        let failedCount = 0, fileList: File[] = [];

        if (mode === "select") {
            const chosenFiles = await app.showOpenDialog({
                title: i18n.t("send.chooseTitle"),
                filters: [{ name: i18n.t("send.chooseFilter"), extensions: ["*"] }],
                properties: ["openFile", "multiSelections", "treatPackageAsDirectory"],
                message: i18n.t("send.chooseTitle")
            });

            if (!chosenFiles || chosenFiles?.canceled)
                return;

            fileList = chosenFiles.files;
        }
        else if (mode === "drop" && e && e.dataTransfer) {
            hovering = 0;
            fileList = Array.from(e.dataTransfer.files).map(file => ({
                name: file.name,
                path: app.getFilePath(file),
                size: file.size
            }));
        }
        else
            return;

        for (let file of fileList) {
            if (await app.isDirectory(file.path))
                continue;
            else if (!files.every(f => f.name !== file.name)) {
                failedCount++;
                continue;
            }
            else if (files.length + 1 > MAX_FILES) {
                setError("tooManyFiles", { amount: MAX_FILES });
                break;
            }
            else if (totalSize + file.size > MAX_SIZE) {
                setError("sizeLimitExceeded", { amount: app.formatFileSize(MAX_SIZE, 0)  });
                break;
            }

            file.icon = await app.getFileIcon(file.path);
            files.push(file);
        }

        if (failedCount > 0)
            setError("addingError", { amount: failedCount });

        files = files;
    }

    async function startSend() {
        setLock(true);

        connection.c = new WebRTC();
        await connection.c.setUpAsSender();

        setUnlock();
        goto("/send/waiting");
    }
</script>

<PageLayout title={i18n.t("send.0.title")} class="flex gap-x-6">
    <div class={twMerge(boxStyles.pane, "w-64 h-full p-0 grid items-start relative rounded-2xl overflow-hidden z-0 *:col-[1] *:row-[1] before:absolute before:-top-8 before:-bottom-8 before:left-1/2 before:bg-rainbow-conic before:opacity-0 before:animate-rotate before:-translate-x-1/2 before:aspect-square before:-z-2 after:absolute after:bg-slate-200 dark:after:bg-slate-950 after:-z-1 after:transition-all after:duration-200", disable.d ? "*:opacity-50" : "", !hovering ? "before:transition-opacity before:duration-0 before:delay-200 after:inset-0 after:rounded-2xl" : "before:opacity-100 after:inset-2 after:rounded-lg")} role="none" ondragenter={() => hovering++} ondragleave={() => hovering--} ondragover={e => e.preventDefault()} ondrop={e => { e.preventDefault(); parseFiles("drop", e); }}>
        {#if files.length === 0}
            <div class="size-full transition-opacity duration-200" in:transitions.pageIn out:transitions.pageOut>
                <Button type="invisible" class="size-full flex flex-col justify-center items-center enabled:cursor-pointer z-1 *:pointer-events-none" onclick={() => parseFiles("select")}>
                    <Icon name="upload" class="w-12 mb-2" />
                    <p class="text-center font-semibold">{hovering === 0 ? i18n.t("send.0.chooseTitle") : i18n.t("send.0.chooseHoverTitle")}</p>
                    <p class="text-sm text-center text-slate-500">{hovering === 0 ? i18n.t("send.0.chooseSubtitle") : i18n.t("send.0.chooseHoverSubtitle")}</p>
                </Button>
            </div>
        {:else}
            <div class="h-full p-2 flex flex-col gap-y-2 overflow-y-auto transition-opacity duration-200" in:transitions.pageIn out:transitions.pageOut>
                {#each [...files, {} as File] as file, i (file.name)}
                    <div transition:fade={{ duration: 400, easing: cubicOut }} animate:flip={{ duration: 400, easing: cubicInOut }}>
                        {#if i !== files.length}
                            <div class={twMerge(boxStyles.box, "px-2 group")}>
                                {#if file.icon}
                                    <img src="data:image/png;base64,{file.icon}" class="h-6" alt={i18n.t("send.0.fileIcon")} />
                                {:else}
                                    <Icon name="file" class="h-6" />
                                {/if}
                                <div class="ml-2 flex flex-col gap-y-0">
                                    <p class="text-sm overflow-hidden [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]" title={file.name}>{file.name}</p>
                                    <p class="text-xs text-slate-500">{app.formatFileSize(file.size)}</p>
                                </div>
                                {#if !disable.d}
                                    <div class="w-0 group-hover:w-16 absolute top-0 bottom-0 right-0 bg-gradient-to-l from-slate-50 dark:from-slate-900 from-75% rounded-r-2xl opacity-0 group-hover:opacity-100 transition-[width,opacity]"></div>
                                    <div class="flex justify-end items-center absolute top-0 bottom-0 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button class="p-1 rounded-lg before:rounded-lg" onclick={() => files = files.filter(f => f.name !== file.name)}>   
                                            <Icon name="remove" class="size-5" />
                                        </Button>
                                    </div>
                                {/if}
                            </div>
                        {:else}
                            <Button type="secondary" class="w-full px-2 justify-start items-center gap-x-2" onclick={() => parseFiles("select")}>
                                <Icon name="add" class="size-6" />
                                <p class="text-sm">{i18n.t("send.0.chooseAddFiles")}</p>
                            </Button>
                        {/if}
                    </div>
                {/each}
            </div>
        {/if}
    </div>
    <div class="h-full px-4 flex flex-col items-center flex-1">
        <div class="size-full">
            <h3 class="mb-2 font-semibold">{i18n.t("send.0.message")}</h3>
            <TextArea class="w-full resize-none" bind:value={message} placeholder={i18n.t("send.0.messagePlaceholder")} rows={5} maxlength={MAX_MESSAGE} />
            <div class="mt-6 flex gap-x-4">
                <div class="flex-1">
                    <h3 class="mb-2 font-semibold">{i18n.t("send.0.size")}</h3>
                    <div class={twMerge(boxStyles.pane, "py-1.5 grid text-sm *:col-[1] *:row-[1]")}>
                        {#key files.length}
                            <p transition:blur={{ duration: 500 }}>{app.formatFileSize(files.reduce((previous, current) => previous + current.size, 0))}</p>
                        {/key}
                    </div>
                </div>
                <div class="flex-1">
                    <h3 class="mb-2 font-semibold">{i18n.t("send.0.quantity")}</h3>
                    <div class={twMerge(boxStyles.pane, "py-1.5 grid text-sm *:col-[1] *:row-[1]")}>
                        {#key files.length}
                            <p transition:blur={{ duration: 500 }}>{files.length} {i18n.t("send.0.file", { count: files.length })}</p>
                        {/key}
                    </div>
                </div>
            </div>
        </div>
        <Button class="w-30" disabled={files.length === 0} onclick={startSend}>{i18n.t("send.0.send")}</Button>
    </div>
</PageLayout>