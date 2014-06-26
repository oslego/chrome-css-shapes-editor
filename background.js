/*
  Relay messages between page content script and devtools extension
  because the two are not allowed to communicate to each other.
*/
var devtoolsPort,
    pagePort;

chrome.runtime.onConnect.addListener(function(port) {

  if (port.name == 'page'){
    pagePort = port;
  }

  if (port.name == 'devtools'){
    devtoolsPort = port;
  }

  pagePort.onMessage.addListener(function(data){
    devtoolsPort.postMessage(data);
  });

  devtoolsPort.onMessage.addListener(function(data){
    pagePort.postMessage(data);
  });

});
