import { redirect, type RequestHandler } from "@sveltejs/kit";
import { accountSettingsPath } from "$lib/utils";

export const prerender = true;

export const GET: RequestHandler = () => {
    redirect(303, accountSettingsPath);
};