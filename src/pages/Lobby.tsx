import {h} from 'preact';
import {useState, useEffect} from 'preact/hooks'
import {lsRoomId, lsPath} from '../utils/constants'
import {getItem, setItem} from '../utils/contentLocalStorage';

const Lobby = () => {
  const [roomId, setRoomId] = useState("")
  const [path, setPath] = useState("ws://localhost:8080/ws")
  const saveRoomId = () => setItem(lsRoomId, roomId)
  const savePath = () => setItem(lsPath, path)

  useEffect(() => {
    (async () => {
      const id = (await getItem(lsRoomId)) ?? ""
      setRoomId(id)
      const path = (await getItem(lsPath)) ?? "ws://localhost:8080/ws"
      setPath(path)
    })()
  }, [])

  return (
    <div>
      <label for="pathInput">Path</label>
      <input
        type="text"
        id="pathInput"
        value={path}
        onChange={e => {
          setPath((e.target as HTMLInputElement).value)
        }}
      />

      <label for="roomInput">Room</label>
      <input
        type="text"
        id="roomInput"
        value={roomId}
        onChange={e => {
          setRoomId((e.target as HTMLInputElement).value)
        }}
      />

      <button onClick={() => {
        saveRoomId()
        savePath()
      }}>Apply</button>
    </div>
  )
}

export default Lobby
