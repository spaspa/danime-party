import { ClientState, reduceState } from "./clientStateReducer"

class Client {
    constructor(
        private video: HTMLVideoElement
    ) {
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
        // TODO
    }

}
