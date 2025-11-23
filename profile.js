document.addEventListener('DOMContentLoaded', function() {
    const profileForm = document.getElementById('profileForm');
    const nameInput = document.getElementById('name');
    const mobileInput = document.getElementById('mobile');
    const profilePic = document.getElementById('profile-pic');
    const photoUpload = document.getElementById('photo-upload');
    const changePicBtn = document.getElementById('change-pic-btn');
    const accountNumberInput = document.getElementById('accountNumber');
    const ifscCodeInput = document.getElementById('ifscCode');
    const branchNameInput = document.getElementById('branchName');
    const upiIdInput = document.getElementById('upiId');
    const saveButton = document.getElementById('save-button');

    let currentUser = null; // To store the fetched user data

    async function loadUserProfile() {
        // --- Get user info from sessionStorage ---
        const loggedInUserInfo = JSON.parse(sessionStorage.getItem('loggedInUser'));

        if (!loggedInUserInfo) {
            alert('You are not logged in!');
            window.location.href = 'index.html';
            return;
        }

        // Check if an admin is viewing another user's profile
        const urlParams = new URLSearchParams(window.location.search);
        const viewUserId = parseInt(urlParams.get('userId'));
        const isAdminViewing = loggedInUserInfo.isAdmin && viewUserId;

        const targetUserId = isAdminViewing ? viewUserId : loggedInUserInfo.id;

        try {
            const response = await fetch(`${API_BASE_URL}/api/users/${targetUserId}`);
            if (!response.ok) {
                throw new Error('User not found.');
            }
            currentUser = await response.json();

            // Populate the form with current user data
            nameInput.value = currentUser.name;
            mobileInput.value = currentUser.mobile;
            if (currentUser.photo) {
                profilePic.src = currentUser.photo;
            }
            accountNumberInput.value = currentUser.accountNumber || '';
            ifscCodeInput.value = currentUser.ifscCode || '';
            branchNameInput.value = currentUser.branchName || '';
            upiIdInput.value = currentUser.upiId || '';

            // If admin is viewing, disable all fields and hide save button
            if (isAdminViewing) {
                profileForm.querySelectorAll('input').forEach(input => {
                    input.readOnly = true;
                });
                changePicBtn.style.display = 'none'; // Hide change picture button
                saveButton.style.display = 'none'; // Hide save button
                // Update the "Back" link to point to the admin panel
                const backLink = document.querySelector('.register-link a[href="home.html"]');
                if (backLink) {
                    backLink.href = 'admin.html';
                }
            }

        } catch (error) {
            alert(error.message);
            window.location.href = loggedInUserInfo.isAdmin ? 'admin.html' : 'index.html';
        }
    }

    // --- Handle form submission ---
    profileForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        if (!currentUser) {
            alert('User data not loaded. Cannot save.');
            return;
        }

        saveButton.disabled = true;
        saveButton.textContent = 'Saving...';

        const updatedData = {
            name: nameInput.value,
            photo: profilePic.src, // Save the new photo (as base64 data URL)
            accountNumber: accountNumberInput.value,
            ifscCode: ifscCodeInput.value,
            branchName: branchNameInput.value,
            upiId: upiIdInput.value
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/users/profile/${currentUser.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData),
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.msg || 'Failed to update profile.');
            }

            // Also update the name in sessionStorage for immediate feedback on other pages
            const loggedInUserInfo = JSON.parse(sessionStorage.getItem('loggedInUser'));
            if (loggedInUserInfo && loggedInUserInfo.id === currentUser.id) {
                loggedInUserInfo.name = result.user.name;
                sessionStorage.setItem('loggedInUser', JSON.stringify(loggedInUserInfo));
            }

            alert('Profile updated successfully!');
            window.location.href = 'home.html';

        } catch (error) {
            alert(error.message);
        } finally {
            saveButton.disabled = false;
            saveButton.textContent = 'Save Changes';
        }
    });

    // --- Initial Load ---
    loadUserProfile();
});