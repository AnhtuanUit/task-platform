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

function getNotificationHtml(notification) {
    return `
        <div class="card mb-3" id="notification-id-${
            notification.id
        }" style="cursor: pointer; color: #172B4D; ${
        notification.is_read
            ? "background-color: #ddd;"
            : "background-color: white;"
    }">
            <div class="card-body">
                <div class="row g-2">
                    <div class="col-auto">
                        <img src="https://i.pravatar.cc/48?u=${
                            notification.actor
                        }" alt="" width="32" height="32" class="rounded-circle me-2">
                    </div>
                    <div class="col">
                        <h5 class="card-title">${notification.title}</h5>
                        <p class="card-text">${notification.description}</p>
                        <p class="card-text"><small style="color: #2d4265;">${moment(
                            notification.created_at
                        ).fromNow()}</small></p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getListNotificationHtml(notifications) {
    const listNotificationHtml = notifications.map((notification) => {
        const notificationHtml = getNotificationHtml(notification);
        return notificationHtml;
    });
    const result = listNotificationHtml.join("");
    return result;
}

function getTaskListHtml(list) {
    return `
        <div class="col px-1" style="flex: 0 0 20%;">
            <div class="card task-list" style="cursor: pointer; background: #f1f2f4; border-radius: 16px; border: none;" draggable="true" id="list-id-${list.id}" data-list-id="${list.id}" data-list-position="${list.position}">
                <div class="card-body" style="display:flex; flex-direction: column; max-height: 650px !important; overflow-y: auto;" data-list-id="${list.id}">
                    <div class="mb-2 flex-center-space-between">
                        <a class="task-list-title btn-transparent fw-bold text-decoration-none" style="color: #172b4d;" href="/edit_list/${list.id}">${list.name}</a>
                        <div class="dropdown">
                            <a class="btn-transparent" data-bs-toggle="dropdown" aria-expanded="false">
                                <i class="bi bi-three-dots" style="color: #212529;"></i>
                            </a>
                            <ul class="dropdown-menu">
                              <li>
                                <button type="button" class="dropdown-item" data-bs-toggle="modal" data-bs-target="#confirmListDeletionModal">
                                    Delete
                                </button>
                            </li>
                            </ul>
                          </div>
                    </div>
                    <div class="task-card-hidden mt-2">
                        <a class="btn btn-transparent" style="color: #44546f" href="/lists/${list.id}/add_card"><i class="bi bi-plus" fill="#44546f"></i>Add a card</a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getCardHtml(card) {
    return `
       <div class="btn task-card card bg-info my-1 bg-white" style="text-align: left; border: none; border-radius: 12px;" data-card-id="${card.id}" data-list-id="${card.list}" id="card-id-${card.id}" draggable="true" data-card-position="${card.position}">
            <div class="card-body" style="display: flex; justify-content: space-between;">
                <span class="textarea" style="color: #172B4D;">${card.title}</span>
                <a id="edit-card-icon" class="btn btn-sm btn-light bg-transparent" href="/edit_card_title/${card.id}" style="color: #172B4D; border-radius: 1000px;"><i class="bi bi-pencil-fill"></i></a>
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
        <div id="card-attachments">
            <div class="card mb-3" id="attachment-id-${attachment.id}">
                <div class="card-body" style="display: flex; justify-content: space-between;">
                    <div>
                        <h5>${
                            attachment.title ||
                            attachment.file.replace("/media", "")
                        }</h5>                                
                        <a href="${attachment.file}" target="blank">
                            <img src="${
                                attachment.file
                            }" height="70" alt="Attachment image">
                        </a>
                    </div>
                    <form action="/delete_attachment_file/${
                        attachment.id
                    }" method="POST">
                        <input type="hidden" name="csrfmiddlewaretoken" value="${csrftoken}">
                        <input class="btn btn-sm btn-danger" type="submit" value="Delete">
                    </form>
                </div>
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

function renderNotificationElement(notification) {
    const notificationElement = htmlToElement(
        getNotificationHtml(notification)
    );
    notificationElement.addEventListener("click", function () {
        // Handle read notification
        apiReadNotification(notification.id).then(() => {
            // Update notification background
            notificationElement.style.backgroundColor = "#ddd";

            // Update total unread notification
            // const unreadNotificatinoElement = document.querySelector(
            //     "#notification-total-unread"
            // );
            // const totalUnreadNotification =
            //     Number(unreadNotificatinoElement.textContent) - 1;

            // if (totalUnreadNotification >= 0) {
            //     unreadNotificatinoElement.textContent = totalUnreadNotification;
            //     if (totalUnreadNotification) {
            //         unreadNotificatinoElement.style.display = "block";
            //     } else {
            //         unreadNotificatinoElement.style.display = "none";
            //     }
            // }
        });
    });
    return notificationElement;
}
