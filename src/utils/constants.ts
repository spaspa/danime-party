export const commandPlay = "play!"
export const commandPause = "pause!"
export const commandSeek = "seek!"
export const commandSync = "sync"
export const commandJoin = "join"
export const commandLeave = "leave"
export const commandReady = "ready"

export type CommandType =
    | typeof commandPlay
    | typeof commandPause
    | typeof commandSeek
    | typeof commandSync
    | typeof commandJoin
    | typeof commandLeave
    | typeof commandReady

export const lsKeyPageType = "pageType"
export const lsRoomId = "roomId"
export const lsPath = "path"
