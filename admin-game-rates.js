document.addEventListener('DOMContentLoaded', function() {
    // Security check for admin
    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
    if (!loggedInUser || !loggedInUser.isAdmin) {
        alert('Access Denied.');
        window.location.href = 'index.html';
        return;
    }

    const ratesContainer = document.getElementById('rates-container');
    const form = document.getElementById('game-rates-form');

    // Load current rates and populate the form
    function loadRates() {
        const currentRates = getGameRates();
        ratesContainer.innerHTML = ''; // Clear previous inputs

        for (const gameType in currentRates) {
            const inputGroup = document.createElement('div');
            inputGroup.className = 'input-group';
            inputGroup.innerHTML = `
                <label for="rate-${gameType.replace(/\s+/g, '')}">${gameType}</label>
                <input type="number" id="rate-${gameType.replace(/\s+/g, '')}" name="${gameType}" value="${currentRates[gameType]}" required>
            `;
            ratesContainer.appendChild(inputGroup);
        }
    }

    // Handle form submission
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const newRates = {};
        const inputs = ratesContainer.querySelectorAll('input');

        inputs.forEach(input => {
            const gameType = input.name;
            const rateValue = parseFloat(input.value);
            if (!isNaN(rateValue)) {
                newRates[gameType] = rateValue;
            }
        });

        saveGameRates(newRates);
        alert('Game rates have been updated successfully!');
        loadRates(); // Reload to confirm changes
    });

    // Initial load
    loadRates();
});