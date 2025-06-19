import { browser } from "$app/environment";
import { connection } from "$lib/data/connection.svelte";
import { goto } from "$lib/utils";

export const load = () => {
    if (browser && (!connection.c || !connection.c.code))
        goto("/receive");
};