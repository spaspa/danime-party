import {h, render} from 'preact'
import PartyButton from '../../components/PartyButton'

/**
 * Inject button to control and returns loading state setter.
 */
export const injectButton = (handler: () => void) => {
  const buttonArea = document.querySelector(".buttonArea")
  const settting = buttonArea?.querySelector(".setting")
  if (!buttonArea || !settting) return

  const newButton = document.createElement('div')
  newButton.addEventListener("click", handler)
  buttonArea.insertBefore(newButton, settting)
  render(<PartyButton handler={handler} />, newButton)
}
