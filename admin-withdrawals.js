document.addEventListener('DOMContentLoaded', function() {
    // Security check for admin
    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
    if (!loggedInUser || !loggedInUser.isAdmin) {
        alert('Access Denied.');
        window.location.href = 'index.html';
        return;
    }

    renderWithdrawalRequests();
});

function renderWithdrawalRequests() {
    const requestsListBody = document.getElementById('withdrawal-requests-list');
    requestsListBody.innerHTML = '';

    const allHistory = getGameHistory();
    const withdrawalRequests = allHistory
        .filter(entry => entry.type === 'WithdrawalRequest')
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (withdrawalRequests.length === 0) {
        requestsListBody.innerHTML = `<tr><td colspan="6" class="text-center">No pending withdrawal requests.</td></tr>`;
        return;
    }

    withdrawalRequests.forEach(request => {
        const row = document.createElement('tr');
        row.dataset.requestId = request.date; // Use date as a unique ID for the request
        row.dataset.userId = request.userId;

        let actionsHtml = '';
        if (request.status === 'Pending') {
            actionsHtml = `
                <button class="win-btn approve-btn">Approve</button>
                <button class="loss-btn reject-btn">Reject</button>
            `;
        } else {
            actionsHtml = `<span>${request.status}</span>`;
        }

        row.innerHTML = `
            <td>${new Date(request.date).toLocaleString()}</td>
            <td>${request.userId}</td>
            <td>${request.userName || 'N/A'}</td>
            <td>₹${request.amount.toFixed(2)}</td>
            <td>${request.status}</td>
            <td class="actions">${actionsHtml}</td>
        `;
        requestsListBody.appendChild(row);
    });

    // Add event listeners
    addEventListenersToActions();
}

function addEventListenersToActions() {
    document.querySelectorAll('.approve-btn, .reject-btn').forEach(button => {
        button.addEventListener('click', handleRequestUpdate);
    });
}

function handleRequestUpdate(event) {
    const row = event.target.closest('tr');
    const requestId = row.dataset.requestId;
    const userId = parseInt(row.dataset.userId);
    const isApproval = event.target.classList.contains('approve-btn');

    const allHistory = getGameHistory();
    const requestIndex = allHistory.findIndex(entry => entry.date === requestId && entry.userId === userId);

    if (requestIndex === -1) {
        alert('Error: Request not found.');
        return;
    }

    const requestEntry = allHistory[requestIndex];

    if (isApproval) {
        // --- Handle Approval ---
        const users = getUsers();
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            alert('Error: User not found.');
            return;
        }

        // Deduct balance
        if (users[userIndex].balance < requestEntry.amount) {
            alert(`Action failed: User's current balance (₹${users[userIndex].balance.toFixed(2)}) is less than the requested amount.`);
            // Optionally, auto-reject the request
            allHistory[requestIndex].status = 'Rejected';
            allHistory[requestIndex].type = 'Withdrawal'; // Move to user's history
        } else {
            users[userIndex].balance -= requestEntry.amount;
            saveUsers(users);

            // Update history entry
            allHistory[requestIndex].status = 'Approved';
            allHistory[requestIndex].type = 'Withdrawal';
            alert('Request approved. User balance has been updated.');
        }

    } else {
        // --- Handle Rejection ---
        allHistory[requestIndex].status = 'Rejected';
        allHistory[requestIndex].type = 'Withdrawal';
        alert('Request has been rejected.');
    }

    saveGameHistory(allHistory);
    renderWithdrawalRequests(); // Re-render the list
}