document.addEventListener("DOMContentLoaded", function () {
    let chatSocket = null;

    // Function to open the WebSocket connection
    function openBoardSocket(board_id) {
        if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
            console.log("WebSocket is already open.");
            return;
        }

        chatSocket = new WebSocket(
            "ws://" + window.location.host + "/ws/chat/" + board_id + "/"
        );

        chatSocket.onmessage = function (e) {
            const data = JSON.parse(e.data);
            console.log("data", data);

            // Handle create list
            if (data.action === "create" && data.resource === "list") {
                const list = JSON.parse(data?.data).list;

                // Add list to board
                addNewListToBoard(list);
            }

            // Handle edit list
            if (data.action === "edit" && data.resource === "list") {
                const list = JSON.parse(data?.data).list;

                // Edit list to board
                editListToBoard(list);
            }

            // Handle delete list
            if (data.action === "delete" && data.resource === "list") {
                const listId = JSON.parse(data?.data)?.id;

                // Delete list to board
                deleteList(listId);
            }

            // Handle create card
            if (data.action === "create" && data.resource === "card") {
                const card = JSON.parse(data?.data).card;

                // Add list
                addNewCardToList(card);
            }

            // Handle edit card
            if (data.action === "edit" && data.resource === "card") {
                const card = JSON.parse(data?.data).card;

                const currentPath = window.location.pathname;

                if (currentPath.includes("boards")) {
                    // Edit card list
                    editCardToList(card);
                }

                if (currentPath.includes("cards")) {
                    // Edit card detail
                    editCardDetail(card);
                }
            }

            // Handle edit card title
            if (data.action === "edit" && data.resource === "card_title") {
                const card = JSON.parse(data?.data).card;

                const currentPath = window.location.pathname;

                if (currentPath.includes("boards")) {
                    // Edit card list
                    editCardToList(card);
                }
            }

            // Handle delete card
            if (data.action === "delete" && data.resource === "card") {
                const cardId = JSON.parse(data?.data)?.id;

                // Delete card
                deleteCard(cardId);
            }

            // Handle move list
            if (data.action === "move" && data.resource === "list") {
                const list = JSON.parse(data?.data)?.list;

                // Move list
                moveList(list);
            }

            // Handle move card
            if (data.action === "move" && data.resource === "card") {
                const card = JSON.parse(data?.data).card;

                // Move card
                moveCard(card);
            }
        };

        chatSocket.onclose = function (e) {
            console.error(e);
            console.error("Chat socket closed unexpectedly");
        };
    }

    // Function to close the WebSocket connection
    function closeBoardSocket() {
        if (chatSocket.readyState === WebSocket.OPEN) {
            chatSocket.close();
            console.log("WebSocket connection closed.");
        }
    }

    const boardId = document.querySelector("#board-title")?.dataset.boardId;
    const cardBoardId = document.querySelector("#card-title")?.dataset.boardId;

    // Open the WebSocket connection
    openBoardSocket(boardId || cardBoardId);
});

function renderListElement(list) {
    const newListHtml = `
        <div class="col px-1" style="flex: 0 0 20%;">
            <div class="card bg-dark task-list" draggable="true" id="list-id-${list.id}" data-list-id="${list.id}" data-list-position="${list.position}">
                <div class="card-header text-white">
                    <div style="display: flex;justify-content: space-between;">
                        <span>${list.name}</span>
                        
                        <div class="dropdown">
                            <button style="background: transparent; border: 0;" data-bs-toggle="dropdown" aria-expanded="false">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="white"><path d="M20 14a2 2 0 1 1-.001-3.999A2 2 0 0 1 20 14ZM6 12a2 2 0 1 1-3.999.001A2 2 0 0 1 6 12Zm8 0a2 2 0 1 1-3.999.001A2 2 0 0 1 14 12Z"></path></svg>
                            </button>
                            <ul class="dropdown-menu">
                            <li><a class="dropdown-item" href="/edit_list/${list.id}">Edit</a></li>
                            <li>
                                <button type="button" class="dropdown-item" data-bs-toggle="modal" data-bs-target="#confirmListDeletionModal">
                                    Delete
                                </button>
                            </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="card-body" style="display:flex; flex-direction: column; max-height: 550px !important; overflow-y: auto;" data-list-id="${list.id}">
                    <div class="task-card" style="width: 100%; min-height: 20px; flex: 1;"></div>
                </div>
                <div class="card-footer text-body-secondary">
                    <a href="/lists/${list.id}/add_card">Add a card</a>
                </div>
            </div>
        </div>
    `;

    // Create a temporary container to hold the new HTML
    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = newListHtml;

    // Select the new element from the temporary container
    const newElement = tempContainer.firstElementChild;

    // TODO: add dragenter feature for it
    // TODO: add csrfmiddlewaretoken to form
    return newElement;
}

function addNewListToBoard(list) {
    // The add list button
    const referenceElement = document.querySelector(
        ".task-lists > div.col:last-of-type"
    );

    // Render new list element
    const newElement = renderListElement(list);

    // Insert new element
    const newListContainer = referenceElement.closest(".task-lists");
    newListContainer.insertBefore(newElement, referenceElement);
}

function editListToBoard(list) {
    // Find list element by list id
    const oldElement = document
        .querySelector(`#list-id-${list.id}`)
        .closest(".col");

    // Render new list element
    const newElement = renderListElement(list);

    // Replace new list element
    oldElement.replaceWith(newElement);
}

