import {h} from 'preact';
import {useState, useEffect} from 'preact/hooks'
import {lsRoomId} from '../utils/constants'
import {getItem, setItem} from '../utils/contentLocalStorage';

const Lobby = () => {
  const [roomId, setRoomId] = useState("")
  const saveRoomId = () => setItem(lsRoomId, roomId)

  useEffect(() => {
    (async () => {
      const id = (await getItem(lsRoomId)) ?? ""
      setRoomId(id)
    })()
  }, [])

  return (
    <div>
      <label for="roomInput">Room</label>
      <input
        type="text"
        id="roomInput"
        value={roomId}
        onChange={e => {
          console.log((e.target as HTMLInputElement).value)
          setRoomId((e.target as HTMLInputElement).value)
        }}
      />

      <button onClick={saveRoomId}>Apply</button>
    </div>
  )
}

export default Lobby
