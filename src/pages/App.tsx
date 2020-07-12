import {h, render} from 'preact'
import Lobby from './Lobby'

const App = () => {
  return (<Lobby />)
}

export default App

const el = document.getElementById('app')
if (el) {
  render(<App />, el)
}
