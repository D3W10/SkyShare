import { goto } from "$app/navigation";
import { connection } from "$lib/data/connection.svelte";

export const load = () => {
    if (!connection.c || !connection.c.code)
        goto("/receive");
};