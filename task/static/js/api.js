async function apiCreateBoard(name, description) {
    return fetch("/boards", {
        method: "POST",
        headers: {
            "Browser-ID": browserId, // Include Browser ID in headers
        },
        body: JSON.stringify({
            name,
            description,
        }),
    })
        .then((response) => response.json())
        .then((result) => {
            console.log(result);
            if (result.error) {
                showAlert(result.error, "danger");
            } else {
                showAlert(result.message);
            }
            return result;
        });
}

async function apiCreateList(boardId, listName) {
    return fetch(`/boards/${boardId}/lists`, {
        method: "POST",
        headers: {
            "Browser-ID": browserId, // Include Browser ID in headers
        },
        body: JSON.stringify({
            name: listName,
        }),
    })
        .then((response) => response.json())
        .then((result) => {
            console.log(result);
            if (result.error) {
                showAlert(result.error, "danger");
            } else {
                showAlert(result.message);
            }
            return result;
        });
}

async function apiCreateCard(listId, title) {
    return fetch(`/lists/${listId}/cards`, {
        method: "POST",
        headers: {
            "Browser-ID": browserId, // Include Browser ID in headers
        },
        body: JSON.stringify({
            title,
        }),
    })
        .then((response) => response.json())
        .then((result) => {
            console.log(result);
            if (result.error) {
                showAlert(result.error, "danger");
            } else {
                showAlert(result.message);
            }
            return result;
        });
}

async function apiMoveCard(cardId, prevCardId, preCardListId) {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Browser-ID", browserId);

    const body = {};
    if (preCardListId) {
        body.listId = preCardListId;
    }
    if (prevCardId) {
        body.prevCardId = prevCardId;
    }

    const raw = JSON.stringify(body);

    const requestOptions = {
        method: "PUT",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
    };

    return fetch(`/cards/${cardId}/move`, requestOptions)
        .then((response) => response.text())
        .then((result) => {
            console.log(result);
            if (result.error) {
                showAlert(result.error, "danger");
            }
            return result;
        })
        .catch((error) => console.error(error));
}

async function apiMoveList(listId, prevListId) {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Browser-ID", browserId);

    const body = {};
    if (prevListId) {
        body.prevListId = prevListId;
    }

    const raw = JSON.stringify(body);

    const requestOptions = {
        method: "PUT",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
    };

    return fetch(`/lists/${listId}/move`, requestOptions)
        .then((response) => response.text())
        .then((result) => {
            console.log(result);
            if (result.error) {
                showAlert(result.error, "danger");
            }
            return result;
        })
        .catch((error) => console.error(error));
}

async function apiAddMemberToBoard(email) {
    return fetch(`/boards/${boardId}/members`, {
        body: JSON.stringify({
            email,
        }),
        headers: {
            "Browser-ID": browserId, // Include Browser ID in headers
        },
        method: "POST",
    })
        .then((response) => response.json())
        .then((result) => {
            console.log("result", result);
            if (result.error) {
                showAlert(result.error, "danger");
            } else {
                showAlert(result.message);
            }
            return result;
        });
}

async function apiGetRecentNotifications() {
    return fetch("/notifications", {
        headers: {
            "Browser-ID": browserId, // Include Browser ID in headers
        },
        method: "GET",
    })
        .then((response) => response.json())
        .then((result) => {
            console.log("result", result);
            return {
                notifications: result.notifications,
                total_unread_notification: result.total_unread_notification,
            };
        });
}

async function apiReadNotification(notificationId) {
    return fetch(`/notifications/${notificationId}/read`, {
        headers: {
            "Browser-ID": browserId, // Include Browser ID in headers
        },
        method: "POST",
    })
        .then((response) => response.json())
        .then((result) => {
            console.log("result", result);
            return;
        });
}
