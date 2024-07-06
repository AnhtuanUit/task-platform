function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    draggedElement = document.getElementById(data);
    placeholder = ev.target;
    // If drag id include "list" or include "card"
    if (data.includes("card")) {
        handleDropCard(placeholder, draggedElement);
    } else if (data.includes("list")) {
        handleDropList(placeholder, draggedElement);
    }
}

function handleDropList(placeholder, draggedElement) {
    // TODO: detect previous card
    let prevTaskList;
    let resulPrevTaskList;

    const taskListsElement = placeholder.closest(".task-lists");

    // Detect previous card
    taskListsElement.querySelectorAll(".task-list").forEach((taskList) => {
        // Check if current taskList is placeholder
        // Return privious taskList if current taskList is placeholder
        if (taskList.classList.contains("task-list-placeholder")) {
            // Break
            resulPrevTaskList = prevTaskList;
        } else {
            prevTaskList = taskList;
        }
    });
    // Detect listId, cardId
    const prevListId = resulPrevTaskList
        ? resulPrevTaskList.dataset.listId
        : false;
    const listId = draggedElement.dataset.listId;

    // Call API for move card position
    apiMoveList(listId, prevListId);

    // Replace placeholder with dragged element
    const biggestPlaceholder = placeholder.closest(".task-list-placeholder");
    taskListsElement.replaceChild(draggedElement, biggestPlaceholder);
    handleStopCreatePlaceHolder();
}

function handleDropCard(placeholder, draggedElement) {
    // TODO: detect previous card
    let prevCard;
    let resulPrevCard;

    const taskListElement = placeholder.closest(".task-list");

    // Detect previous card
    taskListElement.querySelectorAll(".task-card").forEach((card) => {
        // Check if current card is placeholder
        // Return privious card if current card is placeholder
        if (card.classList.contains("placeholder-card")) {
            // Break
            resulPrevCard = prevCard;
        } else {
            prevCard = card;
        }
    });
    // Detect listId, cardId
    const prevCardId = resulPrevCard ? resulPrevCard.dataset.cardId : false;
    const preCardListId = taskListElement.dataset.listId;
    const cardId = draggedElement.dataset.cardId;

    // Call API for move card position
    apiMoveCard(cardId, prevCardId, preCardListId);

    // Replace placeholder with dragged element
    taskListElement.replaceChild(draggedElement, placeholder);
    handleStopCreatePlaceHolder();
}

// TODO: add list placeholder
function addListPlaceholder(hoverElement, hoverLeft = true) {
    const placeholderElement = document.createElement("div");
    // For treat list placeholder as a task-list
    placeholderElement.classList.add("task-list");
    placeholderElement.classList.add("task-list-placeholder");
    placeholderElement.classList.add("row");
    placeholderElement.setAttribute("ondrop", "drop(event)");
    placeholderElement.setAttribute("ondragover", "allowDrop(event)");

    // TODO: make it can drop later
    placeholderElement.innerHTML = `
        <div class="card" style="height: 100%; background-color: #aaa;">
    `;

    // Clean these orther task list placeholder
    document.querySelectorAll(".task-list-placeholder").forEach((item) => {
        item.remove();
    });

    // Add to left or right
    const taskListParent = hoverElement.closest(".task-lists");
    const biggestHoverElement = hoverElement.closest(".col");
    if (hoverLeft) {
        taskListParent.insertBefore(placeholderElement, biggestHoverElement);
    } else {
        taskListParent.insertBefore(
            placeholderElement,
            biggestHoverElement.nextSibling
        );
    }

    // TODO: this function will happend when drag drop in this place holder
    // Currently we fake it as a click
    placeholderElement.addEventListener("click", function () {
        stopTaskListDetectHover();
    });
}

// TODO: hover lef part, right part add placeholder
// TODO: enable hover
function taskListDetectHover() {
    let mouseX = 0;

    function handleMouseMove(event) {
        mouseX = event.clientX;
    }

    document.addEventListener("mousemove", handleMouseMove);

    // Get all taskList
    const taskLists = document.querySelectorAll(
        ".task-list:not(.task-list-placeholder)"
    );

    function handleListMouseMove() {
        const rect = this.getBoundingClientRect();
        const x = mouseX - rect.left;
        // Mouse left or right of task list(rect)
        const isLeft = x < rect.width / 2;

        // Check if change side
        if (this.dataset.isLeft !== isLeft) {
            this.dataset.isLeft = String(isLeft); // Use dataset to store state
            // Add task list placeholder by side
            addListPlaceholder(this, isLeft);
        }
    }

    // Handle hover for each task list
    function bindTaskListEvents(taskList) {
        // Handle task list hover
        function wrapperHandleTaskListHover() {
            // Handel mouse move for detect left or right part
            taskList.addEventListener("mousemove", handleListMouseMove);
        }

        // Handle task list unhover
        function wrapperHandleTaskListUnhover() {
            // Remove event mouse move for each taskList
            taskList.removeEventListener("mousemove", handleListMouseMove);
        }

        taskList.addEventListener("mouseover", wrapperHandleTaskListHover);
        taskList.addEventListener("mouseout", wrapperHandleTaskListUnhover);

        taskList.handleMousemoveWrapper = wrapperHandleTaskListHover;
        taskList.handleMouseoutWrapper = wrapperHandleTaskListUnhover;
    }

    // Handle hover for each
    taskLists.forEach(bindTaskListEvents);
}

