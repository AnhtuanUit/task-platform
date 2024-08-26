document.addEventListener("DOMContentLoaded", function () {
    let chatSocket = null;

    // Function to open the user Websocket connection
    function openNotificationSocket(room = "notification") {
        if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
            console.log("WebSocket is already open.");
            return;
        }

        chatSocket = new WebSocket(
            "wss://" + window.location.host + "/ws/chat/" + room + "/"
        );

        chatSocket.onmessage = function (e) {
            const data = JSON.parse(e.data);
            console.log("data", JSON.stringify(data));

            // Check if is the same browser id
            if (data.browser_id === browserId) {
                return;
            }

            // Handle create a new notification
            if (data.action === "create" && data.resource === "notification") {
                const notification = JSON.parse(data?.data).notification;

                // Add notification
                addNewNotification(notification);
            }

            // Handle read a notification
            if (data.action === "read" && data.resource === "notification") {
                const notification = JSON.parse(data?.data).notification;

                // Read a notification
                readNotification(notification);
            }
        };
    }

    // Open the Websocket for notification
    openNotificationSocket();
});

function addNewNotification(notification) {
    // Update body notification
    const notificationsPlaceholder = document.querySelector(
        "#notificationsPlacholder"
    );

    notificationsPlaceholder.insertBefore(
        renderNotificationElement(notification),
        notificationsPlaceholder.firstChild
    );

    // Current total unread notificatoin
    const unreadNotificatinoElement = document.querySelector(
        "#notification-total-unread"
    );

    const totalUnreadNotification =
        Number(unreadNotificatinoElement.textContent) + 1;
    // Update +1
    unreadNotificatinoElement.textContent = totalUnreadNotification;
    unreadNotificatinoElement.style.display = "block";
}

function readNotification(notification) {
    // Update body notification
    const existNotification = document.querySelector(
        `#notification-id-${notification.id}`
    );
    existNotification.replaceWith(renderNotificationElement(notification));

    // Current total unread notificatoin
    const unreadNotificatinoElement = document.querySelector(
        "#notification-total-unread"
    );
    const totalUnreadNotification =
        Number(unreadNotificatinoElement.textContent) - 1;

    if (totalUnreadNotification >= 0) {
        unreadNotificatinoElement.textContent = totalUnreadNotification;
        if (totalUnreadNotification) {
            unreadNotificatinoElement.style.display = "block";
        } else {
            unreadNotificatinoElement.style.display = "none";
        }
    }
}
