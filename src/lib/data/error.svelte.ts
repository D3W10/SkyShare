import type { ErrorT } from "$electron/lib/types/ErrorT.type";

interface ErrorState {
    e: ErrorT;
    show: boolean;
    vars: { [key: string]: any };
}

export const error = $state<ErrorState>({ e: "unknown", show: false, vars: {} });

export function setError(err: ErrorT, vars: { [key: string]: any } = {}) {
    error.e = err;
    error.show = true;
    error.vars = vars;
}

export function hideError() {
    error.show = false;
}