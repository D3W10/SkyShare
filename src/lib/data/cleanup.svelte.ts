type CleanupFn = () => unknown;

export const cleanup = $state<CleanupFn[]>([]);

export async function cleanAll() {
    let cleanFn: CleanupFn | undefined;

    while (cleanFn = cleanup.shift())
        await cleanFn();
}