import { app } from "$lib/data/app.svelte";
import { info } from "$lib/data/info.svelte";
import { setError } from "$lib/data/error.svelte";
import type { File } from "$electron/lib/interfaces/File.interface";

type Direction = "sender" | "receiver";
type Credentials = { username: string, password: string };

export class WebRTC {
    private ws: WebSocket | undefined;
    private peerConnection: RTCPeerConnection;
    private dataChannel: RTCDataChannel | undefined;
    private fileChannel: RTCDataChannel | undefined;
    private candidates: RTCIceCandidate[] = [];
    private type: Direction = "sender";
    private _code = "";
    private _timeout: Date | undefined;
    private files: File[] = [];
    private exchangingIce = false;
    private onDisconnect: (() => unknown) | undefined;

    constructor() {
        this.peerConnection = new RTCPeerConnection();

        app.apiCall<Credentials>("credentials").then(data => {
            if (data)
                this.peerConnection = new RTCPeerConnection({
                    iceServers: [
                        {
                            urls: "stun:20.86.131.181:3478",
                        },
                        {
                            urls: "turn:20.86.131.181:3478",
                            username: data.username,
                            credential: data.password
                        }
                    ]
                });
        });

        this.peerConnection.addEventListener("icecandidate", async event => {
            if (event.candidate) {
                console.log("[WS] New ICE candidate: " + JSON.stringify(event.candidate));

                this.sendIceCandidate(event.candidate);
            }
        });
        this.peerConnection.addEventListener("iceconnectionstatechange", () => {
            if (this.peerConnection.iceConnectionState === "disconnected" || this.peerConnection.iceConnectionState === "failed")
                console.error("ICE connection failed");
            // TODO: Handle errors
        });
    }

    public get code() {
        return this._code;
    }

    public get timeout() {
        return this._timeout;
    }

