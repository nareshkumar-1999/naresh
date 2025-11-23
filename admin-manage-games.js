document.addEventListener('DOMContentLoaded', function() {
    // Security check
    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
    if (!loggedInUser || !loggedInUser.isAdmin) {
        alert('Access Denied.');
        window.location.href = 'index.html';
        return;
    }

    const addGameForm = document.getElementById('add-game-form');
    const gamesListBody = document.getElementById('games-list-body');

    // --- Render Games List ---
    function renderGames() {
        const games = getGames();
        gamesListBody.innerHTML = '';

        games.forEach((game, index) => {
            const row = document.createElement('tr');
            row.dataset.gameId = game.id;

            // Disable up arrow for the first item and down arrow for the last item
            const upDisabled = index === 0 ? 'disabled' : '';
            const downDisabled = index === games.length - 1 ? 'disabled' : '';

            row.innerHTML = `
                <td>${game.name}</td>
                <td>${game.openTime}</td>
                <td>${game.closeTime}</td>
                <td class="actions">
                    <button class="edit-btn">Edit</button>
                    <button class="delete-btn">Delete</button>
                </td>
                <td class="order-actions">
                    <button class="move-up-btn" title="Move Up" ${upDisabled}>⬆️</button>
                    <button class="move-down-btn" title="Move Down" ${downDisabled}>⬇️</button>
                </td>
            `;
            gamesListBody.appendChild(row);
        });
    }

    // --- Format time from 24-hour to 12-hour AM/PM ---
    function formatTo12Hour(time24) {
        let [hours, minutes] = time24.split(':');
        hours = parseInt(hours);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
    }

    // --- Add New Game ---
    addGameForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const name = document.getElementById('new-game-name').value.trim();
        const openTime = document.getElementById('new-open-time').value;
        const closeTime = document.getElementById('new-close-time').value;

        if (!name || !openTime || !closeTime) {
            alert('Please fill all fields.');
            return;
        }

        const games = getGames();
        const newGame = {
            id: Date.now(),
            name: name,
            openTime: formatTo12Hour(openTime),
            closeTime: formatTo12Hour(closeTime)
        };

        games.push(newGame);
        saveGames(games);
        alert('Game added successfully!');
        addGameForm.reset();
        renderGames();
    });

    // --- Handle Edit and Delete ---
    gamesListBody.addEventListener('click', function(event) {
        const target = event.target;
        const row = target.closest('tr');
        if (!row) return; // Exit if click was not on a row
        const gameId = parseInt(row.dataset.gameId);

        // Delete
        if (target.classList.contains('delete-btn')) {
            if (confirm('Are you sure you want to delete this game?')) {
                let games = getGames();
                games = games.filter(g => g.id !== gameId);
                saveGames(games);
                renderGames();
            }
        }

        // Edit
        if (target.classList.contains('edit-btn')) {
            const cells = row.querySelectorAll('td');
            cells[1].innerHTML = `<input type="time" value="${convertTo24Hour(cells[1].textContent)}">`;
            cells[2].innerHTML = `<input type="time" value="${convertTo24Hour(cells[2].textContent)}">`;
            target.textContent = 'Save';
            target.classList.remove('edit-btn');
            target.classList.add('save-btn');
        }
        // Save
        else if (target.classList.contains('save-btn')) {
            const openTimeInput = row.querySelector('td:nth-child(2) input').value;
            const closeTimeInput = row.querySelector('td:nth-child(3) input').value;

            if (!openTimeInput || !closeTimeInput) {
                alert('Time cannot be empty.');
                return;
            }

            let games = getGames();
            const gameIndex = games.findIndex(g => g.id === gameId);
            if (gameIndex > -1) {
                games[gameIndex].openTime = formatTo12Hour(openTimeInput);
                games[gameIndex].closeTime = formatTo12Hour(closeTimeInput);
                saveGames(games);
                alert('Game updated successfully!');
                renderGames();
            }
        }

        // --- Handle Reordering ---
        if (target.classList.contains('move-up-btn') || target.classList.contains('move-down-btn')) {
            let games = getGames();
            const currentIndex = games.findIndex(g => g.id === gameId);

            if (target.classList.contains('move-up-btn') && currentIndex > 0) {
                // Swap with the previous element
                [games[currentIndex], games[currentIndex - 1]] = [games[currentIndex - 1], games[currentIndex]];
            } else if (target.classList.contains('move-down-btn') && currentIndex < games.length - 1) {
                // Swap with the next element
                [games[currentIndex], games[currentIndex + 1]] = [games[currentIndex + 1], games[currentIndex]];
            }

            saveGames(games);
            renderGames();
        }
    });

    // --- Helper to convert 12-hour AM/PM to 24-hour for time input ---
    function convertTo24Hour(time12h) {
        const [time, modifier] = time12h.split(' ');
        let [hours, minutes] = time.split(':');

        if (hours === '12') {
            hours = '00';
        }
        if (modifier === 'PM') {
            hours = parseInt(hours, 10) + 12;
        }
        return `${String(hours).padStart(2, '0')}:${minutes}`;
    }

    // Initial render
    renderGames();
});