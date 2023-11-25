//******Reminder to change document.domain to location.hostname *****
var socket = io.connect('http://' + document.domain + ':'+location.port);

var soundToggleButton = document.getElementById('sound-toggle');
var scrollToggleButton = document.getElementById('auto-scroll-toggle');
var speedInput = document.getElementById('scroll-speed');

let connectionState = 'initial';

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