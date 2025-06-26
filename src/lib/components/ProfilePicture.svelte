<script lang="ts">
    import { twMerge } from "tailwind-merge";
    import { account } from "$lib/data/account.svelte";
    import Icon from "$lib/components/Icon.svelte";

    interface Props {
        class?: string;
        picture?: string;
    }

    let {
        class: className,
        picture
    }: Props = $props();

    const useDefault = $derived(picture === undefined);;
</script>

{#if useDefault ? !account.loggedIn || !account.picture : !picture}
    <Icon name="account" class={twMerge("size-20 text-slate-800 dark:text-slate-300 rounded-full", className)} />
{:else}
    <img src={useDefault ? account.picture : picture} class={twMerge("size-20 bg-slate-950/5 dark:bg-slate-50/5 shadow-md rounded-full aspect-square", className)} alt={(useDefault ? account.username + " " : "") + "Profile Picture"} />
{/if}