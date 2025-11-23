document.addEventListener('DOMContentLoaded', function() {
    // --- Security Check: Ensure the logged-in user is an admin ---
    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));

    if (!loggedInUser || !loggedInUser.isAdmin) {
        alert('Access Denied. You must be an admin to view this page.');
        window.location.href = 'index.html'; // Redirect non-admins to login page
        return; // Stop further execution
    }

    // --- Logout Button Logic for Admin ---
    const logoutBtnAdmin = document.getElementById('logout-btn-admin');
    if (logoutBtnAdmin) {
        logoutBtnAdmin.addEventListener('click', function() {
            sessionStorage.removeItem('loggedInUser');
            alert('You have been logged out successfully.');
            window.location.href = 'index.html'; // Redirect to login page
        });
    }
});