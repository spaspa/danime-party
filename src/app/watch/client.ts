import { ClientState, reduceState } from "./clientStateReducer"

class Client {
    private ws: WebSocket

    private dispatchQueue: string[] = []

    constructor(
        private video: HTMLVideoElement,
        readonly path = "ws://localhost:8080/ws"
    ) {
        this.ws = new WebSocket(path)
        this.setupVideoEvents()
    }

    private state: ClientState = {
        type: "unsent"
    }

    setupVideoEvents() {
        (["play", "pause", "seeking", "seeked"] as const).forEach(e => this.video.addEventListener(e, () => {
            this.state = reduceState(this.state, { type: "video", event: e })
        }))
    }

    setupWebSocketEvents() {
        this.ws.addEventListener("message", e => {
        })
        this.ws.addEventListener("open", () => {
            this.dispatchQueue.forEach(c => this.ws.send(c))
        })
    }

}
