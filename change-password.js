document.addEventListener('DOMContentLoaded', function() {
    const changePasswordForm = document.getElementById('changePasswordForm');

    // --- Get user info from sessionStorage ---
    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
    if (!loggedInUser) {
        alert('You are not logged in!');
        window.location.href = 'index.html';
        return;
    }

    // --- Handle form submission ---
    changePasswordForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const submitButton = this.querySelector('button[type="submit"]');

        // --- Validation ---
        if (!currentPassword || !newPassword || !confirmPassword) {
            alert('Please fill in all fields.');
            return;
        }

        if (newPassword !== confirmPassword) {
            alert('New password and confirm password do not match.');
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = 'Updating...';

        try {
            const response = await fetch(`${API_BASE_URL}/api/users/change-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: loggedInUser.id,
                    currentPassword,
                    newPassword
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.msg || 'Failed to update password.');
            }

            alert(data.msg);

            // Log the user out for security
            sessionStorage.removeItem('loggedInUser');
            window.location.href = 'index.html';
        } catch (error) {
            alert(error.message);
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Update Password';
        }
    });

    // --- Toggle Password Visibility ---
    document.querySelectorAll('.toggle-password').forEach(button => {
        button.addEventListener('click', function() {
            const passwordInput = this.previousElementSibling;
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.textContent = type === 'password' ? 'Show' : 'Hide';
        });
    });
});