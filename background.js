/*
  Relay messages between content script and extension page
  because the two are not allowed to communicate to each other.
*/
var devtoolsPort;

chrome.runtime.onConnect.addListener(function(port) {

  if (port.name == 'page'){
    port.onMessage.addListener(function(data){
      devtoolsPort.postMessage(data);
    });
  }

  if (port.name == 'devtools'){
    devtoolsPort = port;
  }
});
