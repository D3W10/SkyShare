import { writable } from "svelte/store";

type ItemData<T extends any> = { v: T, e: boolean };
type StoreData<T extends any[]> = { [K in keyof T]: ItemData<T[K]> };

export class FValid<T extends any[]> {
    private store = writable<StoreData<T>>();
    public readonly verifier = <I extends keyof T>({ v }: ItemData<T[I]>) => typeof v == "string" && v.length != 0;

    constructor(values: T) {
        this.store.set(values.map(v => ({ v, e: false })) as StoreData<T>);
    }

    public set(s: StoreData<T>) {
        this.store.set(s);
    }

    public update<I extends keyof T>(i: I, v: T[I], e: boolean = false) {
        this.store.update(u => {
            u[i] = { v, e };
            return u;
        });
    }

    public subscribe(run: (value: StoreData<T>) => unknown) {
        return this.store.subscribe(run);
    }
}