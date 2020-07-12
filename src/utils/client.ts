import {
  commandJoin,
  commandSync,
  commandLeave,
  commandReady,
  commandPlay,
  messageSync,
  messagePlay,
  messagePause,
  messageReady,
  commandPause,
  commandSeek,
  messageSeek
} from './constants'

export enum ClientReadyState {
  unsent = 0,
  joined = 1,
  syncing = 2,
  synced = 3,
  ready = 4,
  userStop = 5,
  playing = 6
}

export default class Client {
  private ws: WebSocket
  private timeDiff = 0

  private dispatchQueue: string[] = []

  interacted = false

  readyState: ClientReadyState = ClientReadyState.unsent

  constructor(
    readonly videoTimeGetter: () => number,
    readonly playHandler: () => void,
    readonly pauseHandler: () => void,
    readonly seekHandler: (videoTime: number) => boolean,
    readonly path = "wss://localhost:8080/ws"
  ) {
    this.ws = new WebSocket(path)
    this.setupListerner()
  }

  private setupListerner() {
    this.ws.addEventListener("message", e => {
      console.log(`message: ${e.data}`)
      const data = e.data.split(':')
      const message = data[0]
      if (message === messageSync) this.onSync(data)
      if (message === messagePlay) this.onPlay(data)
      if (message === messagePause) this.onPause(data)
      if (message === messageSeek) this.onSeek(data)
      if (message === messageReady) this.onReady(data)
    })
    this.ws.addEventListener("open", () => {
      this.dispatchQueue.forEach(c => this.ws.send(c))
    })
  }

  private sendCommand(...commands: string[]) {
    if (this.ws.readyState < WebSocket.OPEN) {
      this.dispatchQueue.push(commands.join(":"))
    }
    else {
      this.ws.send(commands.join(":"))
    }
  }

  sendJoin(roomId: string) {
    if (this.readyState < ClientReadyState.joined) {
      this.sendCommand(commandJoin, roomId)
    }
    this.readyState = ClientReadyState.joined
  }
  sendLeave() {
    this.sendCommand(commandLeave)
    this.readyState = ClientReadyState.unsent
  }

  sendSync() {
    this.sendCommand(commandSync, (Date.now() / 1000).toString())
    this.readyState = ClientReadyState.syncing
  }

  sendReady(ready: boolean) {
    this.sendCommand(commandReady, String(ready))
    this.readyState = ClientReadyState.ready
  }

  sendPlay(videoTime = 0) {
    if (this.readyState !== ClientReadyState.ready) {
      return
    }
    this.sendCommand(commandPlay, videoTime.toString())
  }

  sendPause() {
    if (this.readyState !== ClientReadyState.playing && this.readyState !== ClientReadyState.userStop) {
      return
    }
    this.readyState = ClientReadyState.userStop
    this.sendCommand(commandPause)
  }

  sendSeek(videoTime: number) {
    if (this.interacted) {
      this.sendCommand(commandSeek, `${videoTime}`)
    }
  }

  private playVideo(serverTime: number) {
    const startTime = serverTime + this.timeDiff
    setTimeout(() => {
      this.playHandler()
      this.readyState = ClientReadyState.playing
    }, Date.now() / 1000 - startTime)
  }

  private onSync(data: string[]) {
    this.timeDiff = parseFloat(data[1])
    console.log(`Time diff set: ${this.timeDiff}`)
    this.readyState = ClientReadyState.synced
  }

  private onPlay(data: string[]) {
    this.readyState = ClientReadyState.playing
    const videoTime = parseFloat(data[1])
    const serverTime = parseFloat(data[2])
    this.seekHandler(videoTime)
    this.playVideo(serverTime)
    this.interacted = false
  }
  private onPause(_: string[]) {
    this.pauseHandler()
    if (this.interacted) {
      this.sendReady(false)
      this.readyState = ClientReadyState.userStop
    } else {
      this.sendReady(true)
      this.readyState = ClientReadyState.ready
    }
  }
  private onSeek(data: string[]) {
    this.pauseHandler()
    const videoTime = parseFloat(data[1])
    if (this.seekHandler(videoTime)) {
      this.readyState = ClientReadyState.synced
    }
    else if (this.readyState !== ClientReadyState.userStop) {
      this.sendReady(false)
    }
  }
  private onReady(_: string[]) {
    this.sendPlay(this.videoTimeGetter())
  }
}
