// var pagePort = null;
// var devtoolsPort = null;
//
// chrome.runtime.onConnect.addListener(function(port) {
//
//   switch (port.name){
//     case 'page':
//       pagePort = port;
//       pagePort.onMessage.addListener(handleIncomingPage);
//     break;
//
//     case 'devtools':
//       devtoolsPort = port;
//       devtoolsPort.onMessage.addListener(handleIncomingDevTools);
//     break;
//   }
// });
//
//
// function handleIncomingPage(data){
//   if (devtoolsPort){
//     devtoolsPort.postMessage(data);
//   }
// }
//
// function handleIncomingDevTools(data, sender){
//   if (pagePort){
//     pagePort.postMessage(data);
//   }
// }
//
// chrome.runtime.onConnect.addListener(function(port) {
//   console.log(port.name);
//   port.onMessage.addListener(function(data, sender){
//     console.log('data!!!!');
//     console.log(data.shape, sender);
//   });
// });

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('request');
  console.log(request.shape);
  console.log(sender.tab.id);
    // Messages from content scripts should have sender.tab set
    if (sender.tab) {
      var tabId = sender.tab.id;


      // if (tabId in connections) {
      //   connections[tabId].postMessage(request);
      // } else {
      //   console.log("Tab not found in connection list.");
      // }
    } else {
      console.log("sender.tab not defined.");
    }
    return true;
});
