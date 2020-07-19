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
  injectButton()
  adjustDisplay()
}

export default main
