document.addEventListener('DOMContentLoaded', function() {
    // Security check for admin
    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
    if (!loggedInUser || !loggedInUser.isAdmin) {
        alert('Access Denied.');
        window.location.href = 'index.html';
        return;
    }

    const dateDisplay = document.getElementById('current-date');
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateDisplay.textContent = today.toLocaleDateString('en-US', options);

    loadGameResultForms();
});

function loadGameResultForms() {
    const container = document.getElementById('results-list-container');
    container.innerHTML = '';

    // Load games dynamically
    const games = getGames();

    const todayKey = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const allResults = getGameResults();

    games.forEach(game => {
        const gameResult = allResults[game.name]?.[todayKey] || {};

        const card = document.createElement('div');
        card.className = 'result-card';
        card.innerHTML = `
            <h3>${game.name}</h3>
            <form class="result-form" data-game-name="${game.name}">
                <div class="result-inputs">
                    <div class="input-group">
                        <label>Open Patti</label>
                        <input type="text" name="openPatti" placeholder="e.g., 128" value="${gameResult.openPatti || ''}" maxlength="3">
                    </div>
                    <div class="input-group">
                        <label>Close Patti</label>
                        <input type="text" name="closePatti" placeholder="e.g., 489" value="${gameResult.closePatti || ''}" maxlength="3">
                    </div>
                </div>
                <button type="submit">Declare Result</button>
            </form>
        `;
        container.appendChild(card);
    });

    // Add event listeners to all forms
    document.querySelectorAll('.result-form').forEach(form => {
        form.addEventListener('submit', handleResultDeclaration);
    });
}

function handleResultDeclaration(event) {
    event.preventDefault();
    const form = event.target;
    const gameName = form.dataset.gameName;
    const openPatti = form.elements.openPatti.value;
    const closePatti = form.elements.closePatti.value;

    if ((openPatti && openPatti.length !== 3) || (closePatti && closePatti.length !== 3)) {
        alert('Patti must be 3 digits.');
        return;
    }

    // Calculate Ank and Jodi
    const getAnk = (patti) => {
        if (!patti || patti.length !== 3) return '';
        return (patti.split('').reduce((sum, digit) => sum + parseInt(digit), 0) % 10).toString();
    };

    const openAnk = getAnk(openPatti);
    const closeAnk = getAnk(closePatti);
    const jodi = (openAnk && closeAnk) ? `${openAnk}${closeAnk}` : '';

    const todayKey = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const allResults = getGameResults();

    // Ensure game object exists
    if (!allResults[gameName]) {
        allResults[gameName] = {};
    }

    // Save the result
    allResults[gameName][todayKey] = {
        openPatti: openPatti,
        closePatti: closePatti,
        openAnk: openAnk,
        closeAnk: closeAnk,
        jodi: jodi
    };

    saveGameResults(allResults);

    alert(`Result for ${gameName} has been declared successfully!`);

    // Automatically process pending bids for this game
    processBidsForGame(gameName, allResults[gameName][todayKey]);
}

function processBidsForGame(gameName, result) {
    const allHistory = getGameHistory();
    const users = getUsers();
    const todayKey = new Date().toISOString().split('T')[0];
    let updatedBidsCount = 0;

    // Find all pending bids for today's game
    const pendingBidsIndices = allHistory
        .map((entry, index) => ({ entry, index })) // Keep track of original index
        .filter(({ entry }) =>
            entry.game === gameName &&
            entry.result === 'Pending' &&
            entry.date.startsWith(todayKey)
        );

    if (pendingBidsIndices.length === 0) {
        console.log(`No pending bids found for ${gameName} today.`);
        return;
    }

    pendingBidsIndices.forEach(({ entry, index }) => {
        let isWin = false;
        const bidType = entry.type;
        const bidNumber = entry.number;

        // --- Determine if the bid is a win ---
        if (result.openAnk && (bidType === 'single-open' && bidNumber === result.openAnk)) isWin = true;
        if (result.closeAnk && (bidType === 'single-close' && bidNumber === result.closeAnk)) isWin = true;
        if (result.jodi && (bidType === 'jodi' && bidNumber === result.jodi)) isWin = true;
        if (result.openPatti && (bidType.includes('-patti-open') && bidNumber === result.openPatti)) isWin = true;
        if (result.closePatti && (bidType.includes('-patti-close') && bidNumber === result.closePatti)) isWin = true;
        // Note: Sangam logic would be more complex and is not included here.

        // --- Update the bid entry ---
        if (isWin) {
            allHistory[index].result = 'Win';
            updatedBidsCount++;

            // --- Get Winning Amount from Admin ---
            // This will prompt for each winning bid.
            const winAmountStr = prompt(`User ${entry.userId} won on bid ${bidNumber} (${bidType}) for ₹${entry.amount}.\nEnter the winning amount:`);
            const winAmount = parseFloat(winAmountStr);

            if (!isNaN(winAmount) && winAmount > 0) {
                allHistory[index].winAmount = winAmount;

                // --- Update User's Balance ---
                const userIndex = users.findIndex(u => u.id === entry.userId);
                if (userIndex !== -1) {
                    users[userIndex].balance += winAmount;
                }
            } else {
                // If admin cancels or enters invalid amount, mark as win but with 0 win amount.
                allHistory[index].winAmount = 0;
                alert(`Invalid amount entered for bid ${entry.transactionId}. Marked as win with ₹0 amount.`);
            }

        } else {
            // If the result is declared and the bid is not a win, it's a loss.
            // We only mark loss if the relevant part of the result is out (e.g., open patti for open bids)
            const isOpenBid = bidType.includes('-open') || bidType === 'jodi';
            const isCloseBid = bidType.includes('-close');

            if ((isOpenBid && result.openPatti) || (isCloseBid && result.closePatti)) {
                 allHistory[index].result = 'Loss';
                 updatedBidsCount++;
            }
        }
    });

    if (updatedBidsCount > 0) {
        // Save all changes to users and history
        saveUsers(users);
        saveGameHistory(allHistory);
        alert(`${updatedBidsCount} bids for ${gameName} have been automatically processed.`);
    }
}