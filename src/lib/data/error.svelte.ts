import type { ErrorT } from "$lib/models/ErrorT.type";

interface ErrorState {
    e: ErrorT;
    show: boolean;
    vars: Record<string, any>;
}

export const error = $state<ErrorState>({ e: "unknown", show: false, vars: {} });

export function setError(err: ErrorT, vars: Record<string, any> = {}) {
    error.e = err;
    error.show = true;
    error.vars = vars;
}

export function hideError() {
    error.show = false;
}