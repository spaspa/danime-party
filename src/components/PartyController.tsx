import {h} from 'preact';
import { Client, StateType } from "../app/watch/client";
import { useState, useEffect, StateUpdater } from 'preact/hooks';
import {lsKeyPageType, lsRoomId, lsPath} from '../utils/constants'
import {getItem} from '../utils/contentLocalStorage'
import PartyButton from './PartyButton'

let globalClient: Client

const setupClient = async (video: HTMLVideoElement) => {
    const [interacted, setInteracted] = useState(false)

    window.addEventListener("beforeunload", () => client?.leave())

    const onInteract = () => {
        if (interacted) return
        client?.interacted()
        setInteracted(false)
        window.removeEventListener("click", onInteract)
    }
    window.addEventListener("click", onInteract)

    const roomId = (await getItem(lsRoomId))
    if (!roomId) {
        console.error("No room id specified")
    }
    const path = (await getItem(lsPath))
    if (!path) {
        console.error("No path specified")
    }

    video.autoplay = false
    video.muted = true
    video.currentTime = 0
    video.pause()

    const client = new Client(roomId, video, path)
    client.start()
    return client
}

const useClientStateType = (
    client: Client,
    setStateType: StateUpdater<StateType>,
    setPlaying: StateUpdater<boolean>
) => {
    client.onStateChange = (newState) => {
        setStateType(Client.typeOfState(newState))
        setPlaying(newState.type === "playing")
    }
}

const useClickHandlers = () => {
    const handlePlayClick = () => {
        globalClient?.emitter.playVideo()
    }
    const handlePauseClick = () => {
        globalClient?.emitter.pauseVideo()
    }
    return { handlePlayClick, handlePauseClick }
}


const PartyButtonBar = () => {
    const [stateType, setStateType] = useState("nonReady" as StateType)
    const [playing, setPlaying] = useState(false)
    useEffect(() => {
        let video = document.querySelector('video') as HTMLVideoElement  //unsafe
        if (!video) return
        setupClient(video).then(client => {
            useClientStateType(client, setStateType, setPlaying)
            globalClient = client
        })
    }, [])
    const { handlePlayClick, handlePauseClick } = useClickHandlers()
    return (
        <div class="partyButtonBar">
            <PartyButton
                stateType={stateType}
                playing={playing}
                handlePlayClick={handlePlayClick}
                handlePauseClick={handlePauseClick}
            />
        </div>
    )
}

export default PartyButtonBar