document.addEventListener('DOMContentLoaded', function() {
    // Security check
    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
    if (!loggedInUser || !loggedInUser.isAdmin) {
        alert('Access Denied.');
        window.location.href = 'index.html';
        return;
    }

    createAnalyticsChart();
});

function createAnalyticsChart() {
    const allHistory = getGameHistory();
    const last7DaysData = {
        labels: [],
        bids: [],
        winnings: []
    };

    // 1. Generate labels for the last 7 days
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateKey = d.toISOString().split('T')[0]; // YYYY-MM-DD
        last7DaysData.labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

        // 2. Filter history for this specific day
        const dayHistory = allHistory.filter(entry => entry.date.startsWith(dateKey));

        // 3. Calculate total bids for the day
        const totalBids = dayHistory
            .filter(entry => entry.game) // Only game bids
            .reduce((sum, entry) => sum + entry.amount, 0);
        last7DaysData.bids.push(totalBids);

        // 4. Calculate total winnings for the day
        const totalWinnings = dayHistory
            .filter(entry => entry.result === 'Win' && entry.winAmount)
            .reduce((sum, entry) => sum + entry.winAmount, 0);
        last7DaysData.winnings.push(totalWinnings);
    }

    // 5. Render the chart
    const ctx = document.getElementById('analyticsChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar', // You can change this to 'line' for a line graph
        data: {
            labels: last7DaysData.labels,
            datasets: [
                {
                    label: 'Total Bid Amount (₹)',
                    data: last7DaysData.bids,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)', // Blue
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Total Winning Amount (₹)',
                    data: last7DaysData.winnings,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)', // Green
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        // Format y-axis labels as currency
                        callback: function(value) {
                            return '₹' + value.toLocaleString('en-IN');
                        }
                    }
                }
            }
        }
    });
}