<script lang="ts">
    import { twMerge } from "tailwind-merge";
    import { goto } from "$app/navigation";
    import { i18n } from "$lib/data/i18n.svelte";
    import { app } from "$lib/data/app.svelte";
    import { connection } from "$lib/data/connection.svelte";
    import { setLock, setUnlock } from "$lib/data/disable.svelte";
    import PageLayout from "$lib/components/PageLayout.svelte";
    import Button from "$lib/components/Button.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import { boxStyles, transitions } from "$lib/utils";
    import type { File } from "$electron/lib/interfaces/File.interface";

    let connected = $state(false), ready = $state(false);
    let files = $state<File[]>([]), message = $state("");

    connection.c?.setListener("dataOpen", () => (connected = true, setUnlock()));
    connection.c?.setListener("fileOpen", () => ready = true);

    connection.c?.setListener("data", data => {
        if (files.length === 0) {
            const info = JSON.parse(data);

            files = info.files;
            message = info.message;
        }
    });

    function startReceive() {

    }
</script>

<PageLayout title={i18n.t("receive.1.title")}>
    {#if !connected}
        <p class="size-full flex justify-center items-center text-lg font-semibold" in:transitions.pageIn out:transitions.pageOut>{i18n.t("receive.1.obtainingInfo")}</p>
    {:else}
        <div class="flex gap-x-6" in:transitions.pageIn out:transitions.pageOut>
            <div class={twMerge(boxStyles.pane, "w-64 h-full p-2 flex flex-col gap-y-2 rounded-2xl overflow-y-auto")}>
                {#each files as file (file.name)}
                    <div class={twMerge(boxStyles.box, "px-2 items-center")}>
                        {#if file.icon}
                            <img src="data:image/png;base64,{file.icon}" class="h-6" alt={i18n.t("send.0.fileIcon")} />
                        {:else}
                            <Icon name="file" class="h-6" />
                        {/if}
                        <div class="ml-2 flex flex-col gap-y-0">
                            <p class="text-sm overflow-hidden break-words [display:-webkit-box] [word-break:break-all] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]" title={file.name}>{file.name}</p>
                            <p class="text-xs text-slate-500">{app.formatFileSize(file.size)}</p>
                        </div>
                    </div>
                {/each}
            </div>
            <div class="h-full px-4 flex flex-col items-center flex-1">
                <div class="size-full">
                    <div class="flex gap-x-6">
                        <h3 class="font-semibold">{i18n.t("receive.1.sentBy")}</h3>
                        <div class="flex gap-x-1.5">
                            <Icon name="account" class="size-6" />
                            <p>Annonymus</p>
                        </div>
                    </div>
                    <h3 class="mt-6 mb-2 font-semibold">{i18n.t("send.0.message")}</h3>
                    <div class={twMerge(boxStyles.pane, "h-32 py-1.5 overflow-y-auto", !message ? "flex justify-center items-center" : "")}>
                        {#if message}
                            <p class="h-fit">{message}</p>
                        {:else}
                            <p class="font-semibold text-slate-500">{i18n.t("receive.1.noMessage")}</p>
                        {/if}
                    </div>
                    <div class="mt-6 flex gap-x-4">
                        <div class="flex-1">
                            <h3 class="mb-2 font-semibold">{i18n.t("send.0.size")}</h3>
                            <div class={twMerge(boxStyles.pane, "py-1.5 grid text-sm *:col-[1] *:row-[1]")}>
                                <p>{app.formatFileSize(files.reduce((p, c) => p + c.size, 0))}</p>
                            </div>
                        </div>
                        <div class="flex-1">
                            <h3 class="mb-2 font-semibold">{i18n.t("send.0.quantity")}</h3>
                            <div class={twMerge(boxStyles.pane, "py-1.5 grid text-sm *:col-[1] *:row-[1]")}>
                                <p>{files.length} {i18n.t("send.0.file", { count: files.length })}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <Button class="w-30" disabled={!ready} onclick={startReceive}>{i18n.t("receive.0.receive")}</Button>
            </div>
        </div>
    {/if}
</PageLayout>