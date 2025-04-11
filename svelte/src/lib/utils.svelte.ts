import { fade } from "svelte/transition";
import { cubicIn, cubicOut } from "svelte/easing";
import type { Action } from "svelte/action";

export const boxStyles = {
    basic: "disabled:opacity-70 disabled:grayscale focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent cursor-pointer disabled:cursor-auto transition-[opacity,filter] duration-200",
    box: "px-3 py-2 flex relative bg-white dark:bg-slate-900 rounded-xl ring-1 ring-slate-400/10 dark:ring-white/10 shadow-sm z-0 before:absolute before:inset-0 before:rounded-xl before:border-b-3 before:border-slate-100 dark:before:border-slate-800 before:-z-1",
    button: "px-4 justify-center font-medium text-slate-50 dark:text-slate-900 bg-accent dark:bg-accent inset-shadow-sm inset-shadow-slate-50/40 dark:inset-shadow-slate-50/30 hover:inset-shadow-slate-950/10 dark:hover:inset-shadow-slate-950/20 inset-ring-2 inset-ring-slate-950/15 hover:inset-ring-slate-950/5 transition-shadow duration-200 ease-in-out enabled:hover:before:border-b-0 before:border-[color:color-mix(in_oklab,var(--color-slate-950)_20%,var(--color-accent))] dark:before:border-[color:color-mix(in_oklab,var(--color-slate-950)_20%,var(--color-accent))] before:transition-all before:duration-200 before:ease-in-out",
    secondary: "px-4 justify-center font-medium inset-shadow-sm inset-shadow-transparent hover:inset-shadow-slate-950/5 dark:hover:inset-shadow-slate-50/5 transition-shadow duration-200 ease-in-out enabled:hover:before:border-b-0 before:transition-all before:duration-200 before:ease-in-out",
    href: "font-semibold text-accent hover:opacity-80 focus-visible:rounded focus-visible:outline-offset-1",
};

export const settingsPath = "/settings/appearance";

export const transitions = {
    pageIn: (node: Element) => fade(node, { duration: 200, delay: 50, easing: cubicIn }),
    pageOut: (node: Element) => fade(node, { duration: 150, easing: cubicOut })
}

export const outClick: Action<HTMLElement, undefined, { onoutclick: (e: CustomEvent) => unknown; }> = node => {
    function handleClick(event: MouseEvent) {
        if (node && !node.contains(event.target as Node) && !event.defaultPrevented)
            node.dispatchEvent(new CustomEvent("outclick"));
    }

    document.addEventListener("click", handleClick, true);
}