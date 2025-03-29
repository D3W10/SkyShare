export const disable = $state({ d: false, loading: false });

export function lock(loading: boolean = true) {
    disable.d = true;
    disable.loading = loading;
}

export function unlock() {
    disable.d = disable.loading = false;
}