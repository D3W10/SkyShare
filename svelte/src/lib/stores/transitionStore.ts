import { derived } from "svelte/store";
import { page } from "./pageStore";
import { settings } from "./settingsStore";
import { cubicIn, cubicOut, quintOut } from "svelte/easing";

export const transition = derived([page, settings], ($values) => {
    let duration = 500;
    let offset = 200 * (!$values[0].oldSubPage ? -1 : 1);

    return {
        pageIn: { duration: duration, delay: duration, x: offset * -1, easing: cubicOut },
        pageOut: { duration: duration, x: offset, easing: cubicIn },
        comboFlow: { duration: 400, easing: quintOut },
    };
});