document.addEventListener('DOMContentLoaded', function() {
    const ratesBody = document.getElementById('game-rates-body');

    function displayGameRates() {
        const gameTypeEmojis = {
            'Single Digit': '🎯',
            'Jodi Digit': '💑',
            'Single Pana': '🃏',
            'Double Pana': '🎴',
            'Triple Pana': '👑',
            'Half Sangam': '🌗',
            'Full Sangam': '🌕'
        };

        const rates = getGameRates();
        ratesBody.innerHTML = ''; // Clear existing content

        for (const gameType in rates) {
            const row = document.createElement('tr');
            const emoji = gameTypeEmojis[gameType] || '⭐'; // Default emoji if not found
            row.innerHTML = `
                <td>${emoji} ${gameType}</td>
                <td>₹${rates[gameType].toLocaleString('en-IN')}</td>
            `;
            ratesBody.appendChild(row);
        }
    }

    // Initial call to display rates
    displayGameRates();
});