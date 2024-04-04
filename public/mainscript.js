


function changeLab(labnum) {
    document.getElementById('current-lab').textContent = 'Current Lab: ' + labnum;
    // Perform any additional actions based on the selected lab
}

function submitForm() {
    const selectedSeat = document.getElementById('seat').value;
    document.getElementById('selected-seat').value = selectedSeat;
    return true; // Submit the form
}

function changeColor(button) {
    const timeSlot = button.parentNode; // Get the parent div with class 'time-slot'
    timeSlot.style.backgroundColor = 'green'; // Set the background color to green
}