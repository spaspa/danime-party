import { ClientState, reduceState } from "./clientStateReducer"
import { parseServerMessage } from './messageEvents'
import { CommandType, commandReady, commandJoin, commandLeave, commandPlay, commandPause, commandSeek } from '../../utils/constants'

export class ClientEventEmitter {
    private dispatchQueue: string[] = []
    constructor(
        private video: HTMLVideoElement,
        private ws: WebSocket
    ) {
        this.ws.addEventListener("open", () => {
            this.dispatchQueue.forEach(c => this.ws.send(c))
        })
    }
    private sendCommand(command: CommandType , ...args: string[]) {
        const payload = args.join(":")
        console.log('command:', payload)
        if (this.ws.readyState < WebSocket.OPEN) {
            this.dispatchQueue.push(payload)
        }
        else {
            this.ws.send(payload)
        }
    }

    reduceToStateIfVideoTimeIsAround(time: number, then: () => ClientState, otherwise: () => ClientState) {
        return then()
        // return Math.abs(this.video.currentTime - time) < 0.1 ? then() : otherwise()
    }

    sendJoin(roomId: string) {
        this.sendCommand(commandJoin, roomId)
    }
    sendReady(ready: boolean) {
        this.sendCommand(commandReady, String(ready))
    }
    sendLeave() {
        this.sendCommand(commandLeave)
    }
    sendPlay(videoTime = 0) {
        this.sendCommand(commandPlay, videoTime.toString())
    }
    sendPause() {
        this.sendCommand(commandPause)
    }
    sendSeek(videoTime: number) {
        this.sendCommand(commandSeek, `${videoTime}`)
    }
    sendSeekWithCurrentTime() {
        this.sendSeek(this.video.currentTime)
    }

    playVideo() {
        this.video.play()
    }
    pauseVideo() {
        this.video.pause()
    }
    seekVideoTo(time: number) {
        this.video.currentTime = time
    }
}

export class Client {
    private ws: WebSocket
    private emitter: ClientEventEmitter

    constructor(
        private video: HTMLVideoElement,
        readonly path = "ws://localhost:8080/ws"
    ) {
        this.ws = new WebSocket(path)
        this.emitter = new ClientEventEmitter(video, this.ws)
        this.setupVideoEvents()
    }

    private state: ClientState = {
        type: "unsent",
        timeDiff: 0
    }

    setupVideoEvents() {
        (["play", "pause", "seeking", "seeked"] as const).forEach(e => this.video.addEventListener(e, () => {
            this.state = reduceState(this.state, { type: "video", event: e }, this.emitter)
        }))
    }

    setupWebSocketEvents() {
        this.ws.addEventListener("message", e => {
            this.state = reduceState(
                this.state,
                { type: "message", event: parseServerMessage(e.data) },
                this.emitter
            )
        })
    }

}
