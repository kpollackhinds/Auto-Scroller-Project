//******Reminder to change document.domain to location.hostname *****
var socket = io.connect('http://' + document.domain + ':'+location.port);

const soundToggleButton = document.getElementById('sound-toggle');
const scrollToggleButton = document.getElementById('auto-scroll-toggle');
const speedInput = document.getElementById('scroll-speed');
const connectButton = document.getElementById('connect-button');
const connectButtonArduino = document.getElementById('connect-button-arduino');

const resetButton = document.getElementById('reset-button');

const toggleDirection = document.getElementById('scroll-direction');

soundToggleButton.addEventListener('click', toggleSound);
scrollToggleButton.addEventListener('click', function(){toggleScroll(null)});
speedInput.addEventListener('change', sendButtonState);

let mcuConnectionState = 'initial';
let arduinoConnectionState = 'initial';

connectButton.addEventListener("click", function(){
    socket.emit('start_mcu_thread');

    switch (mcuConnectionState){
        case 'initial':
            mcuConnectionState = 'connecting';
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

    switch (arduinoConnectionState){
        case 'initial':
            arduinoConnectionState = 'connecting';
            connectButtonArduino.textContent = 'Connecting...';
            
            connectButtonArduino.classList.remove('connect-button');
            connectButtonArduino.classList.add('connecting-button');
            break;
        
        case 'connecting':
            // add additional error handling or functionality later
            break;

        case 'connected':
            // add additional functionality later 
            break
    }
});

socket.on('mcu_connected', function(){
    mcuConnectionState = 'connected';
    connectButton.textContent = 'Connected';

    connectButton.classList.remove('connecting-button');
    connectButton.classList.add('connected-button');
})

socket.on('arduino_connected', function(){
    arduinoConnectionState = 'connected';
    connectButtonArduino.textContent = 'Connected';

    connectButtonArduino.classList.remove('connecting-button');
    connectButtonArduino.classList.add('connected-button');
})

socket.on('autoscroll on', function(){
    toggleScroll("on");
    // sendButtonState();
})

socket.on('autoscroll off', function(){
    toggleScroll("off");
    // sendButtonState();
})

// resetButton.addEventListener("click", function(){
//     socket.emit('reset-connection');

//     switch (connectionState){
//         case 'initial':
//             break;
//         case 'connecting':
//             connectionState = 'initial';
//             connectButton.classList.remove('connecting-button');
//             connectButton.classList.add('connect-button')
//             connectButton.textContent = 'Connect to Device';

//             break;
//         case 'connected':
//             connectionState = 'initial';
//             connectButton.classList.remove('connected-button');
//             connectButton.classList.add('connect-button');
//             connectButton.textContent = 'Connect to Device';
//             break;
//     }
// })

toggleDirection.addEventListener('click', function(){
    if (toggleDirection.innerHTML === "Up ↑"){
        toggleDirection.innerHTML = "Down ↓";
        // Maybe do classlist stuff if we want additional styling
    }
    else if (toggleDirection.innerHTML === "Down ↓"){
        toggleDirection.innerHTML = "Up ↑";
    }

    sendButtonState();
});

function toggleSound() {
    if (soundToggleButton.innerHTML === "off") {
        soundToggleButton.innerHTML = "on";
        soundToggleButton.classList.remove('off');
        // Add logic to enable sound
    } else {
        soundToggleButton.innerHTML = "off";
        soundToggleButton.classList.add('off');
        // Add logic to disable sound
    }
    sendButtonState();
}

function toggleScroll(state = null) {
    console.log(state);
    if (state === null){
        if (scrollToggleButton.innerHTML === "on") {
            scrollToggleButton.innerHTML = "off";
            scrollToggleButton.classList.remove('on');
            speedInput.disabled = true;
        } else {
            scrollToggleButton.innerHTML = "on";
            scrollToggleButton.classList.add('on');
            speedInput.disabled = false;
        }
    }
    else if (state == "on"){
        scrollToggleButton.innerHTML = "on";
        scrollToggleButton.classList.add('on');
        speedInput.disabled = false;
    }
    else if(state == "off"){
        scrollToggleButton.innerHTML = "off";
        scrollToggleButton.classList.remove("on");
        speedInput.disabled = true;
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
        scrollSpeed: speedInput.value,
        dir: (toggleDirection.innerHTML === "Down ↓") ? -1 : 1 
    };

    xhr.send(JSON.stringify(data));

}