function toggleSound() {
    var soundToggleButton = document.getElementById('sound-toggle');
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
    var scrollToggleButton = document.getElementById('auto-scroll-toggle');
    if (scrollToggleButton.innerHTML === "Off") {
        scrollToggleButton.innerHTML = "On";
        scrollToggleButton.classList.remove('off');
        // Add logic to enable sound
    } else {
        scrollToggleButton.innerHTML = "Off";
        scrollToggleButton.classList.add('off');
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
