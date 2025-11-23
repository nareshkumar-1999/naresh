let paginationState = {
    currentPage: 1,
    rowsPerPage: 10
};

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = parseInt(urlParams.get('userId'));

    if (!userId) {
        alert('No user ID provided.');
        window.location.href = 'admin.html';
        return;
    }

    const users = getUsers();
    const user = users.find(u => u.id === userId);

    if (!user) {
        alert('User not found.');
        window.location.href = 'admin.html';
        return;
    }

    // Display user info
    document.getElementById('user-name').textContent = user.name;
    document.getElementById('user-id').textContent = user.id;

    renderUserBidHistory(userId);
});

function renderUserBidHistory(userId) {
    const historyListBody = document.getElementById('user-bid-history-list');
    historyListBody.innerHTML = '';

    const allHistory = getGameHistory();
    // Filter for game bids and sort by date descending (newest first)
    const userBidHistory = allHistory
        .filter(entry => entry.userId === userId && entry.game)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (userBidHistory.length === 0) {
        historyListBody.innerHTML = `<tr><td colspan="7" class="text-center">No bid history found for this user.</td></tr>`;
        return;
    }

    // Paginate data
    const startIndex = (paginationState.currentPage - 1) * paginationState.rowsPerPage;
    const endIndex = startIndex + paginationState.rowsPerPage;
    const paginatedHistory = userBidHistory.slice(startIndex, endIndex);

    paginatedHistory.forEach(entry => {
        const row = document.createElement('tr');
        row.dataset.transactionId = entry.transactionId;

        // Format date for better readability
        const formattedDate = new Date(entry.date).toLocaleString();

        let actionsHtml = '';
        if (entry.result === 'Pending') {
            actionsHtml = `
                <button class="win-btn">Mark Win</button>
                <button class="loss-btn">Mark Loss</button>
            `;
        } else {
            actionsHtml = 'Completed';
        }

        row.innerHTML = `
            <td>${formattedDate}</td>
            <td>${entry.transactionId}</td>
            <td>${entry.game}</td>
            <td>${entry.type} (${entry.number})</td>
            <td>₹${entry.amount.toFixed(2)}</td>
            <td class="result-cell ${entry.result === 'Win' ? 'text-win' : entry.result === 'Loss' ? 'text-loss' : ''}">${entry.result}</td>
            <td class="actions">${actionsHtml}</td>
        `;
        historyListBody.appendChild(row);
    });

    // Add event listeners for the new buttons
    addEventListenersToActions();

    const paginationContainer = document.getElementById('pagination-controls');
    renderPaginationControls(paginationContainer, userBidHistory.length, userId);
}

function addEventListenersToActions() {
    document.querySelectorAll('.win-btn, .loss-btn').forEach(button => {
        button.addEventListener('click', handleResultUpdate);
    });
}

function handleResultUpdate(event) {
    const transactionId = event.target.closest('tr').dataset.transactionId;
    const newResult = event.target.classList.contains('win-btn') ? 'Win' : 'Loss';

    const allHistory = getGameHistory();
    const historyIndex = allHistory.findIndex(entry => entry.transactionId === transactionId);

    if (historyIndex === -1) {
        alert('Error: Bid not found.');
        return;
    }

    const bidEntry = allHistory[historyIndex];

    // Update history
    allHistory[historyIndex].result = newResult;

    // If 'Win', update user balance
    if (newResult === 'Win') {
        const winAmountStr = prompt("Enter the winning amount for this bid:", "");
        const winAmount = parseFloat(winAmountStr);

        if (isNaN(winAmount) || winAmount <= 0) {
            alert('Invalid winning amount. Please enter a valid number.');
            return; // Stop if the admin cancels or enters invalid amount
        }

        // Add winning amount to the history entry
        allHistory[historyIndex].winAmount = winAmount;

        const users = getUsers();
        const userIndex = users.findIndex(u => u.id === bidEntry.userId);
        if (userIndex !== -1) {
            users[userIndex].balance += winAmount;
            saveUsers(users);

            // If the admin is updating their own history, update sessionStorage
            const loggedInAdmin = JSON.parse(sessionStorage.getItem('loggedInUser'));
            if (loggedInAdmin && loggedInAdmin.id === bidEntry.userId) {
                loggedInAdmin.balance = users[userIndex].balance;
                sessionStorage.setItem('loggedInUser', JSON.stringify(loggedInAdmin));
            }
            alert(`Marked as Win. ₹${winAmount.toFixed(2)} has been added to the user's balance.`);
        }
    } else {
        alert('Marked as Loss.');
    }

    saveGameHistory(allHistory);

    // Re-render the history for the user
    renderUserBidHistory(bidEntry.userId);
}

function renderPaginationControls(containerElement, totalItems, userId) {
    containerElement.innerHTML = '';
    const totalPages = Math.ceil(totalItems / paginationState.rowsPerPage);

    if (totalPages <= 1) return;

    // Previous Button
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.disabled = paginationState.currentPage === 1;
    prevButton.addEventListener('click', () => {
        paginationState.currentPage--;
        renderUserBidHistory(userId);
    });

    // Page Info
    const pageInfo = document.createElement('span');
    pageInfo.className = 'page-info';
    pageInfo.textContent = `Page ${paginationState.currentPage} of ${totalPages}`;

    // Next Button
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.disabled = paginationState.currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        paginationState.currentPage++;
        renderUserBidHistory(userId);
    });

    containerElement.appendChild(prevButton);
    containerElement.appendChild(pageInfo);
    containerElement.appendChild(nextButton);
}