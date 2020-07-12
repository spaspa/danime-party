export const setItem = (key: string, value: string) => {
  chrome.runtime.sendMessage({method: 'LSSetItem', key, value});
}

export const getItem = (key: string): Promise<string> => {
  return new Promise(resolve => {
    chrome.runtime.sendMessage({method: 'LSGetItem', key}, response => {
      resolve(response.data as string)
    });
  })
}
