document.addEventListener('DOMContentLoaded', function() {
    // Security Check
    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
    if (!loggedInUser || !loggedInUser.isAdmin) {
        alert('Access Denied.');
        window.location.href = 'index.html';
        return;
    }

    const deletedUserListBody = document.getElementById('deleted-user-list');

    function renderDeletedUsers() {
        deletedUserListBody.innerHTML = '';
        const users = getUsers().filter(u => !u.isActive); // Get only inactive users

        if (users.length === 0) {
            deletedUserListBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No deleted users found.</td></tr>';
            return;
        }

        users.forEach(user => {
            const row = document.createElement('tr');
            row.dataset.userid = user.id;
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.mobile}</td>
                <td>₹${user.balance.toFixed(2)}</td>
                <td>
                    <button class="reactivate-btn">Reactivate</button>
                </td>
            `;
            deletedUserListBody.appendChild(row);
        });
    }

    // Event listener for reactivating users
    deletedUserListBody.addEventListener('click', function(event) {
        if (event.target.classList.contains('reactivate-btn')) {
            const row = event.target.closest('tr');
            const userId = parseInt(row.dataset.userid);

            if (confirm(`Are you sure you want to reactivate user ${userId}?`)) {
                let users = getUsers();
                const userToReactivate = users.find(user => user.id === userId);

                if (userToReactivate) {
                    userToReactivate.isActive = true;
                    saveUsers(users);
                    alert('User has been reactivated successfully!');
                    renderDeletedUsers(); // Refresh the list
                } else {
                    alert('Error: User not found.');
                }
            }
        }
    });

    // Initial render
    renderDeletedUsers();
});