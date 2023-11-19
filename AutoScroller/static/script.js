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
}

// Example functions to update connection status
function updateWristStatus(connected) {
    document.getElementById('wrist-status').innerText = connected ? 'Connected' : 'Disconnected';
}

function updateControllerStatus(connected) {
    document.getElementById('controller-status').innerText = connected ? 'Connected' : 'Disconnected';
}

// Call these functions when the status of device connections changes
