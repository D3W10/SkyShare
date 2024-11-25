export interface IceCandidate {
    candidate: string;
    sdpMid: string | null;
    sdpMLineIndex: number | null;
}