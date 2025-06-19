<script lang="ts">
    import { i18n } from "$lib/data/i18n.svelte";
    import { app } from "$lib/data/app.svelte";
    import { connection } from "$lib/data/connection.svelte";
    import PageLayout from "$lib/components/PageLayout.svelte";
    import ProgressCircle from "$lib/components/ProgressCircle.svelte";
    let sta = $state(0);

    let nameList: string[] = [];

    connection.c?.setListener("data", raw => {
        const { type, data } = JSON.parse(raw);

        if (type === "list")
            nameList = data;
    });

    connection.c?.setListener("file", raw => {
        if (connection.c)
            app.saveToFile(raw, connection.c.savePath + nameList.shift());
    });
</script>

<PageLayout title={i18n.t("receive.transfer.title")} class="flex flex-col items-center">
    <div class="h-full flex justify-center items-center">
        <ProgressCircle progress={sta} />
    </div>
    <div class="w-1/2 flex justify-center gap-x-12">
        <div class="w-full text-right">
            <p class="text-xs text-slate-500 font-semibold">{i18n.t("send.transfer.estimated")}</p>
            <p>{sta} segundos</p>
        </div>
        <div class="w-full text-left">
            <p class="text-xs text-slate-500 font-semibold">{i18n.t("send.transfer.speed")}</p>
            <p>{sta} MBs</p>
        </div>
    </div>
</PageLayout>