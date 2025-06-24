<script lang="ts">
    import { twMerge } from "tailwind-merge";
    import { account } from "$lib/data/account.svelte";
    import Icon from "$lib/components/Icon.svelte";

    interface Props {
        class?: string;
    }

    let {
        class: className
    }: Props = $props();
</script>

{#if !account.loggedIn || !account.picture}
    <Icon name="account" class={twMerge("size-20 text-slate-500 dark:text-slate-600 rounded-full", className)} />
{:else}
    <img src={account.picture} class={twMerge("size-20 bg-slate-950/5 dark:bg-slate-50/5 shadow-md rounded-full aspect-square", className)} alt="{account.username} Profile Picture" />
{/if}