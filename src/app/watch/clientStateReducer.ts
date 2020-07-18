import {ServerMessageEventType} from "../../utils/constants"

type ClientStateType = "unsent" | "joined" | "syncing" | "synced" | "ready" | "playing" | "stopped" | "seeking"
type ClientStateBase = {
    type: ClientStateType
}
type ClientControlState = ClientStateBase & {
    type: "stopped" | "seeking"
    controlled: boolean
}
type ClientStateSpec<T extends ClientStateType> = ClientState & {type: T}

export type ClientState = ClientStateBase | ClientControlState

type VideoEvent = "play" | "pause" | "seeking" | "seeked"
type ClientEvent =
    | { type: "video", event: VideoEvent }
    | { type: "message", event: ServerMessageEventType }

type ClientReducerMap = { [T in ClientStateType]: (state: ClientStateSpec<T>, event: ClientEvent) => ClientState }
const clientReducerMap: ClientReducerMap = {
    unsent (state, event) {
        return state
    },
    joined (state, event) {
        return state
    },
    syncing (state, event) {
        return state
    },
    synced (state, event) {
        return state
    },
    ready (state, event) {
        return state
    },
    playing (state, event) {
        return state
    },
    stopped (state, event) {
        return state
    },
    seeking (state, event) {
        return state
    },
}
export const reduceState = (state: ClientState, event: ClientEvent) => {
    return clientReducerMap[state.type](state as any, event) as ClientState
}
