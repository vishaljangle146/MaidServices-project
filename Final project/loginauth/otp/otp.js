function verifyOTP() {
    // Generate a random 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000);
    // Retrieve user input
    const userOTP = document.getElementById('otpInput').value;

    // Compare user input with the generated OTP
    if (userOTP === '0000') {
        window.location.href = '../update/update.html';
        document.getElementById('message').innerText = 'OTP Verified Successfully!';
        document.getElementById('message').style.color = 'green';
    } else {
        document.getElementById('message').innerText = 'Invalid OTP. Please try again.';
        document.getElementById('message').style.color = 'red';
    }
}


document.addEventListener('DOMContentLoaded', function() {
    var otpInput = document.getElementById('otpInput');
    otpInput.addEventListener('input', function(event) {
        // Replace non-numeric characters with an empty string
        this.value = this.value.replace(/\D/g, '');
    });
});
