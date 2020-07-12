import Client, {ClientReadyState} from '../../utils/client'
import {lsKeyPageType, lsRoomId, lsPath} from '../../utils/constants'
import {injectButton} from './buttonInjector'
import {simpleRandomStr} from '../../utils/random'
import {getItem, setItem} from '../../utils/contentLocalStorage'
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

  let didLoaded = false
  let didInteracted = false
  let allClientReady = false

  video.autoplay = false
  video.muted = true
  video.currentTime = 0
  video.pause()

  injectButton(() => {
    didInteracted = true
    client.sendReady(didLoaded)
  })
  adjustDisplay()

  const client = new Client(
    () => video.currentTime,
    () => {
      allClientReady = true
      video.play()
    },
    () => video.pause(),
    (videoTime: number) => {
      if (Math.abs(video.currentTime - videoTime) > 0.1) {
        video.currentTime = videoTime
        return true
      }
      return false
    },
  )

  client.sendJoin(roomId)

  video.addEventListener('loadstart', () => {
    didLoaded = false
    allClientReady = false
    video.pause()
    client.sendReady(false)
    client.sendSync()
  })

  video.addEventListener("canplay", () => {
    didLoaded = true
    video.pause()
    video.muted = false
  })

  video.addEventListener('play', () => {
    if (!didLoaded || !allClientReady) {
      return
    }
    if (!didInteracted) {
      video.pause()
    }
    if (client.readyState === ClientReadyState.userStop) {
      video.pause()
      client.sendReady(true)
    }
  })

  video.addEventListener('pause', () => {
    if (!didLoaded) {
      return
    }
    if (client.readyState !== ClientReadyState.playing) {
      return
    }
    console.log('will send pause')
    client.interacted = true
    client.sendPause()
  })

  video.addEventListener('seeking', () => {
    if (!didLoaded) {
      return
    }
    if (client.readyState !== ClientReadyState.playing && client.readyState !== ClientReadyState.userStop) {
      return
    }
    console.log('will send pause to seek')
    client.interacted = true
    client.sendPause()
  })

  video.addEventListener('seeked', () => {
    if (!didLoaded) {
      return
    }
    if (client.readyState !== ClientReadyState.userStop) {
      client.sendReady(true)
      return
    }
    console.log('will send seek')
    client.sendSeek(video.currentTime)
  })
}

const leave = (client: Client) => {
  localStorage.setItem(lsKeyPageType, "other")
  client.sendLeave()
}

export default main
