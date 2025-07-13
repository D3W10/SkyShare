export interface HistoryEntry {
    id: number;
    files: {
        name: string;
        size: number;
    }[];
    sender: {
        name: string;
        avatar: string;
    };
    receiver: {
        name: string;
        avatar: string;
    };
    message: string | null;
    createdAt: Date;
    type: "sender" | "receiver";
}