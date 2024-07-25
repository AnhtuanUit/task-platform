document.addEventListener("DOMContentLoaded", function () {
    const createBoardForm = document.querySelector("#create-board-form");
    const addListForm = document.querySelector("#add-list-form");
    const addCardFrom = document.querySelector("#add-card-form");
    const addMemberForm = document.querySelector("#add-member-form");
    const taskCards = document.querySelectorAll(".task-card");
    const taskLists = document.querySelectorAll(".task-list");
    const addCardMemberForm = document.querySelector("#add-card-member-form");

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

    // 7) Add card member
    addCardMemberForm &&
        addCardMemberForm.addEventListener("submit", handleAddCardMember);

    // 8) Redirect to card detail when click task card
    taskCards.forEach((taskCard) => {
        taskCard.addEventListener("click", function () {
            window.location.href = `/cards/${taskCard?.dataset?.cardId}`;
        });
    });

    // 9) Disable some textarea enter
    const textareaElements = document.querySelectorAll(".single-line-textarea");
    textareaElements.forEach((textarea) => {
        textarea.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();

                // Submit form
                event.target.closest("form").submit();
            }
        });
    });
});

function handleAddCardMember(e) {
    e.preventDefault();
    const memberElement = document.querySelector("#add-card-member-user");
    const cardId = document.querySelector("#add-card-member-form").dataset
        .cardId;
    // Call API add card member
    apiAddCardMember(cardId, memberElement.value).then(() => {
        // Reload the page for update new data
        // location.reload();
    });
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

    // Call API add list to board
    apiCreateList(boardIdElement.value, nameElement.value).then(() => {
        // Clearn form
        nameElement.value = "";
    });
}

function addCardToList(e) {
    e.preventDefault();

    const titleElement = document.querySelector("#add-card-title");
    const listIdElement = document.querySelector("#add-card-list-id");

    apiCreateCard(listIdElement.value, titleElement.value).then(() => {
        titleElement.value = "";
    });
}

function addMemberToBoard(e) {
    e.preventDefault();

    emailElement = document.querySelector("#add-member-email");
    boardId = document.querySelector("#add-member-board-id").value;

    // Call API add memeber
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
