import { get } from "svelte/store";
import { app } from "../stores/appStore";
import type * as preload from "$electron/preload";

export class WebRTC {
    private app: typeof preload;
    private peerConnection: RTCPeerConnection;
    private dataChannel: RTCDataChannel | null;

    constructor() {
        this.app = get(app);
        this.peerConnection = new RTCPeerConnection(this.app.getServers());
        this.dataChannel = null;
    }

    async setUpAsSender() {
        this.app.log("Creating offer and setting local description");

        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);

        this.createDataChannel();

        return offer;
    }

    async setUpAsReceiver(onReceive: (file: Blob) => unknown) {
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

    listenForIceCandidates(code: string, token: string) {
        this.peerConnection.addEventListener("icecandidate", async event => {
            if (event.candidate) {
                await this.app.sendIceCandidate(code, event.candidate, token);
                this.app.log("ICE candidate sent: " + JSON.stringify(event.candidate));
            }
        });

        this.peerConnection.addEventListener("iceconnectionstatechange", () => {
            if (this.peerConnection.iceConnectionState === "disconnected" || this.peerConnection.iceConnectionState === "failed")
                this.app.error("ICE connection failed");
            // TODO: Handle errors
        });

        const unsubscribe = this.app.listenForIce(code, async candidate => {
            await this.peerConnection.addIceCandidate(candidate);
            this.app.log("ICE candidate received and added: " + JSON.stringify(candidate));
        });

        // TODO: Use unsubscriber on clean function
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

    private createDataChannel() {
        this.app.log("Creating data channel...");

        this.dataChannel = this.peerConnection.createDataChannel("dataTransfer");
        this.dataChannel.binaryType = "arraybuffer";
        this.dataChannel.addEventListener("open", () => this.app.log("Data channel is now open"));
        this.dataChannel.addEventListener("close", () => this.app.log("Data channel is now closed"));
        this.dataChannel.addEventListener("error", err => this.app.error("Data channel error: " + err));

        // TODO: Handle errors
        return true;
    }

    private setupDataChannel(onReceive: (file: Blob) => unknown) {
        this.peerConnection.addEventListener("datachannel", e => {
            let receivedBuffers: any[] = [];
            this.dataChannel = e.channel;

            this.dataChannel.addEventListener("message", e => {
                this.app.log("Received a chunk of data");

                receivedBuffers.push(e.data);

                if (e.data.byteLength === 0) {
                    const receivedBlob = new Blob(receivedBuffers);
                    receivedBuffers = [];

                    this.app.log("File received with size " + this.app.fileSizeFormat(receivedBlob.size));
                    onReceive(receivedBlob);
                }
            });
        
            this.dataChannel.addEventListener("open", () => this.app.log("Receive channel is now open"));
            this.dataChannel.addEventListener("close", () => this.app.log("Receive channel is now closed"));
            this.dataChannel.addEventListener("error", err => this.app.error("Data channel error: " + err));
        });
    }

    // TODO: Add close method
}