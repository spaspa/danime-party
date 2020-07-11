import Client from '../../utils/client'
import {lsKeyPageType} from '../../utils/constants'

const events = [
  "play",
  "seeked",
  "seeking",
  "loadstart"
]

const main = () => {
  const video = document.querySelector('video')
  if (!video) return

  video.autoplay = true
  video.muted = true

  window.addEventListener("beforeunload", leave)

  const client = new Client(
    () => video.play(),
    () => video.pause(),
  )

  // TODO: LocalStorage
  const roomName = "poyo"
  client.sendJoin(roomName)

  client.sendSync()

  video.addEventListener("loadeddata", () => {
    video.pause()
    video.muted = false
    client.sendReady(true)
  })

  // debug
  // events.forEach(event => {
  //   video.addEventListener(event, () => console.log(event))
  // })
}

const leave = () => {
  localStorage.setItem(lsKeyPageType, "other")
}

export default main
