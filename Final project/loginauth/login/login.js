function login() {
    var phoneNumberInput = document.getElementById('phone-number');
    var passwordInput = document.getElementById('password');
    var errorMessage = document.getElementById('error-message');

    var phoneNumber = phoneNumberInput.value;
    var password = passwordInput.value;

    // Check if phone number is exactly 10 characters and contains only numbers
    if (!/^\d{10}$/.test(phoneNumber)) {
        errorMessage.textContent = 'Please enter a valid 10-digit phone number.';
        return;
    }

    // Check if password length is between 8 and 18 characters
    if (password.length < 8 || password.length > 18) {
        errorMessage.textContent = 'Password must be between 8 and 18 characters long.';
        return;
    }

    // Proceed with login
    alert('Login successful!');
}

function sendPassword() {
    var phoneNumber = document.getElementById('phone-number').value;
    
    // Check if the input is exactly 10 characters and contains only numbers
    if (/^\d{10}$/.test(phoneNumber)) {
        // Proceed with sending OTP
        alert("OTP sent successfully!");
    } else {
        // Display error message
        alert("Please enter a valid 10-digit phone number.");
    }
}

// Restrict input to numeric characters only
document.addEventListener('DOMContentLoaded', function() {
    var phoneNumberInput = document.getElementById('phone-number');
    phoneNumberInput.addEventListener('input', function(event) {
        this.value = this.value.replace(/\D/g, ''); // Replace non-numeric characters with an empty string
    });
});

