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
    ev.stopPropagation();

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
