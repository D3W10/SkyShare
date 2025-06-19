<script lang="ts">
    import { twMerge } from "tailwind-merge";
    import { i18n } from "$lib/data/i18n.svelte";
    import { info } from "$lib/data/info.svelte";
    import { boxStyles, transitions } from "$lib/utils";

    let versionClick = 0, versionClickTimeout: NodeJS.Timeout;

    function onVersionClick() {
        versionClick++;

        clearTimeout(versionClickTimeout);
        versionClickTimeout = setTimeout(() => versionClick = 0, 400);

        if (versionClick == 3) {
            versionClick = 0;

            if (!document.body.hasAttribute("style"))
                document.body.style.transform = "rotateZ(180deg)";
            else
                document.body.removeAttribute("style");
        }
    }
</script>

<div class="w-full py-2 flex flex-col space-y-6" in:transitions.pageIn out:transitions.pageOut>
    <div class={twMerge(boxStyles.box, "p-5")}>
        <div class="size-full flex items-center gap-x-4">
            <img src="./logo.svg" alt="{info.name} Logo" class="h-10" />
            <div class="w-full flex flex-col justify-center gap-y-0.5">
                <h3 class="font-semibold">{info.name}</h3>
                <p class="text-sm text-slate-500" role="none" onclick={onVersionClick}>{i18n.t("settings.version", { version: info.version })}</p>
            </div>
        </div>
    </div>
</div>