document.addEventListener("DOMContentLoaded", function () {
    const createBoardForm = document.querySelector("#create-board-form");
    const addListForm = document.querySelector("#add-list-form");
    const addCardFrom = document.querySelector("#add-card-form");
    const addMemberForm = document.querySelector("#add-member-form");
    const taskCards = document.querySelectorAll(".task-card");
    const taskLists = document.querySelectorAll(".task-list");
    const addMemberButton = document.querySelector("#addMemberButton");

    if (createBoardForm) {
        // Handle create board
        createBoardForm.addEventListener("submit", createBoard);
    }

    if (addListForm) {
        // Handle add list to board
        addListForm.addEventListener("submit", addListToBoard);
    }

    if (addCardFrom) {
        // Handle add card to list
        addCardFrom.addEventListener("submit", addCardToList);
    }
    if (addMemberForm) {
        // Handle add member to board
        addMemberForm.addEventListener("submit", addMemberToBoard);
    }

    // Drag card element process
    // 1) Make card dragable
    taskCards.forEach((dragElement) =>
        dragElement.addEventListener("dragstart", handleDrag)
    );
    // 2) Card dragenter create placeholder
    // 3) Drop card to placeholder
    // 4) Dragend
    taskCards.forEach((dragElement) =>
        dragElement.addEventListener("dragend", handleDragend)
    );

    // Drag list element process
    // 1) Make list dragable
    taskLists.forEach((dragElement) =>
        dragElement.addEventListener("dragstart", handleDragList)
    );
    // 2) Card dragenter create placeholder
    // 3) Drop list to placeholder
    // 4) Dragend
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

    email = document.querySelector("#add-member-email").value;
    boardId = document.querySelector("#add-member-board-id").value;

    // Call API add memeber
    fetch(`/boards/${boardId}/members`, {
        body: JSON.stringify({
            email,
        }),
        method: "POST",
    })
        .then((response) => response.json())
        .then((result) => {
            console.log(result);
        });
}
