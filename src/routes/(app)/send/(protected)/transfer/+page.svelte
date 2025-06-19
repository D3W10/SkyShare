<script lang="ts">
    import { i18n } from "$lib/data/i18n.svelte";
    import { connection } from "$lib/data/connection.svelte";
    import PageLayout from "$lib/components/PageLayout.svelte";
    import ProgressCircle from "$lib/components/ProgressCircle.svelte";
    let sta = $state(0);

    connection.c?.send();
</script>

<PageLayout title={i18n.t("send.transfer.title")} class="flex flex-col items-center">
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
    <button class="absolute top-0 left-0" onclick={() => (sta = 0)}>0</button>
    <button class="absolute top-0" onclick={() => (sta = 20)}>20</button>
    <button class="absolute top-0 right-0" onclick={() => (sta = 50)}>50</button>
    <button class="absolute right-0" onclick={() => (sta = 70)}>70</button>
    <button class="absolute right-0 bottom-0" onclick={() => (sta = 100)}>100</button>
    <button class="absolute bottom-0" onclick={() => sta++}>++</button>
    <button class="absolute left-0 bottom-0" onclick={() => sta--}>--</button>
</PageLayout>