export const setItem = (key: string, value: string) => {
  chrome.runtime.sendMessage({method: 'LSSetItem', key, value});
}