// TODO: stop hover
function stopTaskListDetectHover() {
    // Remove all listening events
    // Add all event relate to it
    const taskLists = document.querySelectorAll(
        ".task-list:not(.task-list-placeholder)"
    );

    // To remove event listeners later:
    function removeListEvents(taskList) {
        taskList.removeEventListener(
            "mouseover",
            taskList.handleMousemoveWrapper
        );
        taskList.removeEventListener(
            "mouseout",
            taskList.handleMouseoutWrapper
        );
    }

    // Loop through taskLists to remove event listeners
    taskLists.forEach(removeListEvents);
}
// TODO: add drag feature
// List function for drag feature

document.addEventListener("DOMContentLoaded", function () {
    createBoardForm = document.querySelector("#create-board-form");
    addListForm = document.querySelector("#add-list-form");
    addCardFrom = document.querySelector("#add-card-form");
    addMemberForm = document.querySelector("#add-member-form");

    // Handle board hover
    document
        .querySelector("#create-placeholder-btn")
        .addEventListener("click", handleCreatePlaceholder);

    document
        .querySelector("#close-create-placeholder-btn")
        .addEventListener("click", handleStopCreatePlaceHolder);

    // Handle list hover
    document
        .querySelector("#create-list-placeholder-btn")
        .addEventListener("click", taskListDetectHover);

    document
        .querySelector("#close-create-list-placeholder-btn")
        .addEventListener("click", stopTaskListDetectHover);

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
});

function handleStopCreatePlaceHolder() {
    // Add all event relate to it
    const taskCards = document.querySelectorAll(
        ".task-card:not(.placeholder-card)"
    );

    // To remove event listeners later:
    function removeListEvents(card) {
        card.removeEventListener("mouseover", card.handleMousemoveWrapper);
        card.removeEventListener("mouseout", card.handleMouseoutWrapper);
    }

    // Loop through taskCards to remove event listeners
    taskCards.forEach(removeListEvents);
}

function handleCreatePlaceholder() {
    // Add all event relate to it
    const taskCards = document.querySelectorAll(
        ".task-card:not(.placeholder-card)"
    );

    let mouseX = 0;
    let mouseY = 0;

    function handleMouseMove(event) {
        mouseX = event.clientX;
        mouseY = event.clientY;
    }

    document.addEventListener("mousemove", handleMouseMove);

    function handleCardMouseMove() {
        const rect = this.getBoundingClientRect();
        const y = mouseY - rect.top;
        const isTop = y < rect.height / 2;

        if (this.dataset.isTop !== String(isTop)) {
            this.dataset.isTop = String(isTop); // Use dataset to store state
            insertPlaceHolder(this, isTop);
            // this.querySelector(".position-status").textContent = isTop
            //     ? "TOP HALF"
            //     : "BOTTOM HALF";
        }
    }

    function bindCardEvents(card) {
        function handleMousemoveWrapper() {
            card.addEventListener("mousemove", handleCardMouseMove);
        }
        function handleMouseoutWrapper() {
            card.removeEventListener("mousemove", handleCardMouseMove);
        }

        card.addEventListener("mouseover", handleMousemoveWrapper);
        card.addEventListener("mouseout", handleMouseoutWrapper);

        // Store references to event listeners to remove them later
        card.handleMousemoveWrapper = handleMousemoveWrapper;
        card.handleMouseoutWrapper = handleMouseoutWrapper;
    }

    taskCards.forEach(bindCardEvents);
}

function insertPlaceHolder(referenceNode, isTop) {
    const placeholderHtml = `
        <div class="card" style="background-color: #292e33; height: 100px;" ondrop="drop(event)" ondragover="allowDrop(event)"></div>  
    `;
    const newNode = document.createElement("div");
    newNode.classList.add("placeholder-card");
    newNode.classList.add("task-card");

    newNode.innerHTML = placeholderHtml;

    newNode.addEventListener("click", handleStopCreatePlaceHolder);

    // Clean all placeholder
    document
        .querySelectorAll(".placeholder-card")
        .forEach((placeholderCard) => placeholderCard.remove());

    if (isTop) {
        referenceNode.parentNode.insertBefore(newNode, referenceNode);
    } else {
        referenceNode.parentNode.insertBefore(
            newNode,
            referenceNode.nextSibling
        );
    }
}

function removePlaceHolder() {}

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
