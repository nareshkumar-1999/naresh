let paginationStates = {
    bid: { currentPage: 1, rowsPerPage: 10 },
    winning: { currentPage: 1, rowsPerPage: 10 },
    deposit: { currentPage: 1, rowsPerPage: 10 },
    withdrawal: { currentPage: 1, rowsPerPage: 10 }
};

document.addEventListener('DOMContentLoaded', function() {
    // --- Security Check: Ensure a user is logged in ---
    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
    if (!loggedInUser) {
        alert('You must be logged in to view this page.');
        window.location.href = 'index.html';
        return;
    }

    // --- Tab Switching Logic ---
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');

    tabLinks.forEach(link => {
        link.addEventListener('click', () => {
            // Remove active class from all links and content
            tabLinks.forEach(l => l.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active class to the clicked link and corresponding content
            link.classList.add('active');
            document.getElementById(link.dataset.tab).classList.add('active');

            // Reset other tabs' pagination to page 1 to avoid confusion
            Object.keys(paginationStates).forEach(key => {
                if (key !== link.dataset.tab.replace('-history', '')) paginationStates[key].currentPage = 1;
            });
        });
    });

    // --- Load Data into Tabs ---
    loadBidHistory();
    loadWinningHistory();
    loadDepositHistory();
    loadWithdrawalHistory();
});

function loadBidHistory() {
    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
    const bidHistoryListBody = document.getElementById('bid-history-list');
    bidHistoryListBody.innerHTML = '';

    const allHistory = getGameHistory();
    // Filter for game bids and sort by date descending (newest first)
    const userHistory = allHistory
        .filter(entry => entry.userId === loggedInUser.id && entry.game)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (userHistory.length === 0) {
        bidHistoryListBody.innerHTML = `<tr><td colspan="6" class="text-center">No bid history found.</td></tr>`;
        return;
    }

    // Paginate data
    const state = paginationStates.bid;
    const startIndex = (state.currentPage - 1) * state.rowsPerPage;
    const endIndex = startIndex + state.rowsPerPage;
    const paginatedHistory = userHistory.slice(startIndex, endIndex);


    paginatedHistory.forEach(entry => {
        const row = document.createElement('tr');
        const gameDate = new Date(entry.date).toLocaleString();
        row.innerHTML = `
            <td>${gameDate}</td>
            <td>${entry.transactionId || 'N/A'}</td>
            <td>${entry.game}</td>
            <td>${entry.type} (${entry.number})</td>
            <td class="${entry.result === 'Win' ? 'text-win' : (entry.result === 'Loss' ? 'text-loss' : '')}">${entry.result}</td>
            <td>₹${entry.amount.toFixed(2)}</td>
        `;
        bidHistoryListBody.appendChild(row);
    });

    const paginationContainer = document.getElementById('bid-history-pagination');
    renderPaginationControls(paginationContainer, userHistory.length, state, loadBidHistory);
}

function loadWinningHistory() {
    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
    const winningHistoryListBody = document.getElementById('winning-history-list');
    winningHistoryListBody.innerHTML = '';

    const allHistory = getGameHistory();
    // Filter for the current user's wins and sort by date descending
    const winningHistory = allHistory
        .filter(entry => entry.userId === loggedInUser.id && entry.result === 'Win' && entry.game)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (winningHistory.length === 0) {
        winningHistoryListBody.innerHTML = `<tr><td colspan="6" class="text-center">No winning history found.</td></tr>`;
        return;
    }

    // Paginate data
    const state = paginationStates.winning;
    const startIndex = (state.currentPage - 1) * state.rowsPerPage;
    const endIndex = startIndex + state.rowsPerPage;
    const paginatedHistory = winningHistory.slice(startIndex, endIndex);

    paginatedHistory.forEach(entry => {
        const row = document.createElement('tr');
        const gameDate = new Date(entry.date).toLocaleString();
        row.innerHTML = `
            <td>${gameDate}</td>
            <td>${entry.transactionId || 'N/A'}</td>
            <td>${entry.game}</td>
            <td>${entry.type}</td>
            <td><strong>${entry.number}</strong></td>
            <td class="text-win"><strong>₹${(entry.winAmount || entry.amount).toFixed(2)}</strong></td>
        `;
        winningHistoryListBody.appendChild(row);
    });

    const paginationContainer = document.getElementById('winning-history-pagination');
    renderPaginationControls(paginationContainer, winningHistory.length, state, loadWinningHistory);
}

function loadDepositHistory() {
    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
    const depositHistoryContent = document.getElementById('deposit-history');
    // Clear previous content but preserve the pagination container
    while (depositHistoryContent.firstChild && !depositHistoryContent.firstChild.classList?.contains('pagination-container')) {
        depositHistoryContent.removeChild(depositHistoryContent.firstChild);
    }

    const allHistory = getGameHistory();
    const depositHistory = allHistory
        .filter(entry => entry.userId === loggedInUser.id && entry.type === 'Deposit')
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (depositHistory.length === 0) {
        const noHistoryMessage = document.createElement('p');
        noHistoryMessage.className = 'text-center';
        noHistoryMessage.textContent = 'No deposit history found.';
        depositHistoryContent.prepend(noHistoryMessage);
        return;
    }

    // Create table structure
    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Date</th>
                <th>Transaction ID</th>
                <th>Amount</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    const tbody = table.querySelector('tbody');

    // Paginate data
    const state = paginationStates.deposit;
    const startIndex = (state.currentPage - 1) * state.rowsPerPage;
    const endIndex = startIndex + state.rowsPerPage;
    const paginatedHistory = depositHistory.slice(startIndex, endIndex);

    paginatedHistory.forEach(entry => {
        const row = document.createElement('tr');
        const transactionDate = new Date(entry.date).toLocaleString();
        row.innerHTML = `
            <td>${transactionDate}</td>
            <td>${entry.transactionId || 'N/A'}</td>
            <td class="text-win">₹${entry.amount.toFixed(2)}</td>
            <td>${entry.status}</td>
        `;
        tbody.appendChild(row);
    });

    // Prepend the table so it appears before the pagination controls
    depositHistoryContent.prepend(table);

    const paginationContainer = depositHistoryContent.querySelector('.pagination-container');
    renderPaginationControls(paginationContainer, depositHistory.length, state, loadDepositHistory);
}

function loadWithdrawalHistory() {
    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
    const withdrawalHistoryContent = document.getElementById('withdrawal-history');
    // Clear previous content but preserve the pagination container
    while (withdrawalHistoryContent.firstChild && !withdrawalHistoryContent.firstChild.classList?.contains('pagination-container')) {
        withdrawalHistoryContent.removeChild(withdrawalHistoryContent.firstChild);
    }

    const allHistory = getGameHistory();
    const withdrawalHistory = allHistory
        .filter(entry => entry.userId === loggedInUser.id && (entry.type === 'Withdrawal' || entry.type === 'WithdrawalRequest'))
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (withdrawalHistory.length === 0) {
        const noHistoryMessage = document.createElement('p');
        noHistoryMessage.className = 'text-center';
        noHistoryMessage.textContent = 'No withdrawal history found.';
        withdrawalHistoryContent.prepend(noHistoryMessage);
        return;
    }

    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Date</th>
                <th>Transaction ID</th>
                <th>Amount</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    const tbody = table.querySelector('tbody');

    // Paginate data
    const state = paginationStates.withdrawal;
    const startIndex = (state.currentPage - 1) * state.rowsPerPage;
    const endIndex = startIndex + state.rowsPerPage;
    const paginatedHistory = withdrawalHistory.slice(startIndex, endIndex);

    paginatedHistory.forEach(entry => {
        const row = document.createElement('tr');
        const transactionDate = new Date(entry.date).toLocaleString();
        row.innerHTML = `
            <td>${transactionDate}</td>
            <td>${entry.transactionId || 'N/A'}</td>
            <td class="text-loss">₹${entry.amount.toFixed(2)}</td>
            <td>${entry.status}</td>
        `;
        tbody.appendChild(row);
    });

    // Get the pagination container from inside the main content div
    const paginationContainer = withdrawalHistoryContent.querySelector('.pagination-container');
    // Prepend the table so pagination controls appear after it
    withdrawalHistoryContent.prepend(table);

    renderPaginationControls(paginationContainer, withdrawalHistory.length, state, loadWithdrawalHistory);
}

function renderPaginationControls(containerElement, totalItems, paginationState, renderFunction) {
    containerElement.innerHTML = '';
    const totalPages = Math.ceil(totalItems / paginationState.rowsPerPage);

    if (totalPages <= 1) return;

    // Previous Button
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.disabled = paginationState.currentPage === 1;
    prevButton.addEventListener('click', () => {
        paginationState.currentPage--;
        renderFunction();
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
        renderFunction();
    });

    containerElement.appendChild(prevButton);
    containerElement.appendChild(pageInfo);
    containerElement.appendChild(nextButton);
}