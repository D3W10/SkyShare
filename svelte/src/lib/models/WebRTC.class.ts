import { get } from "svelte/store";
import { app } from "../stores/appStore";
import type * as preload from "$electron/preload";
import type { IceCandidate } from "$electron/lib/interfaces/IceCandidate.interface";

export class WebRTC {
    private app: typeof preload;
    private peerConnection: RTCPeerConnection;
    private dataChannel: RTCDataChannel | null = null;
    private candidates: IceCandidate[] = [];
    private code = "";
    private token = "";
    private exchanging = false;

    constructor() {
        this.app = get(app);
        this.peerConnection = new RTCPeerConnection(this.app.getServers());

        this.peerConnection.addEventListener("icecandidate", async event => {
            if (event.candidate) {
                const { candidate, sdpMid, sdpMLineIndex } = event.candidate, ice: IceCandidate = { candidate, sdpMid, sdpMLineIndex };

                this.app.log("New ICE candidate: " + JSON.stringify(event.candidate));
                if (this.code === "" || !this.exchanging)
                    this.candidates.push(ice);
                else
                    await this.app.sendIceCandidate(this.code, [ice], this.token); // TODO: Check for errors on all API calls
            }
        });

        this.peerConnection.addEventListener("iceconnectionstatechange", () => {
            if (this.peerConnection.iceConnectionState === "disconnected" || this.peerConnection.iceConnectionState === "failed")
                this.app.error("ICE connection failed");
            // TODO: Handle errors
        });
    }

    async setUpAsSender() {
        this.app.log("Creating offer and setting local description");

        this.createDataChannel();

        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);

        return offer;
    }

    async setUpAsReceiver(onReceive: (data: Record<string, unknown>) => unknown) {
        this.app.log("Creating answer and setting local description");

        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);

        this.setupDataChannel(onReceive);

        return answer;
    }

    async setRemote(offer: RTCSessionDescriptionInit) {
        this.app.log("Remote description set with offer");
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    }

    async listenForIceCandidates(code: string, token: string) {
        this.code = code;
        this.token = token;

        const unsubscribe = this.app.listenForIce(this.code, async candidate => {
            await this.peerConnection.addIceCandidate(candidate);
            this.app.log("ICE candidate received and added: " + JSON.stringify(candidate));
        });

        // TODO: Use unsubscriber on clean function
    }

    async exchangeIceCandidates() {
        this.exchanging = true;
        await this.app.sendIceCandidate(this.code, this.candidates, this.token);  // TODO: Check for errors on all API calls
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
        this.app.log("Creating data channel...");

        this.dataChannel = this.peerConnection.createDataChannel("dataTransfer");
        this.dataChannel.addEventListener("open", () => this.app.log("Data channel is now open"));
        this.dataChannel.addEventListener("close", () => this.app.log("Data channel is now closed"));
        this.dataChannel.addEventListener("error", err => this.app.error("Data channel error: " + err));

        // TODO: Handle errors
        return true;
    }

    private setupDataChannel(onReceive: (data: Record<string, unknown>) => unknown) {
        this.peerConnection.addEventListener("datachannel", e => {
            let receivedBuffers: any[] = [];
            this.dataChannel = e.channel;

            this.dataChannel.addEventListener("message", e => {
                this.app.log("Received a chunk of data");

                onReceive(JSON.parse(e.data));

                /* receivedBuffers.push(e.data);

                if (e.data.byteLength === 0) {
                    const receivedBlob = new Blob(receivedBuffers);
                    receivedBuffers = [];

                    this.app.log("File received with size " + this.app.fileSizeFormat(receivedBlob.size));
                    onReceive(receivedBlob);
                } */
            });
        
            this.dataChannel.addEventListener("open", () => this.app.log("Receive channel is now open"));
            this.dataChannel.addEventListener("close", () => this.app.log("Receive channel is now closed"));
            this.dataChannel.addEventListener("error", err => this.app.error("Data channel error: " + err));
        });
    }

    // TODO: Add close method
}