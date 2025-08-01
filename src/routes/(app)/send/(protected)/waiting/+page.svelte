<script lang="ts">
    import { blur, fade } from "svelte/transition";
    import { twMerge } from "tailwind-merge";
    import { i18n } from "$lib/data/i18n.svelte";
    import { info } from "$lib/data/info.svelte";
    import { setLock } from "$lib/data/disable.svelte";
    import { connection } from "$lib/data/connection.svelte";
    import PageLayout from "$lib/components/PageLayout.svelte";
    import Button from "$lib/components/Button.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import ProfilePicture from "$lib/components/ProfilePicture.svelte";
    import { boxStyles, fetchUser, goto } from "$lib/utils";

    const timeDiff = () => (connection.c?.timeout?.getTime() ?? 0) - Date.now();

    let connected = $state(false), timeLeft = $state(timeDiff());
    let codeAnim = $state(false), linkAnim = $state(false);

    function copy(type: "code" | "link") {
        if (type === "code") {
            navigator.clipboard.writeText(connection.c!.code);
            codeAnim = true;
            setTimeout(() => codeAnim = false, 2000);
        }
        else if (type === "link") {
            navigator.clipboard.writeText(`${info.homepage}/receive/${connection.c!.code}`);
            linkAnim = true;
            setTimeout(() => linkAnim = false, 2000);
        }
    }

    $effect(() => {
        if (timeLeft <= 0)
            goto("/send");
    });

    connection.c?.setListener("disconnect", () => {
        connected = false;
        timeLeft = timeDiff();
    });

    connection.c?.setListener("data", raw => {
        const { type, data } = JSON.parse(raw);

        if (type === "identification" && connection.c) {
            connected = true;

            fetchUser(connection.c, data.user);
            connection.c.sendDetails();
        }
        else if (type === "start") {
            setLock();
            goto("/send/transfer");
        }
    });

    setInterval(() => timeLeft = timeDiff(), 1000);
</script>

<PageLayout title={i18n.t("send.waiting.title")} class="flex flex-col justify-center items-center gap-y-6">
    <p class="text-7xl font-bold tracking-widest drop-shadow-lg drop-shadow-accent/30">{connection.c?.code}</p>
    <div class="flex gap-x-4">
        <Button type="invisible" class={twMerge(boxStyles.pane, "w-fit pl-3 pr-4 py-1.5 gap-x-2 text-sm font-medium rounded-full cursor-pointer")} onclick={() => copy("code")}>
            <div class="size-5">
                {#if !codeAnim}
                    <div in:fade={{ duration: 200, delay: 200 }} out:fade={{ duration: 200 }}>
                        <Icon name="copy" />
                    </div>
                {:else}
                    <div in:fade={{ duration: 200, delay: 200 }} out:fade={{ duration: 200 }}>
                        <Icon name="checkmark" />
                    </div>
                {/if}
            </div>
            <p>{i18n.t("send.waiting.copyCode")}</p>
        </Button>
        <Button type="invisible" class={twMerge(boxStyles.pane, "w-fit pl-3 pr-4 py-1.5 gap-x-2 text-sm font-medium rounded-full cursor-pointer")} onclick={() => copy("link")}>
            <div class="size-5">
                {#if !linkAnim}
                    <div in:fade={{ duration: 200, delay: 200 }} out:fade={{ duration: 200 }}>
                        <Icon name="link" />
                    </div>
                {:else}
                    <div in:fade={{ duration: 200, delay: 200 }} out:fade={{ duration: 200 }}>
                        <Icon name="checkmark" />
                    </div>
                {/if}
            </div>
            <p>{i18n.t("send.waiting.copyLink")}</p>
        </Button>
    </div>
    {#key connected}
        <div class={twMerge(boxStyles.pane, "py-1.5 flex items-center gap-x-2 absolute left-6 bottom-6 text-sm")} in:fade={{ duration: 200, delay: 200 }} out:fade={{ duration: 200 }}>
            {#if !connected}
                <p class="animate-pulse">{i18n.t("send.waiting.waiting")}</p>
            {:else}
                <p>{i18n.t("send.waiting.connected")}</p>
                <div class="flex items-center gap-x-1.5">
                    <ProfilePicture picture={connection.c?.remotePeerData.picture} class="size-4" />
                    <p>{connection.c?.remotePeerData.username ? connection.c?.remotePeerData.username : i18n.t("send.waiting.anonymous")}</p>
                </div>
            {/if}
        </div>
    {/key}
    {#if !connected}
        <div class={twMerge(boxStyles.pane, "w-23.5 pl-3 pr-4 py-1.5 absolute right-6 bottom-6 gap-x-2 text-sm font-medium rounded-full transition-colors duration-200", timeLeft <= 60000 ? "text-accent *:animate-pulse" : "")} transition:fade={{ duration: 400, delay: 400 }}>
            <Icon name="stopwatch" class="size-5" />
            <div class="relative">
                {#key timeLeft}
                    <p class="absolute" transition:blur={{ duration: 500 }}>{new Date(timeLeft).toLocaleTimeString([], { minute: "2-digit", second: "2-digit" })}</p>
                {/key}
            </div>
        </div>
    {/if}
</PageLayout>