document.addEventListener("DOMContentLoaded", function () {
    const createBoardForm = document.querySelector("#create-board-form");
    const addListForm = document.querySelector("#add-list-form");
    const addCardFrom = document.querySelector("#add-card-form");
    const addMemberForm = document.querySelector("#add-member-form");
    const taskCards = document.querySelectorAll(".task-card");
    const taskLists = document.querySelectorAll(".task-list");

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
    // const taskLists = document.querySelectorAll(".task-list");
    // taskCards.forEach((dragenterElement) =>
    //     dragenterElement.addEventListener("dragenter", handleDragenter)
    // );

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
    // taskLists.forEach((dragenterElement) =>
    //     dragenterElement.addEventListener("dragenter", handleDragenterList)
    // );

    // 3) Drop list to placeholder
    // 4) Dragend
    taskLists.forEach((dragElement) =>
        dragElement.addEventListener("dragend", handleDragendList)
    );
});

// Some element need this function to allow drop
function allowDrop(ev) {
    ev.preventDefault();
}

// Drag step 1
function handleDrag(ev) {
    ev.stopPropagation();

    // Mark element as dragged
    ev.target.setAttribute("data-drag-card", "true");

    // Make dragged blur a bit
    ev.target.style.opacity = "0.5";

    const taskCards = document.querySelectorAll(".task-card");
    taskCards.forEach((dragenterElement) =>
        dragenterElement.addEventListener("dragenter", handleDragenter)
    );
}

// Drag step 2
function handleDragenter(ev) {
    ev.stopPropagation();
    const dragenterElement = ev.target.closest(".task-card");

    //  Check if dragenter element is not dragged element
    if (dragenterElement.getAttribute("data-drag-card") !== "true") {
        // Remove other placeholder
        const ortherPlaceholder = document.querySelector(
            ".task-card-placeholder"
        );
        ortherPlaceholder && ortherPlaceholder.remove();

        // Handle add placeholder before the dragenterElement
        const parentElement = dragenterElement.closest(".card-body");
        const placeholderElement = createCardPlaceholderElement();
        parentElement.insertBefore(placeholderElement, dragenterElement);
    }
}

// Drag step 3
function drop(ev) {
    const placeholder = ev.target;
    const draggedElement = document.querySelector(
        ".task-card[data-drag-card='true']"
    );
    if (!draggedElement) return;
    // By default element cannot be drop, so make it dropable
    ev.preventDefault();

    // Detect previous card
    let prevCard, resulPrevCard;
    const parentElement = placeholder.closest(".card-body");
    parentElement
        .querySelectorAll(".task-card, .task-card-placeholder")
        .forEach((card) => {
            // Return previous card if current card is placeholder
            if (card.classList.contains("task-card-placeholder")) {
                resulPrevCard = prevCard;
            } else {
                prevCard = card;
            }
        });

    // Detect listId, cardId
    const prevCardId = resulPrevCard ? resulPrevCard.dataset.cardId : false;
    const preCardListId = parentElement.dataset.listId;
    const cardId = draggedElement.dataset.cardId;

    // Call API for move card position
    apiMoveCard(cardId, prevCardId, preCardListId);

    // Replace placeholder with dragged element
    const needReplaceElement = placeholder.closest(".task-card-placeholder");
    parentElement.replaceChild(draggedElement, needReplaceElement);
}

// Drag step 4
function handleDragend(ev) {
    // Make dragged element visible
    const draggedElement = ev.target;
    draggedElement.style.opacity = "1";

    // Remove placeholder
    const placeholderElement = document.querySelector(".task-card-placeholder");
    placeholderElement && placeholderElement.remove();

    // Remove dragged attr
    draggedElement.setAttribute("data-drag-card", "false");

    // Remove event dragenter
    const taskCards = document.querySelectorAll(".task-card");
    taskCards.forEach((dragenterElement) =>
        dragenterElement.removeEventListener("dragenter", handleDragenter)
    );
}

// Again for move list
// Drag list step 1
function handleDragList(ev) {
    // Mark element as dragged
    ev.target.setAttribute("data-drag-list", "true");

    // Make dragged blur a bit
    ev.target.style.opacity = "0.5";

    // Add event dragenter
    const taskLists = document.querySelectorAll(".task-list");
    taskLists.forEach((dragenterElement) =>
        dragenterElement.addEventListener("dragenter", handleDragenterList)
    );
}

