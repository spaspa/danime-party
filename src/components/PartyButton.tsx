import {h} from 'preact';
import './PartyButton.css'

type Props = {
  stateType: "nonReady" | "controllable" | "waiting"
  playing: boolean
  handlePlayClick: () => void
  handlePauseClick: () => void
}

const Watch = (props: Props) => {
  switch (props.stateType) {
    case "nonReady":
      return (<div class="nonReady mainButton partyButton"></div>)
    case "controllable":
      return props.playing
        ? (<div onClick={props.handlePauseClick} class="pause mainButton partyButton"></div>)
        : (<div onClick={props.handlePlayClick} class="play mainButton partyButton"></div>)
    case "waiting":
      return (<div class="waiting mainButton partyButton"></div>)
  }
}
export default Watch
