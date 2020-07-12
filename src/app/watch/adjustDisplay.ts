export const adjustDisplay = () => {
  const pauseArea = document.querySelector(".pauseArea") as HTMLElement
  if (!pauseArea) return

  pauseArea.style.display = "none"
}
