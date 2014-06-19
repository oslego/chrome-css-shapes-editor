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
