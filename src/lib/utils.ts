import { fade } from "svelte/transition";
import { cubicIn, cubicOut } from "svelte/easing";
import { setError } from "./data/error.svelte";
import { setUnlock } from "./data/disable.svelte";
import { AppError } from "./models/AppError.class";
import type { Action } from "svelte/action";

export const boxStyles = {
    basic: "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
    box: "px-3 py-2 flex relative bg-slate-50 dark:bg-slate-900 rounded-xl ring-1 ring-slate-400/10 dark:ring-slate-50/10 shadow-sm z-0 before:absolute before:inset-0 before:rounded-xl before:border-b-3 before:border-slate-100 dark:before:border-slate-800 before:-z-1",
    pane: "px-3 py-2 flex relative bg-slate-200 dark:bg-slate-950 rounded-xl ring-1 ring-slate-400/25 dark:ring-slate-50/10 shadow-sm",
    button: "px-4 justify-center font-medium text-slate-50 dark:text-slate-900 disabled:text-slate-50/50 disabled:dark:text-slate-900/50 bg-accent dark:bg-accent disabled:bg-slate-400 disabled:dark:bg-slate-600 inset-shadow-sm inset-shadow-slate-50/40 dark:inset-shadow-slate-50/30 enabled:hover:inset-shadow-slate-950/10 enabled:dark:hover:inset-shadow-slate-950/20 inset-ring-2 inset-ring-slate-950/15 hover:inset-ring-slate-950/5 enabled:cursor-pointer transition duration-200 ease-in-out enabled:hover:before:border-b-0 before:border-[color:color-mix(in_oklab,var(--color-slate-950)_20%,var(--color-accent))] dark:before:border-[color:color-mix(in_oklab,var(--color-slate-950)_20%,var(--color-accent))] disabled:before:border-slate-500 disabled:dark:before:border-slate-700 before:transition-all before:duration-200 before:ease-in-out",
    secondary: "px-4 justify-center font-medium inset-shadow-sm inset-shadow-transparent enabled:hover:inset-shadow-slate-950/5 enabled:dark:hover:inset-shadow-slate-50/5 enabled:cursor-pointer transition-shadow duration-200 ease-in-out enabled:hover:before:border-b-0 before:transition-all before:duration-200 before:ease-in-out",
    href: "block font-semibold text-accent hover:opacity-80 disabled:text-slate-400 dark:disabled:text-slate-600 focus-visible:rounded focus-visible:outline-offset-1 transition-opacity duration-200"
};

export const settingsPath = "/settings/appearance";

export const transitions = {
    pageIn: (node: Element) => fade(node, { duration: 200, delay: 50, easing: cubicIn }),
    pageOut: (node: Element) => fade(node, { duration: 150, easing: cubicOut })
}

export async function safeTry(fn: () => Promise<unknown>) {
    try {
        await fn();
    }
    catch (e) {
        console.error(e instanceof Error ? e.message : e);
        setUnlock();

        if (e instanceof AppError)
            setError(e.code);
        else
            setError("unknown");
    }
}

export const outClick: Action<HTMLElement, undefined, { onoutclick: (e: CustomEvent) => unknown; }> = node => {
    function handleClick(event: MouseEvent) {
        if (node && !node.contains(event.target as Node) && !event.defaultPrevented)
            node.dispatchEvent(new CustomEvent("outclick"));
    }

    document.addEventListener("click", handleClick, true);
}