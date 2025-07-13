<script lang="ts">
    import { twMerge } from "tailwind-merge";
    import { i18n } from "$lib/data/i18n.svelte";
    import { account } from "$lib/data/account.svelte";
    import ProfilePicture from "$lib/components/ProfilePicture.svelte";
    import { boxStyles, transitions } from "$lib/utils";
</script>

<div class="w-full py-2 flex flex-col" in:transitions.pageIn out:transitions.pageOut>
    <div class={twMerge(boxStyles.box, "p-5")}>
        <div class="size-full flex items-center gap-x-4">
            <ProfilePicture class="size-10" />
            <div class="w-full flex flex-col justify-center gap-y-0.5">
                <h3 class="font-semibold">{account.username}</h3>
                <p class="text-sm text-slate-500">{i18n.t("account.settings.since")} {account.createdAt.toLocaleDateString(i18n.language)}</p>
            </div>
        </div>
    </div>
</div>