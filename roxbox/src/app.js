var UI = require('ui');
var ajax = require('ajax');
var Settings = require('settings');

// get pebble revision
if(Pebble.getActiveWatchInfo) {
    var watchinfo= Pebble.getActiveWatchInfo();
    var platform=watchinfo.platform;
} else {
    platform="aplite";
}

// Set a configurable with the open callback
Settings.config(
    { url: 'http://androidhell.github.io/settings/' },
    function(e) {
        console.log('opening config');
    },
    function(e) {
        console.log('closed config');
    }
);


var CONTROL_URL = Settings.option('server'); 
var AUTH_KEY = Settings.option('authkey');

// Initial window
var initWindow = new UI.Card({
    title: "RoxBox",
    scrollable: true,
    style: 'small',
    body: "Getting commands list..."
});
initWindow.show();


if (!CONTROL_URL || !AUTH_KEY) {
    // App not configured
    initWindow.title("App not configured");
    initWindow.body("Enter in the server IP and password on your phone. When done, restart this app.");
    
    if (platform == 'basalt') {
        initWindow.backgroundColor('red');
    }
}
else
{
    // all is good, you can run the app
    runApp();
}

function sendCommand(id, name) {
  //mod of detailcard based on peble docs
  
  ajax({
    url: 'http://' + CONTROL_URL + "/exec/" + AUTH_KEY + "/" + id, type: 'plain'},
    function(data) {

    },
    function(error) {
      console.log('Download failed: ' + error);
    }
  );
  
}
   
function runApp() {
    
    ajax({url: 'http://' + CONTROL_URL + "/send_json/" + AUTH_KEY, type: 'json'},
        function(json) {
            // Data retrieval worked, hide this and show the menu!
            var commandMenu = new UI.Menu({
                backgroundColor: '#AAAAAA',
                textColor: 'black',
                highlightBackgroundColor: 'blue',
                highlightTextColor: 'white',
                fullscreen: false,
                sections: [{
                  title: '',
                  items: json
                }]
            });
            
            commandMenu.show();
            initWindow.hide();
            
            // Add a click listener for select button click
            commandMenu.on('select', function(event) {
                console.log('Selected item #' + event.itemIndex + ' of section #' + event.sectionIndex);
                console.log('The item is titled "' + event.item.title + '"');
         
                // If the item is in the 2nd list, its a command
                if (event.sectionIndex === 0 ) {
                    commandMenu.fullscreen(false);
                    sendCommand(json[event.itemIndex].id, json[event.itemIndex].title);
                }
            });  
        },
        function(error) {
            console.log('Ajax failed: ' + error);
            initWindow.title('Data retrieval failed');
            initWindow.body(error);
            if (platform == 'basalt') {
                initWindow.backgroundColor('red');
                initWindow.textColor('black');
            }
        }
    );
}