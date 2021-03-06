import { ServerMessageEvent } from './messageEvents'
import { ClientEventEmitter } from './client'

type ClientStateType = ClientStateTypeWithoutArg | ClientStateWithArg["type"]
type ClientStateTypeWithoutArg = "unsent" | "joined" | "syncing" | "synced" | "ready" | "playing"

type ClientStateWithArg = ClientStoppedState | ClientSeekingState | ClientEndedState
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
    resumeSeen: boolean
}
type ClientEndedState = {
    type: "ended"
    timeDiff: number
    loaded: boolean
}
type ClientStateSpec<T extends ClientStateType> = ClientState & {type: T}

export type ClientState = ClientStateWithoutArg | ClientStateWithArg

type VideoEvent = "play" | "pause" | "seeking" | "seeked" | "loadeddata"
export type ClientEvent =
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
            return emitter.reduceToStateIfVideoHasEnded(
                () => {
                    emitter.sendReady(false)
                    return { ...state, type: "ended", loaded: false }
                },
                () => {
                    emitter.sendPause()
                    return { ...state, type: "stopped", controlled: true }
                }
            )
        }
        if (event.type === "message" && event.event.type === "seek") {
            emitter.seekVideoTo(event.event.videoTime)
            return { ...state, type: "seeking", controlled: false, paused: false, resumeSeen: false }
        }
        if (event.type === "video" && event.event === "seeking") {
            return { ...state, type: "seeking", controlled: true, paused: false, resumeSeen: false }
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
                    return {
                        type: "seeking",
                        timeDiff: state.timeDiff,
                        controlled: false,
                        paused: true,
                        resumeSeen: false
                    }
                }
            )
        }
        if (event.type === "message" && event.event.type === "seek") {
            emitter.seekVideoTo(event.event.videoTime)
            return { ...state, type: "seeking", controlled: false, paused: true, resumeSeen: false }
        }
        if (event.type === "video" && event.event === "seeking") {
            return { ...state, type: "seeking", controlled: true, paused: true, resumeSeen: false }
        }
        return state
    },
    seeking (state, event, emitter) {
        if (!state.paused && state.controlled && event.type === "video" && event.event === "seeked") {
            emitter.pauseVideo()
            emitter.sendSeekWithCurrentTime()
            return state
        }
        if (!state.paused && state.controlled && event.type === "message" && event.event.type === "seek") {
            const videoTime = event.event.videoTime
            return emitter.reduceToStateIfVideoTimeIsAround(
                videoTime,
                () => state,
                () => {
                    emitter.seekVideoTo(videoTime)
                    return { type: "seeking", timeDiff: state.timeDiff, controlled: false, paused: false, resumeSeen: false }
                }
            )
        }
        if (!state.paused && state.controlled && event.type === "message" && event.event.type === "resume") {
            emitter.sendReady(true)
            return { type: "ready", timeDiff: state.timeDiff }
        }
        if (!state.paused && !state.controlled && event.type === "video" && event.event=== "seeked") {
            emitter.pauseVideo()
            if (!state.resumeSeen) {
                emitter.sendResume()
            }
            emitter.sendReady(true)
            return { type: "ready", timeDiff: state.timeDiff }
        }
        if (!state.paused && !state.controlled && event.type === "video" && event.event=== "seeked") {
            return { ...state, resumeSeen: true }
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
    ended (state, event, emitter) {
        if (event.type === "video" && event.event === "loadeddata") {
            emitter.pauseVideo()
            emitter.sendReady(true)
            return { type: "ready", timeDiff: state.timeDiff }
        }
        if (state.loaded && event.type === "video" && event.event === "play") {
            emitter.pauseVideo()
            emitter.sendReady(true)
            return { type: "ready", timeDiff: state.timeDiff }
        }
        return state
    }
}
export const reduceState = (state: ClientState, event: ClientEvent, emitter: ClientEventEmitter) => {
    const result = clientReducerMap[state.type](state as any, event, emitter) as ClientState
    console.log(state, "->", result, "@", event)
    return result
}
