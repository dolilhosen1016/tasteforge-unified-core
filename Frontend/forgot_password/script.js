document.getElementById('forgotPasswordForm').addEventListener('submit', function(event) {
    // Prevent the default form submission
    event.preventDefault();
    
    const emailInput = document.getElementById('resetEmail');
    const submitBtn = document.getElementById('submitBtn');
    const successMessage = document.getElementById('successMessage');

    // Make sure the email isn't empty
    if(emailInput.value.trim() !== '') {
        // Hide the input field
        emailInput.parentElement.style.display = 'none';
        
        // Show the success message
        successMessage.style.display = 'flex';
        
        // Change the button text and disable it
        submitBtn.textContent = 'Check your inbox';
        submitBtn.disabled = true;
    }
});