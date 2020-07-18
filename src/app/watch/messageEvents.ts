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

// TODO: Server Message Parser