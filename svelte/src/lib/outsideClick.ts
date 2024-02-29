export function outsideClick(node: HTMLElement) {
    function handleClick(event: MouseEvent) {
        if (node && !node.contains(event.target as Node) && !event.defaultPrevented)
            node.dispatchEvent(new CustomEvent("outclick"));
    }

    document.addEventListener("click", handleClick, true);

    return {
        destroy() {
            document.removeEventListener("click", handleClick, true);
        }
    }
}