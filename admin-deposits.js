document.addEventListener('DOMContentLoaded', function() {
    // Security check for admin
    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
    if (!loggedInUser || !loggedInUser.isAdmin) {
        alert('Access Denied.');
        window.location.href = 'index.html';
        return;
    }

    renderDepositRequests();
});

async function renderDepositRequests() {
    const requestsListBody = document.getElementById('deposit-requests-list');
    requestsListBody.innerHTML = '<tr><td colspan="7" class="text-center">Loading...</td></tr>';

    try {
        const response = await fetch(`${API_BASE_URL}/api/transactions/deposits`);
        const requests = await response.json();

        if (!response.ok) {
            throw new Error(requests.msg || 'Failed to fetch requests.');
        }

        requestsListBody.innerHTML = '';

        if (requests.length === 0) {
            requestsListBody.innerHTML = `<tr><td colspan="7" class="text-center">No pending deposit requests.</td></tr>`;
            return;
        }

        requests.forEach(request => {
            const row = document.createElement('tr');
            row.dataset.requestId = request.transactionId; // Use transactionId as unique ID

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
                <td>${request.transactionId}</td>
                <td>${request.status}</td>
                <td class="actions">${actionsHtml}</td>
            `;
            requestsListBody.appendChild(row);
        });

        // Add event listeners to the new buttons
        addEventListenersToActions();

    } catch (error) {
        requestsListBody.innerHTML = `<tr><td colspan="7" class="text-center">Error: ${error.message}</td></tr>`;
    }
}

function addEventListenersToActions() {
    document.querySelectorAll('.approve-btn, .reject-btn').forEach(button => {
        button.addEventListener('click', async function(event) {
            const row = event.target.closest('tr');
            const requestId = row.dataset.requestId;
            const action = event.target.classList.contains('approve-btn') ? 'approve' : 'reject';

            if (!confirm(`Are you sure you want to ${action} this request?`)) return;

            try {
                const response = await fetch(`${API_BASE_URL}/api/transactions/deposits/${requestId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: action }),
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.msg);
                alert(result.msg);
                renderDepositRequests(); // Refresh the list
            } catch (error) {
                alert(`Error: ${error.message}`);
            }
        });
    });
}