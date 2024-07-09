async function apiCreateBoard(name, description) {
    return fetch("/boards", {
        method: "POST",
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

async function apiCreateCard(listId, description) {
    return fetch(`/lists/${listId}/cards`, {
        method: "POST",
        body: JSON.stringify({
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

async function apiMoveCard(cardId, prevCardId, preCardListId) {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

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
            } else {
                showAlert(result.message);
            }
            return result;
        })
        .catch((error) => console.error(error));
}

async function apiMoveList(listId, prevListId) {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

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
            } else {
                showAlert(result.message);
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
