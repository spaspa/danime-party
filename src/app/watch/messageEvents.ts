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

type ServerMessageEventSync = {
    type: typeof messageSync
    timeDiff: number
}
type ServerMessageEventPlay = {
    type: typeof messagePlay
    serverTime: number
}
type ServerMessageEventSeek = {
    type: typeof messageSeek
    videoTime: number
}
type ServerMessageEventTypeWithOutArg =
    | typeof messageOk
    | typeof messageAccept
    | typeof messageError
    | typeof messageReject
    | typeof messagePause
    | typeof messageReady

type ServerMessageEventWithArg =
    | ServerMessageEventSync
    | ServerMessageEventPlay
    | ServerMessageEventSeek
type ServerMessageEventWithoutArg = {
    type: ServerMessageEventTypeWithOutArg
}

export type ServerMessageEvent =
    | ServerMessageEventWithoutArg
    | ServerMessageEventWithArg

export const parseServerMessage = (message: string): ServerMessageEvent => {
    const data = message.split(':')
    const messageType = data[0]
    switch (messageType) {
    case messageSync:
        if (data.length < 2) break
        return { type: messageType, timeDiff: parseFloat(data[1]) }
    case messagePlay:
        if (data.length < 2) break
        return { type: messageType, serverTime: parseFloat(data[1]) }
    case messageSeek:
        if (data.length < 2) break
        return { type: messageType, videoTime: parseFloat(data[1]) }
    case messageOk:
    case messageAccept:
    case messageError:
    case messageReject:
    case messagePause:
    case messageReady:
        return { type: messageType }
    }
    throw `invalid message: ${message}`
}