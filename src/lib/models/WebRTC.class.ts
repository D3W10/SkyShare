import { app } from "$lib/data/app.svelte";
import { info } from "$lib/data/info.svelte";
import { AppError } from "./AppError.class";
import type { RTCEventT } from "./RTCEventT.type";
import type { RTCCallbackT } from "./RTCCallbackT.type";
import type { File } from "$electron/lib/interfaces/File.interface";

type Direction = "sender" | "receiver";
type Credentials = { username: string, password: string };

const MAX_BUFFERED_AMOUNT = 8388608;

export class WebRTC {
    private rtcConfig: RTCConfiguration;
    private ws: WebSocket | undefined;
    private peerConnection: RTCPeerConnection;
    private dataChannel: RTCDataChannel | undefined;
    private fileChannel: RTCDataChannel | undefined;
    private candidates: RTCIceCandidate[] = [];
    private type: Direction = "sender";
    private _code = "";
    private _timeout: Date | undefined;
    private _savePath = "";
    private defaultTimeout = 0;
    private _details: { files: File[], message: string } = { files: [], message: "" };
    private exchangingIce = false;
    private events: { [K in RTCEventT]?: RTCCallbackT<K> } = {};
    private dataHeap = "";
    private dataChannelQueue: string[] = [];
    private fileOngoing = false;
    private fileIndex = 0;
    private transferSize = 0;
    private progressStartTime?: number;

    constructor(credentials: Credentials) {
        this.rtcConfig = {
            iceServers: [
                {
                    urls: "stun:20.86.131.181:3478",
                },
                {
                    urls: "turn:20.86.131.181:3478",
                    username: credentials.username,
                    credential: credentials.password
                }
            ]
        };
        this.peerConnection = new RTCPeerConnection(this.rtcConfig);
        this.setupListeners();
    }

    static async getCredentials(): Promise<Credentials> {
        const data = await app.apiCall<Credentials>("credentials");

        if (!data)
            throw new AppError("down");
        
        return data;
    }

    public get code() {
        return this._code;
    }

    public get timeout() {
        return this._timeout;
    }

    public get savePath() {
        return this._savePath;
    }

    public set savePath(path: string) {
        this._savePath = path;
    }

    public get details() {
        return this._details;
    }

    public set details(details: { files: File[], message: string }) {
        this._details = details;
    }

    private setupListeners() {
        this.peerConnection.addEventListener("icecandidate", async event => {
            if (event.candidate) {
                console.log("[RTC] New ICE candidate: " + JSON.stringify(event.candidate));
                this.sendIceCandidate(event.candidate);
            }
        });
        this.peerConnection.addEventListener("iceconnectionstatechange", () => {
            if (this.peerConnection.iceConnectionState === "disconnected" || this.peerConnection.iceConnectionState === "failed")
                console.error("ICE connection failed");
        });
    }

