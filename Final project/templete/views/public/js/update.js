function updatePassword() {
    // Get the new password and confirm password values from the input fields
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    console.log('New Password:', newPassword);
    console.log('Confirm Password:', confirmPassword);

    // Check if the new password and confirm password match
    if (newPassword !== confirmPassword) {
        // If passwords don't match, display an error message
        document.getElementById('error-message').textContent = "Passwords do not match";
        return;
    }

    // If passwords match, send a POST request to the server to update the password
    fetch('/updatepassword', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newPassword })
    })
    .then(response => {
        if (response.ok) {
            // Password updated successfully, redirect to the profile page
            window.location.href = '/profile';
        } else {
            // Handle error responses from the server
            return response.text().then(errorMessage => {
                throw new Error(errorMessage);
            });
        }
    })
    .catch(error => {
        // Display error message to the user
        document.getElementById('error-message').textContent = error.message;
    });
}
