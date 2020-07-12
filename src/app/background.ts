// localStorrage
chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
  switch (request.method) {
    case 'LSSetItem':
      sendResponse({data: localStorage.setItem(request.key, request.value)});
      break;
    case 'LSGetItem':
      sendResponse({data: localStorage.getItem(request.key)});
      break;
    default:
      break;
  }
});

