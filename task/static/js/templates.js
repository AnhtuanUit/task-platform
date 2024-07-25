function htmlToElement(html) {
    // Create a temporary container to hold the new HTML
    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = html;

    // Select the new element from the temporary container
    const newElement = tempContainer.firstElementChild;

    // TODO: add dragenter feature for it
    // TODO: add csrfmiddlewaretoken to form
    return newElement;
}

function getTaskListHtml(list) {
    return `
        <div class="col px-1" style="flex: 0 0 20%;">
            <div class="card task-list" style="background: #f1f2f4; border-radius: 16px;" draggable="true" id="list-id-${list.id}" data-list-id="${list.id}" data-list-position="${list.position}">
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
                    <div class="task-card-hidden" style="width: 100%; min-height: 20px; flex: 1;"></div>
                </div>
                <div class="card-footer text-body-secondary">
                    <a href="/lists/${list.id}/add_card">Add a card</a>
                </div>
            </div>
        </div>
    `;
}

function getCardHtml(card) {
    return `
       <div class="task-card card bg-info my-2" data-card-id="${card.id}" data-list-id="${card.list}" id="card-id-${card.id}" draggable="true" data-card-position="${card.position}">
            <div class="card-body" style="display: flex; justify-content: space-between;">
                <a href="/cards/${card.id}">
                    <span>${card.title}</span>
                </a>
                <a href="/edit_card_title/${card.id}"><i class="bi bi-pencil"></i></a>
            </div>
        </div>
    `;
}

function getMemberHtml(member) {
    return `
        <a href="/profile/${member.id}">
            <img src="https://i.pravatar.cc/48?u=${member.id}" alt="" width="32" height="32" class="rounded-circle" style="margin-left: -10px; position: relative; border:3px solid white;  z-index: ${member.index}">
        </a>
    `;
}

function getListMemberHtml(members) {
    let membersHtml = "";
    for (member of members) {
        if (member.id != userId) {
            membersHtml += getMemberHtml(member);
        }
    }
    return membersHtml;
}

function getAttachmentHtml(attachment) {
    return `
        <div class="card" id="attachment-id-${attachment.id}">
            <div class="card-body" style="display: flex; justify-content: space-between;">
                <div>
                    <h5>${
                        attachment.title ||
                        attachment.file.replace("/media", "")
                    }</h5>
                    <img src="${
                        attachment.file
                    }" width="200" alt="Attachment image">
                </div>
                <form action="/delete_attachment_file/${
                    attachment.id
                }" method="POST">
                    <input type="hidden" name="csrfmiddlewaretoken" value="${csrftoken}">
                    <input class="link-primary" type="submit" value="Delete">
                </form>
            </div>
        </div>
    `;
}

function getTaskListPlaceholderHtml(height) {
    return `
        <div class="task-list-placeholder col px-1" style="flex: 0 0 20%; height: ${height}px;">
            <div class="card" style="height: ${height}px; background-color: #ffffff3b; border: none; border-radius: 16px;">
        </div>
    `;
}

function getCardPlaceholderHtml(height) {
    return `
        <div class="task-card-placeholder">
            <div class="card" style="background-color: #ddd; height: ${height}px; border: none; border-radius: 12px;"></div>  
        </div>
    `;
}

function renderTaskListElement(list) {
    const taskListContainerElement = htmlToElement(getTaskListHtml(list));
    const taskListElement =
        taskListContainerElement.querySelector(".task-list");

    // Make task list dragable
    taskListElement.addEventListener("dragstart", handleDragList);

    // Dragend the task list
    taskListElement.addEventListener("dragend", handleDragendList);

    return taskListContainerElement;
}

function renderCardElement(card) {
    const cardElement = htmlToElement(getCardHtml(card));

    // Make card dragable
    cardElement.addEventListener("dragstart", handleDrag);

    // Dragend the card
    cardElement.addEventListener("dragend", handleDragend);

    return cardElement;
}
