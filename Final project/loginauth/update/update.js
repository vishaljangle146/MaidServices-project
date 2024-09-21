function updatePassword() {
    var newPasswordInput = document.getElementById('newPassword');
    var confirmPasswordInput = document.getElementById('confirmPassword');
    var errorMessage = document.getElementById('error-message');

    var newPassword = newPasswordInput.value;
    var confirmPassword = confirmPasswordInput.value;

    // Check if passwords match
    if (newPassword !== confirmPassword) {
        errorMessage.textContent = 'Passwords do not match.';
        return;
    }

    // Check if password length is between 8 and 18 characters
    if (newPassword.length < 8 || newPassword.length > 18) {
        errorMessage.textContent = 'Password must be between 8 and 18 characters long.';
        return;
    }

    // Passwords match and are valid, proceed with update
    alert('Password updated successfully!');
}
