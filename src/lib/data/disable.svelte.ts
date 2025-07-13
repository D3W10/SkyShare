export const disable = $state({ d: false, loading: false });

export function setLock(loading = false) {
    disable.d = true;
    disable.loading = loading;
}

export function setUnlock() {
    disable.d = disable.loading = false;
}