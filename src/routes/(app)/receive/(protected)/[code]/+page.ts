import type { EntryGenerator } from "./$types";

export const entries: EntryGenerator = () => {
    const codes = [];
    for (let i = 100000; i <= 999999; i++)
        codes.push({ code: i.toString() });

    return codes;
};