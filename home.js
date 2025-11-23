document.addEventListener('DOMContentLoaded', function() {
    const welcomeMessage = document.getElementById('welcome-message');
    const dateDisplay = document.getElementById('current-date');

    // --- Load User Data ---
    const loggedInUserInfo = JSON.parse(sessionStorage.getItem('loggedInUser'));

    if (loggedInUserInfo && loggedInUserInfo.name) {
        // Update welcome message
        welcomeMessage.innerText = `Welcome, ${loggedInUserInfo.name}!`;
    } else {
        // If no user data, redirect to login
        alert('You are not logged in. Redirecting to login page.');
        window.location.href = 'index.html';
    }

    // --- Display Current Date and Day ---
    if (dateDisplay) {
        const today = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateDisplay.textContent = today.toLocaleDateString('en-US', options);
    }

    // --- Dynamically Load Games ---
    function loadGames() {
        const gamesList = document.getElementById('games-list');
        if (!gamesList) return;

        const games = getGames();
        gamesList.innerHTML = ''; // Clear any existing content

        games.forEach(game => {
            const timeString = `Open: ${game.openTime} - Close: ${game.closeTime}`;
            const gameUrl = `game-play.html?game=${encodeURIComponent(game.name)}&time=${encodeURIComponent(timeString)}`;

            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <span class="game-name">${game.name} <span class="live-indicator">Live</span></span>
                <span class="game-result">***-**-***</span>
                <span class="game-status" data-time="${timeString}">Loading...</span>
                <a href="${gameUrl}" class="play-btn">Play</a>
            `;
            gamesList.appendChild(listItem);
        });
    }

    // --- Display Game Results ---
    function displayGameResults() {
        const todayKey = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const allResults = getGameResults();
        const gameListItems = document.querySelectorAll('.games-list li');

        gameListItems.forEach(item => {
            const gameNameElement = item.querySelector('.game-name');
            if (!gameNameElement) return;

            const gameName = gameNameElement.innerText.replace(/Live/g, '').trim();
            const resultElement = item.querySelector('.game-result');

            const gameResult = allResults[gameName]?.[todayKey];

            if (gameResult && gameResult.openPatti && gameResult.closePatti) {
                // Display full result if both pattis are available
                resultElement.textContent = `${gameResult.openPatti}-${gameResult.jodi}-${gameResult.closePatti}`;
            } else if (gameResult && gameResult.openPatti) {
                // Display only open result if available
                resultElement.textContent = `${gameResult.openPatti}-${gameResult.openAnk}*`;
            }
        });
    }

    // --- Live Game Timer Logic ---
    function parseTime(timeStr) {
        const [time, period] = timeStr.trim().split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (period.toUpperCase() === 'PM' && hours !== 12) {
            hours += 12;
        }
        if (period.toUpperCase() === 'AM' && hours === 12) {
            hours = 0;
        }
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date;
    }

    function formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }

    function updateGameTimers() {
        const gameListItems = document.querySelectorAll('.games-list li');
        const now = new Date();

        gameListItems.forEach(item => {
            const statusElement = item.querySelector('.game-status');
            const playButton = item.querySelector('.play-btn');
            const timeString = statusElement.dataset.time;

            const timeMatch = timeString.match(/Open: (.*?) - Close: (.*)/);
            if (!timeMatch) return;

            const openTime = parseTime(timeMatch[1]);
            const closeTime = parseTime(timeMatch[2]);

            if (now < openTime) {
                // Before Open
                const diff = openTime - now;
                statusElement.innerHTML = `Starts in: <span class="game-timer">${formatTime(diff)}</span>`;
                playButton.classList.remove('disabled');
            } else if (now >= openTime && now < closeTime) {
                // Between Open and Close
                const diff = closeTime - now;
                statusElement.innerHTML = `Closes in: <span class="game-timer">${formatTime(diff)}</span>`;
                playButton.classList.remove('disabled');
            } else {
                // After Close
                statusElement.textContent = 'Market Closed';
                statusElement.classList.add('closed');
                playButton.classList.add('disabled');
                playButton.href = 'javascript:void(0)'; // Disable link
            }
        });
    }

    // Initial calls
    loadGames(); // Load games first
    displayGameResults();
    updateGameTimers();

    // Update timers every second
    setInterval(updateGameTimers, 1000);
});