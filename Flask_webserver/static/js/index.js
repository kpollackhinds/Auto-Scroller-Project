//******Reminder to change document.domain to location.hostname *****
var socket = io.connect('http://' + document.domain + ':'+location.port);

var soundToggleButton = document.getElementById('sound-toggle');
var scrollToggleButton = document.getElementById('auto-scroll-toggle');
var speedInput = document.getElementById('scroll-speed');
const connectButton = document.getElementById('connect-button');
const connectButtonArduino = document.getElementById('connect-button-arduino');

const resetButton = document.getElementById('reset-button');


soundToggleButton.addEventListener('click', toggleSound);
scrollToggleButton.addEventListener('click', toggleScroll);

let connectionState = 'initial';

connectButton.addEventListener("click", function(){
    socket.emit('start_mcu_thread');

    switch (connectionState){
        case 'initial':
            connectionState = 'connecting';
            connectButton.textContent = 'Connecting...';
            
            connectButton.classList.remove('connect-button');
            connectButton.classList.add('connecting-button');
            break;
        
        case 'connecting':
            // add additional error handling or functionality later
            break;

        case 'connected':
            // add additional functionality later 
            break
    }
});

connectButtonArduino.addEventListener("click", function(){
    socket.emit('start_arduino_thread');

    // switch (connectionState){
    //     case 'initial':
    //         connectionState = 'connecting';
    //         connectButton.textContent = 'Connecting...';
            
    //         connectButton.classList.remove('connect-button');
    //         connectButton.classList.add('connecting-button');
    //         break;
        
    //     case 'connecting':
    //         // add additional error handling or functionality later
    //         break;

    //     case 'connected':
    //         // add additional functionality later 
    //         break
    // }
});

socket.on('mcu_connected', function(){
    connectionState = 'connected';
    connectButton.textContent = 'Connected';

    connectButton.classList.remove('connecting-button');
    connectButton.classList.add('connected-button');
})

resetButton.addEventListener("click", function(){
    socket.emit('reset-connection');

    switch (connectionState){
        case 'initial':
            break;
        case 'connecting':
            connectionState = 'initial';
            connectButton.classList.remove('connecting-button');
            connectButton.classList.add('connect-button')
            connectButton.textContent = 'Connect to Device';

            break;
        case 'connected':
            connectionState = 'initial';
            connectButton.classList.remove('connected-button');
            connectButton.classList.add('connect-button');
            connectButton.textContent = 'Connect to Device';
            break;
    }
})


function toggleSound() {
    if (soundToggleButton.innerHTML === "Off") {
        soundToggleButton.innerHTML = "On";
        soundToggleButton.classList.remove('off');
        // Add logic to enable sound
    } else {
        soundToggleButton.innerHTML = "Off";
        soundToggleButton.classList.add('off');
        // Add logic to disable sound
    }
    sendButtonState();
}

function toggleScroll() {
    if (scrollToggleButton.innerHTML === "Off") {
        scrollToggleButton.innerHTML = "On";
        scrollToggleButton.classList.remove('off');
        speedInput.disabled = false;
        // Add logic to enable sound
    } else {
        scrollToggleButton.innerHTML = "Off";
        scrollToggleButton.classList.add('off');
        speedInput.disabled = true;
        // Add logic to disable sound
    }
    sendButtonState();

}

// Example functions to update connection status
function updateWristStatus(connected) {
    document.getElementById('wrist-status').innerText = connected ? 'Connected' : 'Disconnected';
}

function updateControllerStatus(connected) {
    document.getElementById('controller-status').innerText = connected ? 'Connected' : 'Disconnected';
}

//making post request to update_setting_states route
function sendButtonState(){
    var xhr = new XMLHttpRequest();
    xhr.open("POST", '/update_setting_states', true); // Ensure the URL matches your Flask route
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onreadystatechange = function (){
        if(this.readyState === XMLHttpRequest.DONE && this.status === 200){
            console.log('y')
        }
    }
    var data = {
        soundState: soundToggleButton.innerHTML,
        scrollState: scrollToggleButton.innerHTML,
        scrollSpeed: speedInput.value
    };
    xhr.send(JSON.stringify(data));

}