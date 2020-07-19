import {h, render} from 'preact'
import PartyController from '../../components/PartyController'

type Props = {
  loading: boolean
}

/**
 * Inject button to control and returns loading state setter.
 */
export const injectButton = () => {
  const buttonArea = document.querySelector(".buttonArea")
  const settting = buttonArea?.querySelector(".setting")
  if (!buttonArea || !settting) return

  const newButton = document.createElement('div')
  buttonArea.insertBefore(newButton, settting)
  render(<PartyController />, buttonArea)
  return newButton
}
