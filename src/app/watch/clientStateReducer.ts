import { ServerMessageEvent } from './messageEvents'
import { ClientEventEmitter } from './client'

type ClientStateType = ClientStateTypeWithoutArg | ClientStateWithArg["type"]
type ClientStateTypeWithoutArg = "unsent" | "joined" | "syncing" | "synced" | "ready" | "playing"

type ClientStateWithArg = ClientStoppedState | ClientSeekingState
type ClientStateWithoutArg = {
    type: ClientStateTypeWithoutArg
    timeDiff: number
}
type ClientStoppedState = {
    type: "stopped"
    timeDiff: number
    controlled: boolean
}
type ClientSeekingState = {
    type: "seeking"
    timeDiff: number
    controlled: boolean
    paused: boolean
}
type ClientStateSpec<T extends ClientStateType> = ClientState & {type: T}

export type ClientState = ClientStateWithoutArg | ClientStoppedState | ClientSeekingState

type VideoEvent = "play" | "pause" | "seeking" | "seeked"
type ClientEvent =
    | { type: "video", event: VideoEvent }
    | { type: "message", event: ServerMessageEvent }
    | { type: "interaction" }
    | { type: "start", roomName: string }

type ClientReducerMap = {
    [T in ClientStateType]: (
        state: ClientStateSpec<T>,
        event: ClientEvent,
        emitter: ClientEventEmitter
    ) => ClientState
}
const clientReducerMap: ClientReducerMap = {
    unsent (state, event, emitter) {
        if (event.type === "start") {
            emitter.sendJoin(event.roomName)
            return { ...state, type: "joined" }
        }
        return state
    },
    joined (state, event, emitter) {
        if (event.type === "message" && event.event.type === "accept") {
            emitter.sendSync()
            return { ...state, type: "syncing" }
        }
        return state
    },
    syncing (state, event, _) {
        if (event.type === "message" && event.event.type === "sync") {
            return { type: "synced", timeDiff: event.event.timeDiff }
        }
        return state
    },
    synced (state, event, emitter) {
        if (event.type === "interaction") {
            emitter.sendReady(true)
            return { ...state, type: "ready" }
        }
        return state
    },
    ready (state, event, emitter) {
        if (event.type === "message" && event.event.type === "ready") {
            emitter.sendPlay()
            return state
        }
        if (event.type === "message" && event.event.type === "play") {
            emitter.playVideo()
            return { ...state, type: "playing" }
        }
        return state
    },
    playing (state, event, emitter) {
        if (event.type === "message" && event.event.type === "pause") {
            emitter.pauseVideo()
            return { ...state, type: "stopped", controlled: false }
        }
        if (event.type === "video" && event.event === "pause") {
            emitter.sendPause()
            return { ...state, type: "stopped", controlled: true }
        }
        if (event.type === "message" && event.event.type === "seek") {
            emitter.seekVideoTo(event.event.videoTime)
            return { ...state, type: "seeking", controlled: false, paused: false }
        }
        if (event.type === "video" && event.event === "seeking") {
            return { ...state, type: "seeking", controlled: true, paused: false }
        }
        return state
    },
    stopped (state, event, emitter) {
        if (state.controlled && event.type === "video" && event.event === "play") {
            emitter.pauseVideo()
            emitter.sendResume()
            emitter.sendReady(true)
            return { type: "ready", timeDiff: state.timeDiff }
        }
        if (state.controlled && event.type === "message" && event.event.type === "resume") {
            emitter.sendReady(true)
            return { type: "ready", timeDiff: state.timeDiff }
        }
        if (!state.controlled && event.type === "video" && event.event === "pause") {
            return emitter.reduceToStateIfVideoTimeIsAround(
                0, // FIXME put correct time from pause event
                () => {
                    emitter.sendReady(true)
                    return { type: "stopped", timeDiff: state.timeDiff, controlled: true }
                },
                () => {
                    emitter.seekVideoTo(0) // FIXME put correct time from pause event
                    return { type: "seeking", timeDiff: state.timeDiff, controlled: false, paused: true }
                }
            )
        }
        if (event.type === "message" && event.event.type === "seek") {
            emitter.seekVideoTo(event.event.videoTime)
            return { ...state, type: "seeking", controlled: false, paused: true }
        }
        if (event.type === "video" && event.event === "seeking") {
            return { ...state, type: "seeking", controlled: true, paused: true }
        }
        return state
    },
    seeking (state, event, emitter) {
        if (!state.paused && state.controlled && event.type === "video" && event.event === "seeked") {
            emitter.sendSeekWithCurrentTime()
            emitter.sendReady(true)
            return { type: "ready", timeDiff: state.timeDiff }
        }
        if (!state.paused && !state.controlled && event.type === "video" && event.event=== "seeked") {
            emitter.sendReady(true)
            return { type: "ready", timeDiff: state.timeDiff }
        }
        if (state.paused && state.controlled && event.type === "video" && event.event === "seeked") {
            emitter.sendSeekWithCurrentTime()
            return { type: "stopped", timeDiff: state.timeDiff, controlled: true }
        }
        if (state.paused && !state.controlled && event.type === "video" && event.event=== "seeked") {
            return { type: "stopped", timeDiff: state.timeDiff, controlled: true }
        }
        return state
    },
}
export const reduceState = (state: ClientState, event: ClientEvent, emitter: ClientEventEmitter) => {
    const result = clientReducerMap[state.type](state as any, event, emitter) as ClientState
    console.log(state, "->", result, "@", event)
    return result
}