function deleteList(listId) {
    // Find list element by list id
    const listElement = document
        .querySelector(`#list-id-${listId}`)
        .closest(".col");
    // Remove the list element
    listElement.remove();
}

function renderNewCardElement(card) {
    const newCardHtml = `
       <div class="task-card card bg-info my-2" data-card-id="${card.id}" data-list-id="${card.list}" id="card-id-${card.id}" draggable="true" data-card-position="${card.position}">
            <div class="card-body" style="display: flex; justify-content: space-between;">
                <a href="/cards/${card.id}">
                    <span>${card.title}</span>
                </a>
                <a href="/edit_card_title/${card.id}"><i class="bi bi-pencil"></i></a>
            </div>
        </div>
    `;

    // Create a temporary container to hold the new HTML
    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = newCardHtml;

    // Select the new element from the temporary container
    const newElement = tempContainer.firstElementChild;
    return newElement;
}

function addNewCardToList(card) {
    // Find list element by list id
    const listElement = document.querySelector(
        `#list-id-${card.list} > .card-body`
    );

    // New card element
    const cardElement = renderNewCardElement(card);

    // Add to the end of list element
    const theLastEmptyCardElement =
        listElement.querySelector(`.task-card-hidden`);
    listElement.insertBefore(cardElement, theLastEmptyCardElement);
}

function editCardToList(card) {
    // Find exist card
    const existCardElement = document.querySelector(`#card-id-${card.id}`);

    // Render new card element
    const newCardElement = renderNewCardElement(card);

    // Replace list with new card
    existCardElement.replaceWith(newCardElement);
}

function editCardDetail(card) {
    // Replace card title
    const cardTitleElement = document.querySelector("#card-title");
    cardTitleElement.textContent = card.title;

    // Replace card description
    const cardDescriptionElement = document.querySelector(
        "#card-group-description > a"
    );
    cardDescriptionElement.textContent =
        card.description || "Write some thing ...";
}

function deleteCard(cardId) {
    // Get card element by card id
    const cardElement = document.querySelector(`#card-id-${cardId}`);
    // Remove card element
    if (cardElement) {
        cardElement.remove();
    }
}

function moveList(list) {
    // Check if list be reset, then we reload the page
    if (Number(list.position) % 100 === 0) {
        window.location.reload();
    }

    // Get all list of board
    const listElements = document.querySelectorAll(".task-list");

    // Compute move element position

    // Ex: [10, 20, 30, 40, 50, 60];
    // Case 1: 10 20 -> refresh all page
    // Case 2: 5 => left = null, right 10
    // Case 3: 35 => left 30, right = 40
    // Case 4: 65 => left = 60, right = null

    // Find left and right
    let beforeEl, afterEl;

    // Find left is the last el lower than position
    listElements.forEach((el) => {
        if (Number(el.dataset.listPosition) < Number(list.position)) {
            beforeEl = el;
        }
        // TODO: Break
    });
    // Find right is the first bigger than position
    listElements.forEach((el) => {
        if (
            !afterEl &&
            Number(el.dataset.listPosition) > Number(list.position)
        ) {
            afterEl = el;
            // TODO: Break
        }
    });

    // 1. Case first element
    // 2. Case last element
    // 3. Case middle element
    // All case insert before
    let referenceElement;
    const lastTasklist = document
        .querySelector("#task-add-list-btn")
        .closest(".col");
    if (!afterEl) {
        referenceElement = lastTasklist;
    } else {
        referenceElement = afterEl.closest(".col");
    }

    const listElement = document.querySelector(`#list-id-${list.id}`);

    // Update list position dataset
    listElement.dataset.listPosition = list.position;

    referenceElement.insertAdjacentElement(
        "beforebegin",
        listElement.closest(".col")
    );
}

function moveCard(card) {
    // Check if card be reset, then we reload the page
    if (Number(card.position) % 100 === 0) {
        window.location.reload();
    }

    // Moving card element
    const cardElement = document.querySelector(`#card-id-${card.id}`);

    // Change position of card
    cardElement.dataset.cardPosition = card.position;

    // Container element
    const containerElement = document.querySelector(`#list-id-${card.list}`);

    // Get all card of board
    const cardElements = containerElement.querySelectorAll(".task-card");

    // Compute move element position

    // Ex: [10, 20, 30, 40, 50, 60];
    // Case 1: 10 20 -> refresh all page
    // Case 2: 5 => left = null, right 10
    // Case 3: 35 => left 30, right = 40
    // Case 4: 65 => left = 60, right = null

    // Find left and right
    let beforeEl, afterEl;

    // Find left is the last el lower than position
    cardElements.forEach((el) => {
        if (Number(el.dataset.cardPosition) < Number(card.position)) {
            beforeEl = el;
        }
        // TODO: Break
    });
    // Find right is the first bigger than position
    cardElements.forEach((el) => {
        if (
            !afterEl &&
            Number(el.dataset.cardPosition) > Number(card.position)
        ) {
            afterEl = el;
            // TODO: Break
        }
    });

    // 1. Case first element
    // 2. Case last element
    // 3. Case middle element
    // All case insert before
    let referenceElement;

    const hiddenCardElement =
        containerElement.querySelector(".task-card-hidden");

    if (!afterEl) {
        referenceElement = hiddenCardElement;
    } else {
        referenceElement = afterEl;
    }

    referenceElement.insertAdjacentElement("beforebegin", cardElement);
}
