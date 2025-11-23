document.getElementById('loginForm').addEventListener('submit', async function(event) {
    // Prevent the form from submitting the traditional way
    event.preventDefault();

    const mobile = document.getElementById('mobile').value;
    const password = document.getElementById('password').value;
    const loginButton = this.querySelector('button[type="submit"]');

    if (!mobile || !password) {
        alert('Please enter both mobile number and password.');
        return;
    }

    loginButton.disabled = true;
    loginButton.textContent = 'Logging in...';

    try {
        const response = await fetch(`${API_BASE_URL}/api/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ mobile, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.msg || 'Login failed. Please check your credentials.');
        }

        // --- Login Successful ---
        alert('Login successful!');

        // Store user info received from the server in sessionStorage
        sessionStorage.setItem('loggedInUser', JSON.stringify(data.user));

        // Redirect based on isAdmin flag
        if (data.user.isAdmin) {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'home.html';
        }
    } catch (error) {
        alert(error.message);
    } finally {
        loginButton.disabled = false;
        loginButton.textContent = 'Login';
    }
});