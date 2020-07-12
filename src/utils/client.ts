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
  commandPause
} from './constants'

export enum ClientReadyState {
  unsent = 0,
  joined = 1,
  syncing = 2,
  synced = 3,
  ready = 4,
  playing = 5
}

export default class Client {
  private ws: WebSocket
  private timeDiff = 0

  private dispatchQueue: string[] = []

  // recently sent pause message
  private preventSendReady = false

  readyState: ClientReadyState = ClientReadyState.unsent

  constructor(
    readonly playHandler: () => void,
    readonly pauseHandler: () => void,
    readonly path = "ws://localhost:8080/ws"
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

  sendPlay() {
    if (this.readyState !== ClientReadyState.ready) {
      return
    }
    this.sendCommand(commandPlay)
    this.preventSendReady = false
  }

  sendPause() {
    if (this.readyState !== ClientReadyState.playing) {
      return
    }
    this.sendCommand(commandPause)
    this.sendReady(false)
    this.preventSendReady = true
  }

  private onSync(data: string[]) {
    this.timeDiff = parseFloat(data[1])
    console.log(`Time diff set: ${this.timeDiff}`)
    this.readyState = ClientReadyState.synced
  }

  private onPlay(data: string[]) {
    const serverTime = parseFloat(data[1])
    const startTime = serverTime + this.timeDiff
    setTimeout(() => {
      this.playHandler()
      this.readyState = ClientReadyState.playing
    }, Date.now() / 1000 - startTime)
    this.preventSendReady = false
  }
  private onPause(_: string[]) {
    this.pauseHandler()
    this.readyState = ClientReadyState.ready
    if (!this.preventSendReady) {
      this.sendReady(true)
    }
  }
  private onReady(_: string[]) {
    this.sendPlay()
  }
}
