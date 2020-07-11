import {h} from 'preact';

const Lobby = () => (
  // TODO LocalStorage
  <div>
    <label for="roomInput">Room</label>
    <input type="text" id="roomInput" />

    <button>Apply</button>
  </div>
)

export default Lobby
