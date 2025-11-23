let paginationState = {
    currentPage: 1,
    rowsPerPage: 25 // Show more rows on this page
};

document.addEventListener('DOMContentLoaded', function() {
    // Security check for admin
    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
    if (!loggedInUser || !loggedInUser.isAdmin) {
        alert('Access Denied.');
        window.location.href = 'index.html';
        return;
    }

    populateGameFilter();
    renderAllBids();

    // Add event listeners for filters
    document.getElementById('filter-date').addEventListener('change', () => {
        paginationState.currentPage = 1;
        renderAllBids();
    });
    document.getElementById('filter-game').addEventListener('change', () => {
        paginationState.currentPage = 1;
        renderAllBids();
    });
    document.getElementById('reset-btn').addEventListener('click', () => {
        document.getElementById('filter-date').value = '';
        document.getElementById('filter-game').value = '';
        paginationState.currentPage = 1;
        renderAllBids();
    });
});

function populateGameFilter() {
    const gameFilterSelect = document.getElementById('filter-game');
    const games = getGames();
    games.forEach(game => {
        const gameName = game.name;
        const option = document.createElement('option');
        option.value = gameName;
        option.textContent = gameName;
        gameFilterSelect.appendChild(option);
    });
}

function renderAllBids() {
    const filterDate = document.getElementById('filter-date').value;
    const filterGame = document.getElementById('filter-game').value;

    const allBidsListBody = document.getElementById('all-bids-list');
    allBidsListBody.innerHTML = '';

    const allHistory = getGameHistory();
    const allUsers = getUsers();

    // Create a map of user IDs to names for quick lookup
    const userMap = new Map(allUsers.map(user => [user.id, user.name]));

    // Filter for game bids
    let filteredBids = allHistory
        .filter(entry => entry.game)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    // Apply filters
    if (filterDate) {
        filteredBids = filteredBids.filter(bid => bid.date.startsWith(filterDate));
    }
    if (filterGame) {
        filteredBids = filteredBids.filter(bid => bid.game === filterGame);
    }

    const allGameBids = filteredBids;

    if (allGameBids.length === 0) {
        allBidsListBody.innerHTML = `<tr><td colspan="6" class="text-center">No bids found.</td></tr>`;
        return;
    }

    // Paginate data
    const startIndex = (paginationState.currentPage - 1) * paginationState.rowsPerPage;
    const endIndex = startIndex + paginationState.rowsPerPage;
    const paginatedBids = allGameBids.slice(startIndex, endIndex);

    paginatedBids.forEach(bid => {
        const row = document.createElement('tr');
        const userName = userMap.get(bid.userId) || 'Unknown';

        row.innerHTML = `
            <td>${new Date(bid.date).toLocaleString()}</td>
            <td>${userName} (${bid.userId})</td>
            <td>${bid.game}</td>
            <td>${bid.type} (${bid.number})</td>
            <td>₹${bid.amount.toFixed(2)}</td>
            <td class="${bid.result === 'Win' ? 'text-win' : (bid.result === 'Loss' ? 'text-loss' : '')}">${bid.result}</td>
        `;
        allBidsListBody.appendChild(row);
    });

    renderPaginationControls(allGameBids.length);
}

function renderPaginationControls(totalItems) {
    const containerElement = document.getElementById('pagination-controls');
    containerElement.innerHTML = '';
    const totalPages = Math.ceil(totalItems / paginationState.rowsPerPage);

    if (totalPages <= 1) return;

    // Previous Button
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.disabled = paginationState.currentPage === 1;
    prevButton.addEventListener('click', () => {
        paginationState.currentPage--;
        renderAllBids();
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
        renderAllBids();
    });

    containerElement.appendChild(prevButton);
    containerElement.appendChild(pageInfo);
    containerElement.appendChild(nextButton);
}