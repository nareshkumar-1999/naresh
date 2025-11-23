let sortState = {
    column: null, // 'balance', 'name', etc.
    direction: 'asc' // 'asc' or 'desc'
};

let paginationState = {
    currentPage: 1,
    usersPerPage: 5 // Show 5 users per page
}

function renderUsers(searchTerm = '') {
    const userListBody = document.getElementById('user-list');
    userListBody.innerHTML = ''; // Clear existing rows

    // --- 1. Get and Filter Data ---
    let users = getUsers().filter(u => u.isActive); // Only show active users

    // Filter users based on search term (case-insensitive)
    if (searchTerm) {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        users = users.filter(user => 
            user.name.toLowerCase().includes(lowerCaseSearchTerm) ||
            user.mobile.includes(lowerCaseSearchTerm)
        );
    }

    // --- 2. Sort Data ---
    if (sortState.column) {
        users.sort((a, b) => {
            const valA = a[sortState.column];
            const valB = b[sortState.column];

            if (valA < valB) {
                return sortState.direction === 'asc' ? -1 : 1;
            }
            if (valA > valB) {
                return sortState.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }

    // --- 3. Paginate Data ---
    const startIndex = (paginationState.currentPage - 1) * paginationState.usersPerPage;
    const endIndex = startIndex + paginationState.usersPerPage;
    const paginatedUsers = users.slice(startIndex, endIndex);

    // --- 4. Render Table Rows ---
    paginatedUsers.forEach(user => {
        if (user.isAdmin) return; // Do not show admin in the user list
        const row = document.createElement('tr');
        row.setAttribute('data-userid', user.id); // Use localStorage ID

        row.innerHTML = `
            <td data-label="User ID">${user.id}</td>
            <td data-label="Name"><a href="profile.html?userId=${user.id}" title="View Profile">${user.name}</a></td>
            <td data-label="Mobile">${user.mobile}</td>
            <td data-label="Password" class="password-cell">
                <span>${user.password}</span>
                <button class="edit-password-btn" title="Edit Password">✏️</button>
            </td>
            <td data-label="Balance" class="balance-cell">₹${user.balance.toFixed(2)}</td>
            <td data-label="Actions" class="actions">
                <button class="edit-btn">Edit</button>
                <a href="admin-user-history.html?userId=${user.id}" class="history-btn">History</a>
                <button class="delete-btn">Delete</button>
            </td>
        `;

        userListBody.appendChild(row);
    });

    // --- 5. Render Pagination Controls ---
    renderPaginationControls(users.length);
}

function renderPaginationControls(totalUsers) {
    const controlsContainer = document.getElementById('pagination-controls');
    const totalPages = Math.ceil(totalUsers / paginationState.usersPerPage);
    controlsContainer.innerHTML = '';

    if (totalPages <= 1) return; // No need for controls if there's only one page

    // Previous Button
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.disabled = paginationState.currentPage === 1;
    prevButton.addEventListener('click', () => {
        paginationState.currentPage--;
        renderUsers(document.getElementById('searchInput').value);
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
        renderUsers(document.getElementById('searchInput').value);
    });

    controlsContainer.appendChild(prevButton);
    controlsContainer.appendChild(pageInfo);
    controlsContainer.appendChild(nextButton);
}

function exportUsersToCSV() {
    const users = getUsers();
    if (users.length === 0) {
        alert('No users to export.');
        return;
    }

    // Define CSV headers
    const headers = ['id', 'name', 'mobile', 'password', 'balance', 'isAdmin'];
    
    // Convert user data to CSV format
    const csvRows = [
        headers.join(','), // Header row
        ...users.map(user => {
            // Escape commas and quotes within fields
            const values = headers.map(header => {
                const escaped = ('' + user[header]).replace(/"/g, '""'); // escape double quotes
                return `"${escaped}"`;
            });
            return values.join(',');
        })
    ];

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

    // Create a link to trigger the download
    const link = document.createElement('a');
    if (link.download !== undefined) { // Feature detection
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'users.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // --- Security Check: Ensure the logged-in user is an admin ---
    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));

    if (!loggedInUser || !loggedInUser.isAdmin) {
        alert('Access Denied. You must be an admin to view this page.');
        window.location.href = 'index.html'; // Redirect non-admins to login page
        return; // Stop further execution
    }

    // --- Add New User Form Logic ---
    const addUserForm = document.getElementById('add-user-form');
    if (addUserForm) {
        addUserForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const name = document.getElementById('new-user-name').value.trim();
            const mobile = document.getElementById('new-user-mobile').value.trim();
            const password = document.getElementById('new-user-password').value.trim();

            if (!name || !mobile || !password) {
                alert('Please fill in all fields.');
                return;
            }

            if (!/^\d{10}$/.test(mobile)) {
                alert('Please enter a valid 10-digit mobile number.');
                return;
            }

            const users = getUsers();

            // Check if mobile number is already registered
            const userExists = users.some(user => user.mobile === mobile);
            if (userExists) {
                alert('This mobile number is already registered.');
                return;
            }

            // Generate a unique 5-digit user ID
            let newId;
            const existingIds = new Set(users.map(u => u.id));
            do {
                newId = Math.floor(10000 + Math.random() * 90000);
            } while (existingIds.has(newId));

            // Create a new user object
            const newUser = {
                id: newId,
                name: name,
                mobile: mobile,
                password: password,
                balance: 0.00,
                isAdmin: false,
                isActive: true, // New users are active by default
                photo: '', accountNumber: '', ifscCode: '', branchName: '', upiId: ''
            };

            users.push(newUser);
            saveUsers(users);
            alert('User created successfully!');
            addUserForm.reset();
            renderUsers(document.getElementById('searchInput').value); // Refresh the user list
        });
    }

    // --- Logout Button Logic for Admin ---
    const logoutBtnAdmin = document.getElementById('logout-btn-admin');
    if (logoutBtnAdmin) {
        logoutBtnAdmin.addEventListener('click', function() {
            // Clear the session data
            sessionStorage.removeItem('loggedInUser');

            alert('You have been logged out successfully.');
            window.location.href = 'index.html'; // Redirect to login page
        });
    }

    // --- Export to CSV Button Logic ---
    const exportBtn = document.getElementById('export-csv-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            exportUsersToCSV();
        });
    }

    const searchInput = document.getElementById('searchInput');

    // Fetch all users initially
    renderUsers();

    // Add event listener for the search input
    searchInput.addEventListener('input', (event) => {
        paginationState.currentPage = 1; // Reset to first page on new search
        renderUsers(event.target.value);
    });

    // --- Add event listener for sorting ---
    document.querySelector('thead').addEventListener('click', (event) => {
        const header = event.target.closest('.sortable');
        if (!header) return;

        const column = header.dataset.sort;
        
        // Toggle direction if the same column is clicked again
        if (sortState.column === column) {
            sortState.direction = sortState.direction === 'asc' ? 'desc' : 'asc';
        } else {
            sortState.column = column;
            sortState.direction = 'asc';
        }

        // Update arrow indicators
        document.querySelectorAll('.sort-arrow').forEach(arrow => arrow.textContent = '');
        const arrowEl = header.querySelector('.sort-arrow');
        if (arrowEl) {
            arrowEl.textContent = sortState.direction === 'asc' ? '▲' : '▼';
        }

        paginationState.currentPage = 1; // Reset to first page on sort
        renderUsers(searchInput.value);
    });

    const userListBody = document.getElementById('user-list');

    // Event listener for clicks on the user list (for Edit and Delete)
    userListBody.addEventListener('click', function(event) {
        const target = event.target;
        const row = target.closest('tr');
        if (!row) return;

        const userId = parseInt(row.getAttribute('data-userid'));

        // --- Handle Delete Button ---
        if (target.classList.contains('delete-btn')) {
            if (confirm(`Are you sure you want to deactivate user ${userId}? This will hide them from the main list.`)) {
                // "Soft delete" the user by setting isActive to false
                let users = getUsers();
                const userToDeactivate = users.find(user => user.id === userId);
                if (userToDeactivate) {
                    userToDeactivate.isActive = false;
                    saveUsers(users);
                }
            }
        }

        // --- Handle Edit/Save Button ---
        if (target.classList.contains('edit-btn')) {
            const balanceCell = row.querySelector('.balance-cell');
            const passwordCell = row.querySelector('.password-cell');
            const currentBalance = parseFloat(balanceCell.textContent.replace('₹', ''));

            // Change button to "Save" and make balance editable
            target.textContent = 'Save';
            target.classList.remove('edit-btn');
            target.classList.add('save-btn');
            balanceCell.innerHTML = `<input type="number" class="balance-input" value="${currentBalance.toFixed(2)}" step="0.01">`;
            
            // Also make password editable when main edit is clicked
            const passwordSpan = passwordCell.querySelector('span');
            if (passwordSpan) {
                const currentPassword = passwordSpan.textContent;
                passwordCell.innerHTML = `<input type="text" class="password-input" value="${currentPassword}">`;
            }

            balanceCell.querySelector('.balance-input').focus();
        }
        // --- Handle specific password edit button ---
        else if (target.classList.contains('edit-password-btn')) {
            const passwordCell = row.querySelector('.password-cell');
            const passwordSpan = passwordCell.querySelector('span');
            const currentPassword = passwordSpan.textContent;

            // Replace span and button with an input field and a save button
            passwordCell.innerHTML = `
                <input type="text" class="password-input" value="${currentPassword}">
                <button class="save-password-btn" title="Save Password">✔️</button>
            `;
            passwordCell.querySelector('.password-input').focus();
        }
        // --- Handle specific password save button ---
        else if (target.classList.contains('save-password-btn')) {
            const passwordCell = row.querySelector('.password-cell');
            const passwordInput = passwordCell.querySelector('.password-input');
            const newPassword = passwordInput.value.trim();

            if (newPassword) {
                let users = getUsers();
                const userToUpdate = users.find(user => user.id === userId);
                if (userToUpdate) {
                    userToUpdate.password = newPassword;
                    saveUsers(users);
                    alert('Password updated successfully!');
                }
                // Revert to display mode
                passwordCell.innerHTML = `
                    <span>${newPassword}</span>
                    <button class="edit-password-btn" title="Edit Password">✏️</button>
                `;
            } else {
                alert('Password cannot be empty.');
                // Re-render the row to restore original state if input is empty
                renderUsers(document.getElementById('searchInput').value);
            }
        }
        // --- Handle Save Button ---
        else if (target.classList.contains('save-btn')) {
            const balanceCell = row.querySelector('.balance-cell');
            const input = balanceCell.querySelector('.balance-input');
            const newBalance = parseFloat(input.value);

            const passwordCell = row.querySelector('.password-cell');
            const passwordInput = passwordCell.querySelector('.password-input');
            const newPassword = passwordInput.value.trim();

            if (!isNaN(newBalance) && newPassword) {
                // Update the balance in the central store
                let users = getUsers();
                const userToUpdate = users.find(user => user.id === userId);
                if (userToUpdate) {
                    const oldBalance = userToUpdate.balance;
                    const difference = newBalance - oldBalance;

                    // Update password and balance
                    userToUpdate.password = newPassword;
                    userToUpdate.balance = newBalance;
                    saveUsers(users);

                    userToUpdate.balance = newBalance;
                    saveUsers(users);

                    // Create a history record for the balance change
                    if (difference !== 0) {
                        const historyEntry = {
                            transactionId: `TXN${Date.now().toString().slice(-7)}`,
                            userId: userId,
                            amount: Math.abs(difference),
                            date: new Date().toISOString(),
                            status: difference > 0 ? 'Admin Credit' : 'Admin Debit'
                        };

                        if (difference > 0) {
                            historyEntry.type = 'Deposit';
                        } else {
                            historyEntry.type = 'Withdrawal';
                        }

                        const allHistory = getGameHistory();
                        allHistory.push(historyEntry);
                        saveGameHistory(allHistory);
                    }
                }


                passwordCell.innerHTML = `
                    <span>${newPassword}</span>
                    <button class="edit-password-btn" title="Edit Password">✏️</button>
                `;
                balanceCell.textContent = `₹${newBalance.toFixed(2)}`;
                target.textContent = 'Edit';
                target.classList.remove('save-btn');
                target.classList.add('edit-btn');
            } else {
                alert('Please enter a valid balance and password.');
            }
        }
    });
});