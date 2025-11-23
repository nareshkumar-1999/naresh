document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('notifications-container');

    function displayNotifications() {
        const notifications = getNotifications().sort((a, b) => new Date(b.date) - new Date(a.date)); // Newest first
        container.innerHTML = '';

        if (notifications.length === 0) {
            container.innerHTML = '<p>No new notifications.</p>';
            return;
        }

        notifications.forEach(notification => {
            const card = document.createElement('div');
            card.className = 'notice-card';
            card.innerHTML = `
                <h3>${notification.title}</h3>
                <p>${notification.message}</p>
                <small style="color: #777;">${new Date(notification.date).toLocaleString()}</small>
            `;
            container.appendChild(card);
        });
    }

    // Initial call
    displayNotifications();
});