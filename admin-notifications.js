document.addEventListener('DOMContentLoaded', function() {
    // Security check
    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
    if (!loggedInUser || !loggedInUser.isAdmin) {
        alert('Access Denied.');
        window.location.href = 'index.html';
        return;
    }

    const notificationForm = document.getElementById('notification-form');
    const notificationsListBody = document.getElementById('notifications-list-body');

    // --- Render Notifications List ---
    function renderNotifications() {
        const notifications = getNotifications().sort((a, b) => new Date(b.date) - new Date(a.date)); // Newest first
        notificationsListBody.innerHTML = '';

        notifications.forEach(notification => {
            const row = document.createElement('tr');
            row.dataset.notificationId = notification.id;
            row.innerHTML = `
                <td>${new Date(notification.date).toLocaleDateString()}</td>
                <td>${notification.title}</td>
                <td>${notification.message}</td>
                <td class="actions">
                    <button class="delete-btn">Delete</button>
                </td>
            `;
            notificationsListBody.appendChild(row);
        });
    }

    // --- Send New Notification ---
    notificationForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const title = document.getElementById('notification-title').value.trim();
        const message = document.getElementById('notification-message').value.trim();

        if (!title || !message) {
            alert('Please fill all fields.');
            return;
        }

        const notifications = getNotifications();
        const newNotification = {
            id: Date.now(),
            title: title,
            message: message,
            date: new Date().toISOString()
        };

        notifications.push(newNotification);
        saveNotifications(notifications);
        alert('Notification sent successfully!');
        notificationForm.reset();
        renderNotifications();
    });

    // --- Handle Delete ---
    notificationsListBody.addEventListener('click', function(event) {
        const target = event.target;
        if (target.classList.contains('delete-btn')) {
            const row = target.closest('tr');
            const notificationId = parseInt(row.dataset.notificationId);

            if (confirm('Are you sure you want to delete this notification?')) {
                let notifications = getNotifications();
                notifications = notifications.filter(n => n.id !== notificationId);
                saveNotifications(notifications);
                renderNotifications();
            }
        }
    });

    // Initial render
    renderNotifications();
});