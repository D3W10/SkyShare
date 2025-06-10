import { browser } from "$app/environment";
import { goto } from "$app/navigation";
import { account } from "$lib/data/account.svelte";

export const load = () => {
    if (browser && (account.loggedIn || !account.loginState))
        goto("/account/login");
};