    async setUpAsSender(files: File[], message: string): Promise<string> {
        this.type = "sender";
        this.ws = new WebSocket(info.api + "transfer/create");
        this._details = { files, message };

        await this.waitForWebSocketOpen();
        this.setUpSenderRTC();

        return new Promise((resolve, reject) => {
            this.ws!.addEventListener("message", async e => {
                try {
                    const payload = JSON.parse(e.data);

                    if (payload.type === "code") {
                        this._code = payload.data.code;
                        this.defaultTimeout = payload.data.timeout;
                        this._timeout = new Date(Date.now() + this.defaultTimeout);
                        console.log("[RTC] Transfer code: " + this._code);
                        resolve(this._code);
                    }
                    else if (payload.type === "answer") {
                        console.log("[RTC] Remote description set with offer");
                        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(payload.data.answer));
                        this.exchangingIce = true;
                        this.syncIce();
                    }
                    else if (payload.type === "ice") {
                        console.log("[RTC] ICE candidate received and added: " + JSON.stringify(payload.data));
                        await this.peerConnection.addIceCandidate(payload.data.ice);
                    }
                    else if (payload.type === "disconnect") {
                        console.log("[RTC] User disconnected, recreating peer connection...");
                        this.disconnect(true);

                        this.exchangingIce = false;
                        this.peerConnection = new RTCPeerConnection(this.rtcConfig);
                        this._timeout = new Date(Date.now() + this.defaultTimeout);
                        this.setupListeners();
                        this.setUpSenderRTC();
                        this.events.disconnect?.();
                    }
                }
                catch (err) {
                    reject(err);
                }
            });

            this.ws!.addEventListener("close", e => {
                console.log("[RTC] WebSocket closed:", e.reason);
                //reject(new AppError("connection_closed"));
            });
        });
    }

    private async setUpSenderRTC() {
        if (!this.ws) return;

        this.createChannels();

        console.log("[RTC] Creating offer and setting local description");

        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);

        this.ws.send(JSON.stringify({
            type: "offer",
            data: { offer }
        }));
    }

    async setUpAsReceiver(code: string) {
        this._code = code;
        this.ws = new WebSocket(info.api + "transfer/" + code);

        await this.waitForWebSocketOpen();
        this.ws.send(JSON.stringify({
            type: "offer"
        }));

        const setup = async (offer: RTCSessionDescriptionInit) => {
            console.log("[RTC] Remote description set with offer");
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

            console.log("[RTC] Creating answer and setting local description");

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
                console.log("[RTC] ICE candidate received and added: " + JSON.stringify(payload.data));
                this.peerConnection.addIceCandidate(payload.data.ice);
            }
        });

        this.ws.addEventListener("close", e => {
            console.log("[RTC] WebSocket closed:", e.reason);
            this.events.end?.();
        });
    }

    setListener<T extends RTCEventT>(name: T, callback: RTCCallbackT<T>) {
        (this.events as any)[name] = callback;

        if (
            name === "dataOpen" && this.dataChannel && this.dataChannel.readyState === "open" ||
            name === "fileOpen" && this.fileChannel && this.fileChannel.readyState === "open"
        )
            (callback as () => unknown)();
        else if (name === "data")
            this.syncData();
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
                type: "ice",
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

    private createChannels() {
        console.log("[RTC] Creating data channel...");

        this.dataChannel = this.peerConnection.createDataChannel("data");
        this.configDataChannel(this.dataChannel);

        console.log("[RTC] Creating file channel...");

        this.fileChannel = this.peerConnection.createDataChannel("file");
        this.configFileChannel(this.fileChannel);
    }

    private setupChannels() {
        this.peerConnection.addEventListener("datachannel", e => {
            console.log("[RTC] New channel received: " + e.channel.label);

            if (e.channel.label === "data") {
                this.dataChannel = e.channel;
                this.configDataChannel(this.dataChannel);
            }
            else if (e.channel.label === "file") {
                this.fileChannel = e.channel;
                this.configFileChannel(this.fileChannel);
            }
        });
    }

    private configDataChannel(channel: RTCDataChannel) {
        channel.addEventListener("message", e => {
            if (e.data.length)
                console.log(`[RTC] Received a chunk of data (${e.data.length})`);

            this.dispatchData(e.data);
        });
        channel.addEventListener("open", () => {
            console.log("[RTC] Data channel is now open");
            this.events.dataOpen?.();
        });
        channel.addEventListener("close", () => console.log("[RTC] Data channel is now closed"));
        channel.addEventListener("error", err => {
            if (!err.error.sctpCauseCode || err.error.sctpCauseCode !== 12) {
                console.error("[RTC] Data channel error: " + err.error);
            }
        });
        // TODO: Handle errors
    }

    private configFileChannel(channel: RTCDataChannel) {
        this.transferSize = 0;

        channel.addEventListener("message", e => {
            if (e.data.byteLength)
                console.log(`[RTC] Received a chunk of data (${e.data.byteLength})`);

            this.calculateProgress(e.data.byteLength);
            this.writeFileChunk(e.data);
        });
        channel.addEventListener("open", () => {
            console.log("[RTC] File channel is now open");
            this.events.fileOpen?.();
        });
        channel.addEventListener("close", () => console.log("[RTC] File channel is now closed"));
        channel.addEventListener("error", err => {
            if (!err.error.sctpCauseCode || err.error.sctpCauseCode !== 12) {
                console.error("[RTC] File channel error: " + err.error);
            }
        });
        // TODO: Handle errors
    }

    calculateProgress(size: number) {
        const totalSize = this._details.files.reduce((p, c) => p + c.size, 0);

        if (!this.progressStartTime)
            this.progressStartTime = Date.now();

        this.transferSize += size;

        const now = Date.now();
        const elapsed = (now - this.progressStartTime) / 1000;
        const progress = Math.floor(this.transferSize * 100 / totalSize);

        let speed = 0,eta = 0;
        if (elapsed > 0)
            speed = this.transferSize / elapsed;
        if (speed > 0)
            eta = Math.ceil((totalSize - this.transferSize) / speed);

        this.events.progress?.(progress, eta, speed);
    }

    signalStart() {
        this.sendInChunks(JSON.stringify({
            type: "start"
        }), this.dataChannel);
    }

    sendDetails() {
        if (this.type === "sender")
            this.sendInChunks(JSON.stringify({
                type: "details",
                data: {
                    files: this._details.files.map(f => ({ name: f.name, size: f.size, icon: f.icon })),
                    message: this._details.message
                }
            }), this.dataChannel);
    }

    async send() {
        for (const f of this._details.files) {
            console.log("Sending file: " + f.path);
            const fileReq = await fetch("io://" + f.path);
            const buffer = await fileReq.arrayBuffer();
            // TODO: Handle error if result is 404

            await this.sendInChunks(buffer, this.fileChannel);
        }
    }

    private async sendInChunks(data: string | ArrayBuffer, channel: RTCDataChannel | undefined, chunkSize = 32 * 1024) {
        if (!channel || channel.readyState !== "open")
            return;

        const str = typeof data === "string";
        const length = str ? data.length : data.byteLength;

        for (let i = 0; i < length; i += chunkSize) {
            const slice = data.slice(i, i + chunkSize);

            if (this.type === "sender" && slice instanceof ArrayBuffer)
                this.calculateProgress(slice.byteLength);

            channel.send(slice as any);

            if (channel.bufferedAmount >= MAX_BUFFERED_AMOUNT)
                await new Promise(resolve => channel.addEventListener("bufferedamountlow", resolve, { once: true }));
        }

        str ? channel.send("") : channel.send(new ArrayBuffer(0));
    }

    private dispatchData(data: string) {
        if (this.joinDataChunks(data))
            this.syncData();
    }

    private writeFileChunk(file: ArrayBuffer) {
        if (file.byteLength !== 0) {
            if (!this.fileOngoing) {
                const path = this.savePath + "/" + this._details.files[this.fileIndex].name;

                console.log("[RTC] Initiated file stream for ", path);
                app.createFileStream(path);
                this.fileOngoing = true;
            }

            app.writeChunk(file);
        }
        else if (this.fileOngoing) {
            console.log("[RTC] Closing file stream");

            app.closeFileStream();
            this.fileOngoing = false;
            this.fileIndex++;

            if (this.fileIndex === this._details.files.length)
                this.events.finish?.();
        }
    }

    private joinDataChunks(data: string) {
        if (data.length === 0) {
            this.dataChannelQueue.push(this.dataHeap);
            this.dataHeap = "";
        }
        else
            this.dataHeap += data;

        return data.length === 0;
    }

    private syncData() {
        if (this.dataChannelQueue.length > 0 && this.events.data) {
            let msg: string | undefined;

            while (msg = this.dataChannelQueue.shift())
                this.events.data(msg);
        }
    }

    disconnect(rtcOnly = false) {
        if (!rtcOnly)
            this.ws?.close(1000, "Normal closure");

        this.dataChannel?.close();
        this.fileChannel?.close();
        this.peerConnection.close();
    }
}