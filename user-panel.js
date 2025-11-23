// This script will be shared across all user panel pages (home, profile, add-fund, etc.)

document.addEventListener('DOMContentLoaded', function() {
    const menuBtn = document.getElementById('menu-btn');
    const dropdownMenu = document.getElementById('dropdown-menu');
    const overlay = document.getElementById('overlay');
    const walletBalanceSpan = document.getElementById('wallet-balance');

    // --- Load User Data ---
    const loggedInUserInfo = JSON.parse(sessionStorage.getItem('loggedInUser'));

    if (loggedInUserInfo && loggedInUserInfo.name) {
        if (walletBalanceSpan) {
            // Initially show the balance from sessionStorage
            walletBalanceSpan.textContent = `💰 ₹${loggedInUserInfo.balance.toFixed(2)}`;
            
            // Then, fetch the latest balance from the server for accuracy
            fetch(`${API_BASE_URL}/api/users/${loggedInUserInfo._id}`)
                .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch latest balance'))
                .then(latestUserData => {
                    walletBalanceSpan.textContent = `💰 ₹${latestUserData.balance.toFixed(2)}`;
                    // Optionally update sessionStorage with the latest data
                    sessionStorage.setItem('loggedInUser', JSON.stringify({ ...loggedInUserInfo, balance: latestUserData.balance }));
                })
                .catch(err => console.error("Balance update failed:", err));
        }
    } else {
        // If no user data, redirect to login (except on login/register pages)
        if (!document.body.classList.contains('auth-page')) {
            alert('You are not logged in. Redirecting to login page.');
            window.location.href = 'index.html';
        }
        return; // Stop execution if not logged in
    }

    // --- Populate Sidebar ---
    if (dropdownMenu) {
        dropdownMenu.innerHTML = `
            <a href="profile.html">👤 User Profile</a>
            <a href="withdrawal.html">💸 Withdraw Funds</a>
            <a href="game-history.html">📜 Game History</a>
            <a href="how-to-play.html">❓ How to Play</a>
            <a href="game-rate.html">⭐ Game Rate</a>
            <a href="support.html">🤝 Support & Help</a>
            <a href="change-password.html">🔑 Change Password</a>
            <a href="#" id="logout-btn-sidebar">🔒 Logout</a>
        `;

        // Add logout functionality to the sidebar link
        document.getElementById('logout-btn-sidebar').addEventListener('click', function(event) {
            event.preventDefault();
            sessionStorage.removeItem('loggedInUser');
            alert('You have been logged out successfully.');
            window.location.href = 'index.html';
        });
    }

    // --- Sidebar Toggle Logic ---
    if (menuBtn && overlay && dropdownMenu) {
        menuBtn.addEventListener('click', function() {
            overlay.classList.toggle('show');
            dropdownMenu.classList.toggle('show');
            menuBtn.classList.toggle('open');
        });

        overlay.addEventListener('click', function() {
            overlay.classList.remove('show');
            dropdownMenu.classList.remove('show');
            menuBtn.classList.remove('open');
        });
    }
});