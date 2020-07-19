import { ClientState, ClientEvent, reduceState } from "./clientStateReducer"
import { parseServerMessage } from './messageEvents'
import { CommandType, commandReady, commandJoin, commandLeave, commandPlay, commandPause, commandSeek, commandSync, commandResume } from '../../utils/constants'

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
        const payload = [command, ...args].join(":")
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

    sendSync() {
        this.sendCommand(commandSync, ((new Date()).getTime() / 1000).toString())
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
    sendResume() {
        this.sendCommand(commandResume)
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
    readonly emitter: ClientEventEmitter

    public onStateChange?: (newState: ClientState, prevState: ClientState) => void

    constructor(
        private roomName: string,
        private video: HTMLVideoElement,
        readonly path = "ws://localhost:8080/ws"
    ) {
        this.ws = new WebSocket(path)
        this.emitter = new ClientEventEmitter(video, this.ws)
        this.setupVideoEvents()
        this.setupWebSocketEvents()
    }

    private state: ClientState = {
        type: "unsent",
        timeDiff: 0
    }

    setupVideoEvents() {
        (["play", "pause", "seeking", "seeked"] as const).forEach(e => this.video.addEventListener(e, () => {
            console.log('video:', e)
            this.updateStateWith({ type: "video", event: e })
        }))
    }

    setupWebSocketEvents() {
        this.ws.addEventListener("message", e => {
            console.log('message:', e.data)
            this.updateStateWith({ type: "message", event: parseServerMessage(e.data) })
        })
    }

    updateStateWith(event: ClientEvent) {
        const newState = reduceState(this.state, event, this.emitter)
        this.onStateChange && this.onStateChange(newState, this.state)
        this.state = newState
    }

    start() {
        this.state = reduceState(
            this.state,
            { type: "start", roomName: this.roomName },
            this.emitter
        )
    }

    interacted() {
        this.state = reduceState(
            this.state,
            { type: "interaction" },
            this.emitter
        )
    }

    leave() {
        this.emitter.sendLeave()
        this.state = {
            type: "unsent",
            timeDiff: 0
        }
    }

    static typeOfState(state: ClientState): StateType {
        if (
            state.type === "unsent"
            || state.type === "joined"
            || state.type === "syncing"
            || state.type === "synced"
        ) {
            return "nonReady"
        }
        if (state.type === "playing" || state.type === "stopped" && state.controlled) {
            return "controllable"
        }
        return "waiting"
    }
}

export type StateType = "nonReady" | "controllable" | "waiting"