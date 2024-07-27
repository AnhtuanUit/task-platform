document.addEventListener("DOMContentLoaded", function () {
    const createBoardForm = document.querySelector("#create-board-form");
    const addListForm = document.querySelector("#add-list-form");
    const addCardFrom = document.querySelector("#add-card-form");
    const addMemberForm = document.querySelector("#add-member-form");
    const taskCards = document.querySelectorAll(".task-card");
    const taskLists = document.querySelectorAll(".task-list");

    // 1) Handle create board
    createBoardForm && createBoardForm.addEventListener("submit", createBoard);

    // 2) Handle add list to board
    addListForm && addListForm.addEventListener("submit", addListToBoard);

    // 3) Handle add card to list
    addCardFrom && addCardFrom.addEventListener("submit", addCardToList);

    // 4) Handle add member to board
    addMemberForm && addMemberForm.addEventListener("submit", addMemberToBoard);

    // 5) - A Make card dragable
    taskCards.forEach((dragElement) =>
        dragElement.addEventListener("dragstart", handleDrag)
    );
    // 5) - B Dragend the card
    taskCards.forEach((dragElement) =>
        dragElement.addEventListener("dragend", handleDragend)
    );

    // 6) - A Make list dragable
    taskLists.forEach((dragElement) =>
        dragElement.addEventListener("dragstart", handleDragList)
    );
    // 6) - B Dragend the list
    taskLists.forEach((dragElement) =>
        dragElement.addEventListener("dragend", handleDragendList)
    );

    // 7) Make task card can click
    taskCards.forEach((taskCard) => {
        taskCard.addEventListener("click", function () {
            window.location.href = `/cards/${taskCard?.dataset?.cardId}`;
        });
    });

    // 8) Make textarea of title or name submit form when ENTER
    const textareaElements = document.querySelectorAll(".single-line-textarea");
    textareaElements.forEach(handleEnterSubmitForm);

    // 10) Load recent notifications
    loadRecentNotification();
});

function enterSubmitForm(textarea) {
    textarea.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();

            // Submit form
            event.target.closest("form").submit();
        }
    });
}

function loadRecentNotification() {
    const notificationsPlaceholder = document.querySelector(
        "#notificationsPlacholder"
    );
    apiGetRecentNotifications().then((data) => {
        data.notifications.forEach((notification) => {
            notificationsPlaceholder.appendChild(
                renderNotificationElement(notification)
            );
        });

        // Render total unread notification
        loadUnreadNotification(data.total_unread_notification);
    });
}

function loadUnreadNotification(totalUnreadNotification) {
    const unreadNotificatinoElement = document.querySelector(
        "#notification-total-unread"
    );
    if (totalUnreadNotification >= 0) {
        unreadNotificatinoElement.textContent = totalUnreadNotification;
    }

    // Show/unshow unread badge count
    if (totalUnreadNotification) {
        unreadNotificatinoElement.style.display = "block";
    } else {
        unreadNotificatinoElement.style.display = "none";
    }
}

function createBoard(e) {
    e.preventDefault();
    nameElement = document.querySelector("#create-board-name");
    descriptionElement = document.querySelector("#create-board-description");

    // Call API create board
    apiCreateBoard(nameElement.value, descriptionElement.value).then(() => {
        // Clearn form
        nameElement.value = "";
        descriptionElement.value = "";

        // Redirect to new board
        window.location.reload();
    });
}

function addListToBoard(e) {
    e.preventDefault();
    nameElement = document.querySelector("#add-list-name");
    boardIdElement = document.querySelector("#add-list-board-id");

    // Call API create task list
    apiCreateList(boardIdElement.value, nameElement.value).then(() => {
        // Clearn form
        nameElement.value = "";
    });
}

function addCardToList(e) {
    e.preventDefault();
    const titleElement = document.querySelector("#add-card-title");
    const listIdElement = document.querySelector("#add-card-list-id");

    // Call api create card
    apiCreateCard(listIdElement.value, titleElement.value).then(() => {
        // Clear form
        titleElement.value = "";
    });
}

function addMemberToBoard(e) {
    e.preventDefault();

    emailElement = document.querySelector("#add-member-email");
    boardId = document.querySelector("#add-member-board-id").value;

    // Call API add board member
    apiAddMemberToBoard(emailElement.value).then(() => {
        // Clear form
        emailElement.value = "";
    });
}

function showAlert(message = "", type = "success") {
    const alertPlaceholder = document.getElementById("liveAlertPlaceholder");
    alertPlaceholder.style.display = "flex";
    alertPlaceholder.style.flexDirection = "column";
    alertPlaceholder.style.gap = "6px";

    const appendAlert = (message, type) => {
        const wrapper = document.createElement("div");
        wrapper.innerHTML = [
            `<div class="alert alert-${type} alert-dismissible" role="alert" style="margin-bottom: 0;">`,
            `   <div>${message}</div>`,
            '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
            "</div>",
        ].join("");

        // Remove after 5 seconds
        setTimeout(function () {
            wrapper.remove();
        }, 3000);

        alertPlaceholder.append(wrapper);
    };

    appendAlert(message, type);
}
