import {h, render} from 'preact'
import Watch from './Watch'
import Lobby from './Lobby'

const usePageType = () => {
  return localStorage.getItem("pageType")
}


const App = () => {
  const pageType = usePageType()
  if (pageType === 'watch') {
    return (<Watch />)
  }
  if (pageType === 'lobby') {
    return (<Lobby />)
  }
  else {
    return (<div>nothing</div>)
  }
}

export default App

const el = document.getElementById('app')
if (el) {
  render(<App />, el)
}
