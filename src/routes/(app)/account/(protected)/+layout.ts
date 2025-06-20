import { browser } from "$app/environment";
import { account } from "$lib/data/account.svelte";
import { goto } from "$lib/utils";

export const load = () => {
    if (browser && !account.loggedIn)
        goto("/account/login");
};