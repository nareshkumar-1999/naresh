document.addEventListener('DOMContentLoaded', function() {
    // Security check
    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
    if (!loggedInUser || !loggedInUser.isAdmin) {
        alert('Access Denied.');
        window.location.href = 'index.html';
        return;
    }

    createTopGamesChart();
});

function createTopGamesChart() {
    const allHistory = getGameHistory();

    // 1. Aggregate bid amounts by game name
    const gameStats = allHistory
        .filter(entry => entry.game) // Only consider game bids
        .reduce((acc, bid) => {
            if (!acc[bid.game]) {
                acc[bid.game] = { totalAmount: 0, bidCount: 0 };
            }
            acc[bid.game].totalAmount += bid.amount;
            acc[bid.game].bidCount++;
            return acc;
        }, {});

    // 2. Convert to array, sort by totalAmount, and take top 10
    const sortedGames = Object.entries(gameStats)
        .map(([name, stats]) => ({ name, ...stats }))
        .sort((a, b) => b.totalAmount - a.totalAmount)
        .slice(0, 10);

    if (sortedGames.length === 0) {
        const container = document.querySelector('.dashboard-card');
        container.innerHTML = '<h3>Top 10 Games by Total Bid Amount</h3><p>No game bids found yet.</p>';
        return;
    }

    // 3. Prepare data for the chart
    const chartLabels = sortedGames.map(game => game.name);
    const chartData = sortedGames.map(game => game.totalAmount);

    // 4. Render the chart
    const ctx = document.getElementById('topGamesChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar', // You can change this to 'pie' or 'doughnut' for a different look
        data: {
            labels: chartLabels,
            datasets: [{
                label: 'Total Bid Amount (₹)',
                data: chartData,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)', 'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)', 'rgba(255, 159, 64, 0.6)',
                    'rgba(199, 199, 199, 0.6)', 'rgba(83, 102, 255, 0.6)',
                    'rgba(40, 159, 64, 0.6)', 'rgba(210, 99, 132, 0.6)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y', // Makes the bar chart horizontal for better readability of game names
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => '₹' + value.toLocaleString('en-IN')
                    }
                }
            }
        }
    });
}