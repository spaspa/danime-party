// localStorrage
chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
  switch (request.method) {
    case 'LSSetItem':
      sendResponse({data: localStorage.setItem(request.key, request.value)});
      break;
    default:
      break;
  }
});

