export const startup = $state({ s: true });

setTimeout(() => startup.s = false, 200);