// Drag list step 2
function handleDragenterList(ev) {
    const dragenterElement = ev.target.closest(".task-list");

    //  Check if dragenter element is not dragged element
    if (dragenterElement.getAttribute("data-drag-list") !== "true") {
        // Remove orther task list placeholder
        const ortherPlaceholder = document.querySelector(
            ".task-list-placeholder"
        );
        ortherPlaceholder && ortherPlaceholder.remove();

        // Add placeholder to left
        const dragenterElement = ev.target;
        const taskListParent = dragenterElement.closest(".task-lists");
        const biggestHoverElement = dragenterElement.closest(".col");
        const placeholderElement = createListPlaceholderElement();
        taskListParent.insertBefore(placeholderElement, biggestHoverElement);
    }
}
// Drag list step 3
function dropList(ev) {
    // By default element cannot be drop, so make it dropable
    ev.preventDefault();
    const placeholder = ev.target;
    const draggedElement = document.querySelector(
        ".task-list[data-drag-list='true']"
    );

    // Detect previous list
    let prevTaskList, resulPrevTaskList;
    const parentElement = placeholder.closest(".task-lists");
    parentElement
        .querySelectorAll(".task-list, .task-list-placeholder")
        .forEach((taskList) => {
            // Return previous taskList if current taskList is placeholder
            if (taskList.classList.contains("task-list-placeholder")) {
                resulPrevTaskList = prevTaskList;
            } else {
                prevTaskList = taskList;
            }
        });

    // Detect listId, listId
    const prevListId = resulPrevTaskList
        ? resulPrevTaskList.dataset.listId
        : false;
    const listId = draggedElement.dataset.listId;

    // Call API for move card position
    apiMoveList(listId, prevListId);

    // Replace placeholder with dragged element
    const needReplaceElement = placeholder.closest(".task-list-placeholder");
    const colTaskList = draggedElement.closest(".col");
    parentElement.replaceChild(colTaskList, needReplaceElement);
}
// Drag list step 4
function handleDragendList() {
    // Make dragged element visible
    const draggedElement = document.querySelector("div[data-drag-list='true']");
    draggedElement.style.opacity = "1";

    // Remove placeholder
    const placeholderElement = document.querySelector(".task-list-placeholder");
    placeholderElement && placeholderElement.remove();

    // Remove dragged attr
    draggedElement.setAttribute("data-drag-card", "false");

    // Remove event dragenter
    const taskLists = document.querySelectorAll(".task-list");
    taskLists.forEach((dragenterElement) =>
        dragenterElement.removeEventListener("dragenter", handleDragenterList)
    );
}

function createCardPlaceholderElement() {
    // Make placeholder UI
    const placeholderHtml = `
<div class="card" style="background-color: #292e33; height: 100px;"></div>  
`;
    const placeholderElement = document.createElement("div");
    placeholderElement.classList.add("task-card-placeholder");
    placeholderElement.innerHTML = placeholderHtml;

    // Make placeholder dropable
    placeholderElement.addEventListener("dragover", allowDrop);
    placeholderElement.addEventListener("drop", drop);
    return placeholderElement;
}

function createListPlaceholderElement() {
    const placeholderElement = document.createElement("div");
    placeholderElement.classList.add("task-list-placeholder");
    placeholderElement.classList.add("col");
    placeholderElement.classList.add("px-1");
    placeholderElement.setAttribute("ondrop", "drop(event)");
    placeholderElement.style.flex = "0 0 20%";

    // Make it can drop later
    placeholderElement.innerHTML = `
        <div class="card" style="height: 100%; background-color: #aaa;">
    `;

    // Make placeholder dropable
    placeholderElement.addEventListener("dragover", allowDrop);
    placeholderElement.addEventListener("drop", dropList);
    return placeholderElement;
}

// Create list placeholder
function createListPlaceholder(hoverElement, hoverLeft = true) {
    // Clean these orther task list placeholder
    const ortherPlaceholder = document.querySelector(".task-list-placeholder");
    ortherPlaceholder && ortherPlaceholder.remove();

    // Add to left or right
    const taskListParent = hoverElement.closest(".task-lists");
    const biggestHoverElement = hoverElement.closest(".col");
    const placeholderElement = createListPlaceholderElement();
    taskListParent.insertBefore(placeholderElement, biggestHoverElement);
}

function createBoard(e) {
    e.preventDefault();
    nameElement = document.querySelector("#create-board-name");
    descriptionElement = document.querySelector("#create-board-description");

    // Call API create board
    fetch("/boards", {
        method: "POST",
        body: JSON.stringify({
            name: nameElement.value,
            description: descriptionElement.value,
        }),
    })
        .then((response) => response.json())
        .then((result) => {
            console.log(result);

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
    fetch(`/boards/${boardIdElement.value}/lists`, {
        method: "POST",
        body: JSON.stringify({
            name: nameElement.value,
        }),
    })
        .then((response) => response.json())
        .then((result) => {
            console.log(result);

            // Clearn form
            nameElement.value = "";
        });
}

function addCardToList(e) {
    e.preventDefault();

    const descriptionElement = document.querySelector("#add-card-description");
    const listIdElement = document.querySelector("#add-card-list-id");

    fetch(`/lists/${listIdElement.value}/cards`, {
        method: "POST",
        body: JSON.stringify({
            description: descriptionElement.value,
        }),
    })
        .then((response) => response.json())
        .then((result) => {
            console.log(result);
            // Clear form
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
        .then((result) => console.log(result))
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
        .then((result) => console.log(result))
        .catch((error) => console.error(error));
}
