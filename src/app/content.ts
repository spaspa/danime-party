import watchMain from './watch/index'
import lobbyMain from './lobby/index'
import {setItem} from '../utils/contentLocalStorage';
import {lsKeyPageType} from '../utils/constants';

type PageType = "watch" | "lobby" | "other"

const savePageType = (pageType: PageType) => {
  setItem(lsKeyPageType, pageType)
}

const main = (pageType: PageType) => {
  if (pageType === 'watch') {
    watchMain()
  }
  else if (pageType === 'lobby') {
    lobbyMain()
  }
}

const checkReady = setInterval(() => {
  if (document.readyState === "complete") {
    clearInterval(checkReady)
    const isWatchView = location.pathname === "/animestore/sc_d_pc"
    const isLobbyView = location.pathname === "/animestore/ci_pc"
    const pageType = isWatchView ? "watch" : isLobbyView ? "lobby" : "other"
    savePageType(pageType)
    main(pageType)
  }
})

