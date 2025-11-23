document.getElementById('registerForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const mobile = document.getElementById('mobile').value;
    const password = document.getElementById('password').value;
    const registerButton = this.querySelector('button[type="submit"]');

    if (!name || !mobile || !password) {
        alert('Please fill in all fields.');
        return;
    }

    registerButton.disabled = true;
    registerButton.textContent = 'Registering...';

    try {
        const response = await fetch(`${API_BASE_URL}/api/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, mobile, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.msg || 'Registration failed. Please try again.');
        }

        alert('Registration successful! You can now log in.');
        window.location.href = 'index.html'; // Redirect to login page

    } catch (error) {
        alert(error.message);
    } finally {
        registerButton.disabled = false;
        registerButton.textContent = 'Register';
    }
});