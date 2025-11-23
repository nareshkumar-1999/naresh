
document.addEventListener('DOMContentLoaded', function() {
    // Security check
    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
    if (!loggedInUser || !loggedInUser.isAdmin) {
        alert('Access Denied.');
        window.location.href = 'index.html';
        return;
    }

    const dateFilter = document.getElementById('filter-date');
    const resetBtn = document.getElementById('reset-btn');

    // Set default date to today and render initial data
    const today = new Date().toISOString().split('T')[0];
    dateFilter.value = today;
    renderDashboard(today);
    renderFullTopGamesReport(today);

    // Add event listener for date changes
    dateFilter.addEventListener('change', () => {
        const selectedDate = dateFilter.value;
        renderDashboard(selectedDate);
        renderFullTopGamesReport(selectedDate);
    });

    // Add event listener for reset button
    resetBtn.addEventListener('click', () => {
        dateFilter.value = today;
        renderDashboard(today);
        renderFullTopGamesReport(today);
    });
});

function renderDashboard(selectedDate) {
    // Get all users except the admin
    const users = getUsers().filter(user => !user.isAdmin);
    const totalUsers = users.length;
    const totalBalance = users.reduce((sum, user) => sum + user.balance, 0);

    document.getElementById('total-users-value').textContent = totalUsers;
    document.getElementById('total-balance-value').textContent = `₹${totalBalance.toFixed(2)}`;

    // --- Logic for Selected Date's Stats ---
    const allHistory = getGameHistory();

    // Calculate Today's Total Bids
    const todayBids = allHistory.filter(entry => 
        entry.game && // It's a game bid
        entry.date.startsWith(selectedDate)
    );
    const totalBidAmount = todayBids.reduce((sum, entry) => sum + entry.amount, 0);
    document.getElementById('today-total-bids').textContent = `₹${totalBidAmount.toFixed(2)}`;

    // Calculate Today's Winning Amount
    const todayWins = allHistory.filter(entry =>
        entry.result === 'Win' && entry.winAmount && 
        entry.date.startsWith(selectedDate)
    );
    const totalWinAmount = todayWins.reduce((sum, entry) => sum + (entry.winAmount || 0), 0);
    document.getElementById('today-winning-amount').textContent = `₹${totalWinAmount.toFixed(2)}`;

    // --- Calculate and Display Today's Profit/Loss ---
    const profitLoss = totalBidAmount - totalWinAmount;
    const profitLossElement = document.getElementById('today-profit-loss');
    profitLossElement.textContent = `₹${profitLoss.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (profitLoss >= 0) {
        profitLossElement.classList.add('text-win');
        profitLossElement.classList.remove('text-loss');
    } else {
        profitLossElement.classList.add('text-loss');
        profitLossElement.classList.remove('text-win');
    }
}

function renderFullTopGamesReport(selectedDate) {
    const allHistory = getGameHistory();
    const reportBody = document.getElementById('top-games-report-body');
    const grandTotalElement = document.getElementById('grand-total-amount');
    reportBody.innerHTML = ''; // Clear body

    const dateFilteredHistory = allHistory.filter(entry => entry.date.startsWith(selectedDate));

    // 1. Aggregate bid amounts by game name
    const gameStats = dateFilteredHistory
        .filter(entry => entry.game) // Only consider game bids
        .reduce((acc, bid) => {
            if (!acc[bid.game]) {
                acc[bid.game] = { totalAmount: 0, bidCount: 0 };
            }
            acc[bid.game].totalAmount += bid.amount;
            acc[bid.game].bidCount++;
            return acc;
        }, {});

    // 2. Convert to array and sort by totalAmount
    const sortedGames = Object.entries(gameStats)
        .map(([name, stats]) => ({ name, ...stats }))
        .sort((a, b) => b.totalAmount - a.totalAmount);

    if (sortedGames.length === 0) {
        reportBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No game bids found for this date.</td></tr>';
        grandTotalElement.textContent = '₹0.00';
        return;
    }

    let grandTotal = 0;

    // 3. Render the table
    sortedGames.forEach((game, index) => {
        grandTotal += game.totalAmount;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${game.name}</td>
            <td>${game.bidCount}</td>
            <td class="text-win">₹${game.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        `;
        reportBody.appendChild(row);
    });

    // 4. Display grand total
    grandTotalElement.textContent = `₹${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}