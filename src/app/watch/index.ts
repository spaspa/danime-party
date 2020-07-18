import { Client } from './client'
import {lsKeyPageType, lsRoomId, lsPath} from '../../utils/constants'
import {injectButton} from './buttonInjector'
import {getItem} from '../../utils/contentLocalStorage'
import {adjustDisplay} from './adjustDisplay'

const events = [
  "play",
  "pause",
  "seeked",
  "seeking",
  "loadstart",
  "stall",
  "waiting"
]

const main = async () => {
  let video = document.querySelector('video') as HTMLVideoElement  //unsafe
  if (!video) return

  window.addEventListener("beforeunload", () => leave(client))

  const roomId = (await getItem(lsRoomId))
  if (!roomId) {
    console.error("No room id specified")
  }
  const path = (await getItem(lsPath))
  if (!path) {
    console.error("No path specified")
  }

  let didInteracted = false

  video.autoplay = false
  video.muted = true
  video.currentTime = 0
  video.pause()

  const client = new Client(roomId, video, path)
  client.start()

  injectButton(() => {
    if (!didInteracted) {
      client.interacted()
      didInteracted = true
    } 
  })
  adjustDisplay()

}

const leave = (client: Client) => {
  localStorage.setItem(lsKeyPageType, "other")
  client.leave()
}

export default main
