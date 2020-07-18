export const commandPlay = "play!"
export const commandPause = "pause!"
export const commandSeek = "seek!"
export const commandSync = "sync"
export const commandJoin = "join"
export const commandLeave = "leave"
export const commandReady = "ready"

export const messageOk = "OK"
export const messageAccept = "accept"
export const messageSync = "sync"
export const messageError = "error"
export const messageReject = "reject"
export const messagePlay = "play"
export const messagePause = "pause"
export const messageSeek = "seek"
export const messageReady = "ready"

export type ServerMessageEventType =
    | typeof messageOk
    | typeof messageAccept
    | typeof messageSync
    | typeof messageError
    | typeof messageReject
    | typeof messagePlay
    | typeof messagePause
    | typeof messageSeek
    | typeof messageReady

export const lsKeyPageType = "pageType"
export const lsRoomId = "roomId"
export const lsPath = "path"
