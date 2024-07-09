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
});

function createBoard(e) {
    e.preventDefault();
    nameElement = document.querySelector("#create-board-name");
    descriptionElement = document.querySelector("#create-board-description");

    // Call API create board
    apiCreateBoard(nameElement.value, descriptionElement.value).then(() => {
        // Clearn form
        nameElement.value = "";
        descriptionElement.value = "";
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

    const descriptionElement = document.querySelector("#add-card-description");
    const listIdElement = document.querySelector("#add-card-list-id");

    apiCreateCard(listIdElement.value, descriptionElement.value).then(() => {
        descriptionElement.value = "";
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

function showAlert(
    message = "Nice, you triggered this alert message!",
    type = "success"
) {
    const alertPlaceholder = document.getElementById("liveAlertPlaceholder");
    const appendAlert = (message, type) => {
        const wrapper = document.createElement("div");
        wrapper.innerHTML = [
            `<div class="alert alert-${type} alert-dismissible" role="alert">`,
            `   <div>${message}</div>`,
            '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
            "</div>",
        ].join("");

        alertPlaceholder.append(wrapper);
    };

    appendAlert(message, type);
}
