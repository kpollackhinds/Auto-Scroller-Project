var soundToggleButton = document.getElementById('sound-toggle');
var scrollToggleButton = document.getElementById('auto-scroll-toggle');
var speedInput = document.getElementById('scroll-speed');

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

// Call these functions when the status of device connections changes

//AJAX Request function for asynchronous sending of button states to the server
function sendButtonState(){
    var xhr = new XMLHttpRequest();
    xhr.open("POST", '/update_state', true);
    xhr.setRequestHeader('Content-TYpe', 'application/json');
    xhr.setRequestHeader('X-CSRFToken', getCookie('csrftoken')); // CSRF token for Django
    xhr.onreadystatechange = function (){
        if(this.readyState === XMLHttpRequest.DONE && this.status === 200){
            console.log('y')
            //successful response. Can add error handling stuff if necessary
        }
    }

    var data ={
        soundState: soundToggleButton.innerHTML,
        scrollState: scrollToggleButton.innerHTML,
        scrollSpeed: speedInput.value
    };
    xhr.send(JSON.stringify(data));
}

function getCookie(name){
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}