    setUpAsSender(files: File[]) {
        return new Promise<string>(async resolve => {
            this.createChannels();
            this.type = "sender";
            this.files = files;
            this.ws = new WebSocket(info.api + "transfer/create");
            await this.waitForWebSocketOpen();

            console.log("[WS] Creating offer and setting local description");

            const offer = await this.peerConnection.createOffer();
            await this.peerConnection.setLocalDescription(offer);

            this.ws.send(JSON.stringify({
                type: "offer",
                data: { offer }
            }));

            this.ws.addEventListener("message", async e => {
                const payload = JSON.parse(e.data);
    
                if (payload.type === "code") {
                    this._code = payload.data.code;
                    this._timeout = new Date(Date.now() + payload.data.timeout);
                    console.log("[WS] Transfer code: " + this._code);
                    resolve(this.code);
                }
                else if (payload.type === "answer") {
                    console.log("[WS] Remote description set with offer");
                    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(payload.data.answer));
                    this.exchangingIce = true;
                    this.syncIce();
                }
                else if (payload.type === "ice") {
                    console.log("[WS] ICE candidate received and added: " + JSON.stringify(payload.data));
                    await this.peerConnection.addIceCandidate(payload.data.ice);
                }
                else if (payload.type === "disconnect")
                    this.onDisconnect?.();
            });

            this.ws.addEventListener("close", e => {
                console.log(e.reason);
                // TODO Handle error
            });
        });
        // TODO: Handle websocket errors (and maybe reject promise)
    }

    setUpAsReceiver(code: string) {
        return new Promise<boolean>(async resolve => {
            const data = await app.apiCall<{ status: boolean }>("transfer/" + code + "/check");
            if (!data)
                return resolve(false);
            else if (!data.status) {
                setError("invalidCode");
                return resolve(false);
            }
            else
                resolve(true);

            this._code = code;
            this.ws = new WebSocket(info.api + "transfer/" + code);

            await this.waitForWebSocketOpen();
            this.ws.send(JSON.stringify({
                type: "offer"
            }));

            const setup = async (offer: RTCSessionDescriptionInit) => {
                console.log("[WS] Remote description set with offer");
                await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

                console.log("[WS] Creating answer and setting local description");

                const answer = await this.peerConnection.createAnswer();
                await this.peerConnection.setLocalDescription(answer);

                this.setupChannels();
                this.type = "receiver";
                this.ws!.send(JSON.stringify({
                    type: "answer",
                    data: { answer }
                }));

                this.exchangingIce = true;
                this.syncIce();
            }

            this.ws.addEventListener("message", e => {
                const payload = JSON.parse(e.data);

                if (payload.type === "offer")
                    setup(payload.data.offer);
                else if (payload.type === "ice") {
                    console.log("[WS] ICE candidate received and added: " + JSON.stringify(payload.data));
                    this.peerConnection.addIceCandidate(payload.data.ice);
                }

                // TODO Handle disconnect and error
            });

            this.ws.addEventListener("close", e => {
                console.log(e.reason);
            });
        });
        // TODO: Handle websocket errors (and maybe reject promise)
    }

    setOnDisconnect(callback: () => unknown) {
        this.onDisconnect = callback;
    }

    waitForWebSocketOpen() {
        return new Promise<void>(resolve => this.ws?.addEventListener("open", () => resolve()));
    }

    sendIceCandidate(ice: RTCIceCandidate) {
        this.candidates.push(ice);
        this.syncIce();
    }

    syncIce() {
        if (this._code !== "" && this.exchangingIce) {
            const sendIce = (i: RTCIceCandidate) => this.ws?.send(JSON.stringify({
                type: "ice" + this.type.substring(0, 1).toUpperCase() + this.type.substring(1),
                data: {
                    code: this._code,
                    ice: i
                }
            }));;

            while (this.candidates.length > 0) {
                const i = this.candidates.shift();
                if (i)
                    sendIce(i);
            }
        }
    }

    waitForChannelOpen() {
        return new Promise<void>((resolve, reject) => {
            if (this.dataChannel) {
                if (this.dataChannel.readyState === "open")
                    resolve();
                else {
                    this.dataChannel.addEventListener("open", () => resolve());
                    this.dataChannel.addEventListener("close", () => reject(new Error("Data channel closed unexpectedly")));
                    this.dataChannel.addEventListener("error", err => reject(err));
                }
            }
            else
                reject(new Error("Data channel not initizalized"));
        });
    }

    sendDetails() {
        if (this.type === "sender")
            this.sendInChunks(JSON.stringify(this.files.map(f => ({ name: f.name, size: f.size, icon: f.icon }))));
    }

    send(data: Record<string, unknown>) {
        /* this.dataChannel.send(JSON.stringify(data)); */
    }

    private sendInChunks(data: string, chunkSize = 32 * 1024) {
        if (!this.dataChannel || this.dataChannel.readyState !== "open")
            return;

        for (let i = 0; i < data.length; i += chunkSize)
            this.dataChannel.send(data.slice(i, i + chunkSize));
    }

    private createChannels() {
        console.log("[WS] Creating data channel...");

        this.dataChannel = this.peerConnection.createDataChannel("data");
        this.dataChannel.addEventListener("open", () => console.log("[WS] Data channel is now open"));
        this.dataChannel.addEventListener("close", () => console.log("[WS] Data channel is now closed"));
        this.dataChannel.addEventListener("error", err => console.error("[WS] Data channel error: " + err));

        console.log("[WS] Creating file channel...");

        this.fileChannel = this.peerConnection.createDataChannel("file");
        this.fileChannel.addEventListener("open", () => console.log("[WS] File channel is now open"));
        this.fileChannel.addEventListener("close", () => console.log("[WS] File channel is now closed"));
        this.fileChannel.addEventListener("error", err => console.error("[WS] File channel error: " + err));

        // TODO: Handle errors
        return true;
    }

    private setupChannels() {
        this.peerConnection.addEventListener("datachannel", e => {
            console.log("[WS] New channel received: " + e.channel.label);
            if (e.channel.label === "data") {
                this.dataChannel = e.channel;
                this.dataChannel.addEventListener("message", e => {
                    console.log("[WS] Received a chunk of data");
                    console.log(e.data);
                });
                this.dataChannel.addEventListener("open", () => console.log("[WS] Receive channel is now open"));
                this.dataChannel.addEventListener("close", () => console.log("[WS] Receive channel is now closed"));
                this.dataChannel.addEventListener("error", err => console.error("[WS] Data channel error: " + err));
            }
            else if (e.channel.label === "file") {
                this.fileChannel = e.channel;
                this.fileChannel.addEventListener("message", e => {
                    console.log("[WS] Received a chunk of file");

                    console.log(e.data);
                });
                this.fileChannel.addEventListener("open", () => console.log("[WS] File channel is now open"));
                this.fileChannel.addEventListener("close", () => console.log("[WS] File channel is now closed"));
                this.fileChannel.addEventListener("error", err => console.error("[WS] File channel error: " + err));
            }
            /*
            let receivedBuffers: any[] = [];
            this.dataChannel = e.channel;

            this.dataChannel.addEventListener("message", e => {
                console.log("[WS] Received a chunk of data");

                onReceive(JSON.parse(e.data));

                receivedBuffers.push(e.data);

                if (e.data.byteLength === 0) {
                    const receivedBlob = new Blob(receivedBuffers);
                    receivedBuffers = [];

                    this.app.log("File received with size " + this.app.fileSizeFormat(receivedBlob.size));
                    onReceive(receivedBlob);
                }
            });
            */
        });
    }
}