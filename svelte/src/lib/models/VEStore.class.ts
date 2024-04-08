type VEPair<T> = [T, boolean];
type Subscribe = (value: { isFilled: () => boolean }) => unknown;

export class VEStore<T> {
    public a: VEPair<T>[] = [];
    private filledCheck: (value: VEPair<T>, index: number, array: VEPair<T>[]) => unknown;
    private subscribers = new Set<Subscribe>();

    constructor(qtd: number, identity: T, filledCheck: (value: VEPair<T>, index: number, array: VEPair<T>[]) => unknown) {
        for (let i = 0; i < qtd; i++)
            this.a.push([identity, false]);
        
        this.filledCheck = filledCheck;
    }

    private readonly subscribed = {
        isFilled: () => {
            return this.a.every(this.filledCheck);
        }
    };

    announceChange() {
        for (const sub of this.subscribers)
            sub(this.subscribed);
    }

    subscribe(run: (value: typeof this.subscribed) => unknown) {
        this.subscribers.add(run);
        run(this.subscribed);

        return () => this.subscribers.delete(run);
    }
}

export const validators = {
    string: (e: VEPair<String>) => e[0] !=  ""
}