import { ServerMessageEvent } from './messageEvents'
import { ClientEventEmitter } from './client'

type ClientStateType = "unsent" | "joined" | "syncing" | "synced" | "ready" | "playing" | "stopped" | "seeking"
type ClientStateTypeWithoutArg = "unsent" | "joined" | "syncing" | "synced" | "ready" | "playing"
type ClientStateWithoutArg = {
    type: ClientStateTypeWithoutArg
    timeDiff: number
}
type ClientControlState = {
    type: "stopped" | "seeking"
    timeDiff: number
    controlled: boolean
}
type ClientStateSpec<T extends ClientStateType> = ClientState & {type: T}

export type ClientState = ClientStateWithoutArg | ClientControlState

type VideoEvent = "play" | "pause" | "seeking" | "seeked"
type ClientEvent =
    | { type: "video", event: VideoEvent }
    | { type: "message", event: ServerMessageEvent }

type ClientReducerMap = {
    [T in ClientStateType]: (
        state: ClientStateSpec<T>,
        event: ClientEvent,
        emitter: ClientEventEmitter
    ) => ClientState
}
const clientReducerMap: ClientReducerMap = {
    unsent (state, event, emitter) {
        return state
    },
    joined (state, event, emitter) {
        return state
    },
    syncing (state, event, emitter) {
        return state
    },
    synced (state, event, emitter) {
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
        if (event.type === "message" && event.event.type === "seek") {
            emitter.seekVideoTo(event.event.videoTime)
            return { ...state, type: "seeking", controlled: false }
        }
        if (event.type === "video" && event.event === "pause") {
            emitter.sendPause()
            return { ...state, type: "stopped", controlled: true }
        }
        if (event.type === "video" && event.event === "seeking") {
            return { ...state, type: "seeking", controlled: true }
        }
        return state
    },
    stopped (state, event, emitter) {
        if (state.controlled && event.type === "video" && event.event === "play") {
            emitter.pauseVideo()
            emitter.sendReady(true)
            return { type: "ready", timeDiff: state.timeDiff }
        }
        if (!state.controlled && event.type === "video" && event.event === "pause") {
            emitter.reduceToStateIfVideoTimeIsAround(
                0, // FIXME put correct time from pause event
                () => {
                    emitter.sendReady(true)
                    return { type: "ready", timeDiff: state.timeDiff }
                },
                () => {
                    emitter.seekVideoTo(0) // FIXME put correct time from pause event
                    return { type: "seeking", timeDiff: state.timeDiff, controlled: false }
                }
            )
        }
        return state
    },
    seeking (state, event, emitter) {
        if (state.controlled && event.type === "video" && event.event === "seeked") {
            emitter.sendSeekWithCurrentTime()
            emitter.sendReady(true)
            return { type: "ready", timeDiff: state.timeDiff }
        }
        if (!state.controlled && event.type === "video" && event.event=== "seeked") {
            emitter.sendReady(true)
            return { type: "ready", timeDiff: state.timeDiff }
        }
        return state
    },
}
export const reduceState = (state: ClientState, event: ClientEvent, emitter: ClientEventEmitter) => {
    return clientReducerMap[state.type](state as any, event, emitter) as ClientState
}
