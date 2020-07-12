import {h} from 'preact';
import './PartyButton.css'
import Spinner from './Spinner'

type Props = {
  handler: () => void
  loading?: boolean
}

const Watch = (props: Props) => props.loading
  ? (<Spinner />)
  : (<div class="party mainButton" onClick={props.handler}></div>)

export default Watch
