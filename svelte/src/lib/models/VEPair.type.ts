type VEPair<T> = [T, boolean];

export function getVE<T extends string | number | boolean>(value: T): VEPair<T> {
    return [value, false];
}