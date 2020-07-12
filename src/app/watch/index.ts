import Client, {ClientReadyState} from '../../utils/client'
import {lsKeyPageType, lsRoomId} from '../../utils/constants'
import {injectButton} from './buttonInjector'
import {simpleRandomStr} from '../../utils/random'
import {getItem, setItem} from '../../utils/contentLocalStorage'

const events = [
  "play",
  "pause",
  "seeked",
  "seeking",
  "loadstart"
]

const main = async () => {
  const video = document.querySelector('video')
  if (!video) return

  window.addEventListener("beforeunload", () => leave(client))

  let didLoaded = false
  let didInteracted = false

  video.autoplay = false
  video.muted = true
  video.currentTime = 0
  video.pause()

  injectButton(() => {
    didInteracted = true
    if (didLoaded) {
      sendReady(client)
    }
  })

  const client = new Client(
    () => video.play(),
    () => video.pause(),
  )

  const roomId = (await getItem(lsRoomId)) ?? simpleRandomStr()
  setItem(lsRoomId, roomId)
  console.log(`room id: ${roomId}`)
  client.sendJoin(roomId)

  client.sendSync()

  video.addEventListener("loadeddata", () => {
    video.pause()
    video.muted = false
    didLoaded = true
    if (didInteracted) {
      sendReady(client)
    }
  })

  video.addEventListener('pause', () => {
    client.sendPause()
  })

  events.forEach(event => {
    video.addEventListener(event, () => console.log(event))
  })
}

const leave = (client: Client) => {
  localStorage.setItem(lsKeyPageType, "other")
  client.sendLeave()
}

const sendReady = (client: Client) => {
  client.sendReady(true)
}

export default main
