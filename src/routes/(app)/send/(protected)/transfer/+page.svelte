<script lang="ts">
    import { onMount } from "svelte";
    import { i18n } from "$lib/data/i18n.svelte";
    import { app } from "$lib/data/app.svelte";
    import { setUnlock } from "$lib/data/disable.svelte";
    import { account, pushHistory } from "$lib/data/account.svelte";
    import { connection } from "$lib/data/connection.svelte";
    import PageLayout from "$lib/components/PageLayout.svelte";
    import ProgressCircle from "$lib/components/ProgressCircle.svelte";
    import { goto } from "$lib/utils";

    let progress = $state(0), eta = $state(0), speed = $state(0);

    connection.c?.setListener("progress", (p, e, s) => {
        progress = p;
        eta = e;
        speed = s;
        app.setProgressBar(p);
    });

    connection.c?.setListener("data", raw => {
        const { type } = JSON.parse(raw);

        if (type === "finish") {
            if (account.loggedIn || connection.c?.remotePeerData?.id) {
                const details = connection.c?.details;
                const remote = connection.c?.remotePeerData;

                if (details?.files)
                    pushHistory(details.files, details.message || null, remote?.id ?? null);
            }

            connection.c?.signalEnd();
            connection.c?.disconnect();
            app.setProgressBar(-1);
            setUnlock();
            goto("/send/done");
        }
    });

    onMount(() => connection.c?.send());
</script>

<PageLayout title={i18n.t("send.transfer.title")} class="flex flex-col items-center">
    <div class="h-full flex justify-center items-center">
        <ProgressCircle {progress} />
    </div>
    <div class="w-1/2 flex justify-center gap-x-12">
        <div class="w-full text-right">
            <p class="text-xs text-slate-500 font-semibold">{i18n.t("send.transfer.estimated")}</p>
            <p>{app.formatTime(eta, [i18n.t("send.transfer.hours"), i18n.t("send.transfer.minutes"), i18n.t("send.transfer.seconds")])}</p>
        </div>
        <div class="w-full text-left">
            <p class="text-xs text-slate-500 font-semibold">{i18n.t("send.transfer.speed")}</p>
            <p>{app.formatFileSize(speed, 1)}/s</p>
        </div>
    </div>
</PageLayout>