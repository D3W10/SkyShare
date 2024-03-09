import { derived } from "svelte/store";
import { page } from "./pageStore";
import { settings } from "./settingsStore";
import { circOut, cubicIn, cubicOut, quintOut, sineIn, sineOut } from "svelte/easing";

export const transition = derived([page, settings], ($values) => {
    const duration = 300, subPageDuration = 500, offset = 200 * (!$values[0].oldSubPage ? -1 : 1);

    return {
        pageIn: { duration: duration, delay: duration, easing: sineOut },
        pageOut: { duration: duration, easing: sineIn },
        subpageIn: { duration: subPageDuration, delay: duration, x: offset * -1, easing: cubicOut },
        subpageOut: { duration: subPageDuration, x: offset, easing: cubicIn },
        iconJump: { duration: 800, delay: 700, easing: circOut, opacity: 1 },
        comboFlow: { duration: 400, easing: quintOut }
    };
});