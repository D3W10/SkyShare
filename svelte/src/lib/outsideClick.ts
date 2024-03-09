import type { ActionReturn } from "svelte/action";

export function outsideClick(node: HTMLElement): ActionReturn<undefined, { "on:outclick": (e: CustomEvent<undefined>) => void; }> {
    function handleClick(event: MouseEvent) {
        if (node && !node.contains(event.target as Node) && !event.defaultPrevented)
            node.dispatchEvent(new CustomEvent<undefined>("outclick"));
    }

    document.addEventListener("click", handleClick, true);

    return {
        destroy() {
            document.removeEventListener("click", handleClick, true);
        }
    }
}