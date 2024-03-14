// date-navigation.js

function goToPreviousDay() {
    const currentDateObj = new Date(currentDate);
    const previousDate = new Date(currentDateObj.getTime() - 24 * 60 * 60 * 1000);
    updateCurrentDate(previousDate);
}

function goToNextDay() {
    const currentDateObj = new Date(currentDate);
    const nextDate = new Date(currentDateObj.getTime() + 24 * 60 * 60 * 1000);
    updateCurrentDate(nextDate);
}

function updateCurrentDate(newDate) {
    // Update the global currentDate variable
    currentDate = newDate.toISOString().split('T')[0];
    
    // Update the current date displayed on the main page
    document.getElementById('currentDate').innerText = 'Current Date: ' + newDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Redirect to the main page with the updated date
    window.location.href = '/main?date=' + currentDate;
}
