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
        <div id="notification-id-${
            notification.id
        }" class="card mb-3 text-custom-6 cursor-pointer ${
        notification.is_read ? "bg-custom-7" : "bg-white"
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
                        <p class="card-text"><small class="text-custom-7">${moment(
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
        <div class="col px-1 flex-20">
            <div class="card task-list task-list-button" draggable="true" id="list-id-${list.id}" data-list-id="${list.id}" data-list-position="${list.position}">
                <div class="card-body scrollable-column" data-list-id="${list.id}">
                    <div class="mb-2 flex-center-space-between">
                        <a class="task-list-title btn-transparent fw-bold text-decoration-none text-custom-1" href="/edit_list/${list.id}">${list.name}</a>
                        <div class="dropdown">
                            <a class="btn-transparent" data-bs-toggle="dropdown" aria-expanded="false">
                                <i class="bi bi-three-dots text-custom-2"></i>
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
                        <a
                            class="btn btn-transparent text-custom-5"
                            href="/lists/${list.id}/add_card"
                            ><i class="bi bi-plus text-custom-5"></i>Add a card</a
                        >
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getCardHtml(card) {
    return `
       <div class="btn task-card card bg-info my-1 bg-white text-start border-0 rounded-xl" data-card-id="${card.id}" data-list-id="${card.list}" id="card-id-${card.id}" draggable="true" data-card-position="${card.position}">
            <div class="card-body d-flex justify-content-between">
                <span class="textarea text-custom-3">${card.title}</span>
                <a id="edit-card-icon" class="btn btn-sm btn-light bg-transparent rounded-circle text-custom-4" href="/edit_card_title_view/${card.id}"><i class="bi bi-pencil-fill"></i></a>
            </div>
        </div>
    `;
}

function getMemberHtml(member) {
    return `
        <a href="/profile/${member.id}">
            <img src="https://i.pravatar.cc/48?u=${member.id}" alt="" width="32" height="32" class="rounded-circle member-profile-icon" style="z-index: ${member.index}">
        </a>
    `;
}

function getListMemberHtml(members) {
    let membersHtml = "";
    for (member of members) {
        membersHtml += getMemberHtml(member);
    }
    return membersHtml;
}

function getAttachmentHtml(attachment) {
    return `
        <div id="card-attachments">
            <div class="card mb-3" id="attachment-id-${attachment.id}">
                <div class="card-body d-flex justify-content-between">
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
        <div class="task-list-placeholder col px-1 flex-20" style="height: ${height}px;">
            <div class="card bg-custom-6" style="height: ${height}px; border: none; border-radius: 16px;">
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

    // Add event click card
    cardElement.addEventListener("click", function () {
        window.location.href = `/cards/${card.id}`;
    });

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
