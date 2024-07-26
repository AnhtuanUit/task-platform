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
            console.log(data);

            // Check if is the same browser id
            if (data.browser_id === browserId) {
                return;
            }

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

            // Handle add board member
            if (
                ["create", "delete"].includes(data.action) &&
                data.resource === "board_member"
            ) {
                const members = JSON.parse(data?.data).members;
                addBoardMember(members);
            }

            // Handle add attachment
            if (
                data.action === "create" &&
                data.resource === "attachment_file"
            ) {
                const attachment = JSON.parse(data?.data).attachment;
                addAttachment(attachment);
            }

            // Handle delete attachment
            if (
                data.action === "delete" &&
                data.resource === "attachment_file"
            ) {
                const id = JSON.parse(data?.data).id;
                deleteAttachment(id);
            }

            // Handle edit board
            if (data.action === "edit" && data.resource === "board") {
                const board = JSON.parse(data?.data).board;
                editBoard(board);
            }
        };

        chatSocket.onclose = function (e) {
            console.error(e);
            console.error("Chat socket closed unexpectedly");
        };
    }

    // Function to open the user Websocket connection
    function openNotificationSocket(room = "notification") {
        if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
            console.log("WebSocket is already open.");
            return;
        }

        chatSocket = new WebSocket(
            "ws://" + window.location.host + "/ws/chat/" + room + "/"
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

                // Add list to board
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
    currTotalUnreadElement.textContent = totalUnreadNotification;
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

function addNewListToBoard(list) {
    // The add list button
    const referenceElement = document.querySelector(
        ".task-lists > div.col:last-of-type"
    );

    // Render new list element
    const newTaskListElement = renderTaskListElement(list);

    // Insert new element
    const newListContainer = referenceElement.closest(".task-lists");
    newListContainer.insertBefore(newTaskListElement, referenceElement);
}

function editListToBoard(list) {
    // Find list element by list id
    const taskListTitle = document.querySelector(
        `#list-id-${list.id} .task-list-title`
    );

    // Replace list name
    taskListTitle.textContent = list.name;
}

function deleteList(listId) {
    // Find list element by list id
    const listElement = document
        .querySelector(`#list-id-${listId}`)
        .closest(".col");

    // Remove the list element
    listElement && listElement.remove();
}

function addNewCardToList(card) {
    // Find list element by list id
    const listElement = document.querySelector(
        `#list-id-${card.list} > .card-body`
    );

    // New card element
    const newCardElement = renderCardElement(card);

    // Add to the end of list element
    const theLastEmptyCardElement =
        listElement.querySelector(`.task-card-hidden`);
    listElement.insertBefore(newCardElement, theLastEmptyCardElement);
}

function editCardToList(card) {
    // Find exist card
    const existCardElement = document.querySelector(`#card-id-${card.id}`);

    // Render new card element
    const updatedCardElement = renderCardElement(card);

    // Replace exist card with updated card
    existCardElement.replaceWith(updatedCardElement);
}

function editCardDetail(card) {
    // Replace card title
    const cardTitleElement = document.querySelector("#card-title");
    cardTitleElement.textContent = card.title;

    // Replace card description
    const cardDescriptionElement = document.querySelector(
        "#card-group-description p"
    );
    cardDescriptionElement.textContent = card.description;

    // Replace card due date
    const cardDueDateElement = document.querySelector("#card-group-due-date p");
    cardDueDateElement.textContent = card.due_date && formatDate(card.due_date);

    // Replace card members
    const cardMembersElement = document.querySelector(
        "#card-group-memebers div"
    );
    const listMemberHtml = getListMemberHtml(card.members);
    cardMembersElement.innerHTML = listMemberHtml;
}

function deleteCard(cardId) {
    // Get card element by card id
    const cardElement = document.querySelector(`#card-id-${cardId}`);

    // Remove card element
    cardElement && cardElement.remove();
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
        // TODO: Break for optimize peformance
    });
    // Find right is the first bigger than position
    listElements.forEach((el) => {
        if (
            !afterEl &&
            Number(el.dataset.listPosition) > Number(list.position)
        ) {
            afterEl = el;
            // TODO: Break for optimize peformance
        }
    });

    // 1. Case first element
    // 2. Case last element
    // 3. Case middle element
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
        // TODO: Break for optimize peformance
    });
    // Find right is the first bigger than position
    cardElements.forEach((el) => {
        if (
            !afterEl &&
            Number(el.dataset.cardPosition) > Number(card.position)
        ) {
            afterEl = el;
            // TODO: Break for optimize peformance
        }
    });

    // 1. Case first element
    // 2. Case last element
    // 3. Case middle element
    let referenceElement;

    const hiddenCardElement =
        containerElement.querySelector(".task-card-hidden");

    if (!afterEl) {
        referenceElement = hiddenCardElement;
    } else {
        referenceElement = afterEl;
    }

    // Insert card element to new position
    referenceElement.insertAdjacentElement("beforebegin", cardElement);
}

function addBoardMember(members) {
    // Get board member parent element
    const boardMembers = document.querySelector("#board-members");

    // Generate new board member element
    const totalMember = members.length;
    for (let i = 0; i < members.length; i++) {
        members[i].index = totalMember - i;
    }
    const membersHtml = getListMemberHtml(members);

    // Update board members
    boardMembers.innerHTML = membersHtml;
}

function addAttachment(attachment) {
    // Get attachment parent element
    const cardAttachments = document.querySelector("#card-attachments");

    // Generate new attachment element
    const attachmentHtml = getAttachmentHtml(attachment);

    // Add to parent element
    cardAttachments.insertAdjacentHTML("beforeend", attachmentHtml);
}

function deleteAttachment(id) {
    // Find attachement by id
    const attachementElement = document.querySelector(`#attachment-id-${id}`);

    // Remove elemenet
    attachementElement && attachementElement.remove();
}

function editBoard(board) {
    // Replace board name
    const boardTitleElement = document.querySelector("#board-title");
    boardTitleElement.textContent = board.name;
}
