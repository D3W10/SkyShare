import { redirect, type RequestHandler } from "@sveltejs/kit";
import { settingsPath } from "$lib/utils.svelte";

export const prerender = true;

export const GET: RequestHandler = () => {
    redirect(303, settingsPath);
};