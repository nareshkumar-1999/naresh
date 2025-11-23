document.addEventListener('DOMContentLoaded', function() {
    const withdrawalForm = document.getElementById('withdrawalForm');
    const amountInput = document.getElementById('amount');
    const currentBalanceSpan = document.getElementById('current-balance');
    const submitButton = withdrawalForm.querySelector('button');

    // --- Get user info from sessionStorage ---
    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
    let currentUserData = null;

    if (!loggedInUser) {
        alert('You are not logged in!');
        window.location.href = 'index.html';
        return;
    }

    // Fetch and display the latest balance from the server
    fetch(`${API_BASE_URL}/api/users/${loggedInUser.id}`)
        .then(res => res.json())
        .then(user => {
            currentUserData = user;
            currentBalanceSpan.textContent = `₹${currentUserData.balance.toFixed(2)}`;
        })
        .catch(err => {
            console.error("Failed to fetch user balance:", err);
            currentBalanceSpan.textContent = `₹${loggedInUser.balance.toFixed(2)}`; // Fallback
        });

    // --- Handle form submission ---
    withdrawalForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const amountToWithdraw = parseFloat(amountInput.value);

        // Client-side validation
        if (isNaN(amountToWithdraw) || amountToWithdraw < 1000) {
            alert('Minimum withdrawal amount is ₹1,000.');
            return;
        }

        if (currentUserData && amountToWithdraw > currentUserData.balance) {
            alert('Withdrawal amount cannot be more than your current balance.');
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';

        try {
            const response = await fetch(`${API_BASE_URL}/api/transactions/withdraw`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: loggedInUser.id,
                    amount: amountToWithdraw
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.msg || 'Failed to submit request.');
            }

            alert(data.msg);
            // Redirect to history page to see the pending request
            window.location.href = 'game-history.html';

        } catch (error) {
            alert(`Error: ${error.message}`);
            submitButton.disabled = false;
            submitButton.textContent = 'Submit Request';
        }
    });
});