/*
  Relay messages between page content script and devtools extension
  because the two are not allowed to communicate to each other.
*/
var devtoolsPort,
    pagePort;

chrome.runtime.onConnect.addListener(function(port) {

  if (port.name == 'page'){
    pagePort = port;
    pagePort.onMessage.addListener(function(data){
      devtoolsPort.postMessage(data);
    });
  }

  if (port.name == 'devtools'){
    devtoolsPort = port;
    devtoolsPort.onMessage.addListener(function(data){
      pagePort.postMessage(data);
    });
  }

});
