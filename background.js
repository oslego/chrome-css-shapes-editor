var pagePort = null
var devtoolsPort = null

chrome.runtime.onConnect.addListener(function(port) { 
  
  switch (port.name){
    case 'page':
      pagePort = port
      pagePort.onMessage.addListener(handleIncomingPage)
    break;
    
    case 'devtools':
      devtoolsPort = port
      devtoolsPort.onMessage.addListener(handleIncomingDevTools)
    break;
  }
});


function handleIncomingPage(data){
  if (devtoolsPort){
    devtoolsPort.postMessage(data)
  }
}

function handleIncomingDevTools(data, sender){
  if (pagePort){
    pagePort.postMessage(data)
  }
}