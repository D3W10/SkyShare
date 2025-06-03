import { app } from "$lib/data/app.svelte";
import { info } from "$lib/data/info.svelte";
import { setError } from "$lib/data/error.svelte";

type Direction = "sender" | "receiver";
type Credentials = { username: string, password: string };

export class WebRTC {
    private ws: WebSocket;
    private peerConnection: RTCPeerConnection;
    private dataChannel: RTCDataChannel | undefined;
    private candidates: RTCIceCandidate[] = [];
    private type: Direction = "sender";
    private _code = "";
    private _timeout: Date | undefined;
    private exchangingIce = false;

    constructor() {
        this.ws = new WebSocket("");
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

    setUpAsSender() {
        return new Promise<string>(async resolve => {
            this.createDataChannel();
            this.type = "sender";
            this.ws = new WebSocket(info.homepage + "transfer/create");
            await this.waitForWebSocketOpen();

            console.log("[WS] Creating offer and setting local description");

            const offer = await this.peerConnection.createOffer();
            await this.peerConnection.setLocalDescription(offer);

            this.ws.send(JSON.stringify({
                type: "offer",
                data: { offer }
            }));

            this.ws.addEventListener("message", e => {
                const payload = JSON.parse(e.data);
    
                if (payload.type === "code") {
                    this._code = payload.data.code;
                    this._timeout = new Date(Date.now() + payload.data.timeout);
                    console.log("[WS] Transfer code: " + this._code);
                    resolve(this.code);
                }
                else if (payload.type === "answer") {
                    console.log("[WS] Remote description set with offer");
                    this.peerConnection.setRemoteDescription(new RTCSessionDescription(payload.data.answer));
                    this.exchangingIce = true;
                    this.syncIce();
                }
                else if (payload.type === "ice") {
                    console.log("[WS] ICE candidate received and added: " + JSON.stringify(payload.data));
                    this.peerConnection.addIceCandidate(payload.data.ice);
                }
            });

            this.ws.addEventListener("close", e => {
                console.log(e.reason);
            });
        });
        // TODO: Handle websocket errors (and maybe reject promise)
    }

    setUpAsReceiver(code: string/* , onReceive: (data: Record<string, unknown>) => unknown */) {
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
            this.ws = new WebSocket(info.homepage + "transfer/" + code);

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

                //this.setupDataChannel(onReceive);
                this.type = "receiver";
                this.ws.send(JSON.stringify({
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
            });

            this.ws.addEventListener("close", e => {
                console.log(e.reason);
            });
        });
        // TODO: Handle websocket errors (and maybe reject promise)
    }

    waitForWebSocketOpen() {
        return new Promise<void>(resolve => this.ws.addEventListener("open", () => resolve()));
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

    send(data: Record<string, unknown>) {
        if (!this.dataChannel)
            return;

        this.dataChannel.send(JSON.stringify(data));
    }

    private createDataChannel() {
        console.log("[WS] Creating data channel...");

        this.dataChannel = this.peerConnection.createDataChannel("transfer");
        this.dataChannel.addEventListener("open", () => console.log("[WS] Data channel is now open"));
        this.dataChannel.addEventListener("close", () => console.log("[WS] Data channel is now closed"));
        this.dataChannel.addEventListener("error", err => console.error("[WS] Data channel error: " + err));

        // TODO: Handle errors
        return true;
    }

    private setupDataChannel(onReceive: (data: Record<string, unknown>) => unknown) {
        this.peerConnection.addEventListener("datachannel", e => {
            let receivedBuffers: any[] = [];
            this.dataChannel = e.channel;

            this.dataChannel.addEventListener("message", e => {
                console.log("[WS] Received a chunk of data");

                onReceive(JSON.parse(e.data));

                /* receivedBuffers.push(e.data);

                if (e.data.byteLength === 0) {
                    const receivedBlob = new Blob(receivedBuffers);
                    receivedBuffers = [];

                    this.app.log("File received with size " + this.app.fileSizeFormat(receivedBlob.size));
                    onReceive(receivedBlob);
                } */
            });
        
            this.dataChannel.addEventListener("open", () => console.log("[WS] Receive channel is now open"));
            this.dataChannel.addEventListener("close", () => console.log("[WS] Receive channel is now closed"));
            this.dataChannel.addEventListener("error", err => console.error("[WS] Data channel error: " + err));
        });
    }
}