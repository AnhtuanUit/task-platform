document.addEventListener("DOMContentLoaded", function () {
    let chatSocket = null;

    // Function to open the WebSocket connection
    function openBoardSocket(board_id) {
        if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
            console.log("WebSocket is already open.");
            return;
        }

        chatSocket = new WebSocket(
            "ws://" + window.location.host + "/ws/chat/" + board_id + "/"
        );

        chatSocket.onmessage = function (e) {
            const data = JSON.parse(e.data);
            console.log("data", data);

            // Handle create list
            if (data.action === "create" && data.resource === "list") {
                const list = JSON.parse(data?.data).list;

                // Add list to board
                addNewListToBoard(list);
            }

            // Handle edit list
            // list.board.id, "edit", "list", {"list": model_to_dict(list)}
            if (data.action === "edit" && data.resource === "list") {
                const list = JSON.parse(data?.data).list;

                // Edit list to board
                editListToBoard(list);
            }
        };

        chatSocket.onclose = function (e) {
            console.error(e);
            console.error("Chat socket closed unexpectedly");
        };
    }

    // Function to close the WebSocket connection
    function closeBoardSocket() {
        if (chatSocket.readyState === WebSocket.OPEN) {
            chatSocket.close();
            console.log("WebSocket connection closed.");
        }
    }

    const boardId = document.querySelector("#board-title").dataset.boardId;
    console.log("Listening");
    // Open the WebSocket connection
    openBoardSocket(boardId);
});

function renderListHtml(list) {
    const newListHtml = `
        <div class="col px-1" style="flex: 0 0 20%;">
            <div class="card bg-dark task-list" draggable="true" id="list-id-${list.id}" data-list-id="${list.id}">
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
                    
                    <div class="task-card" style="width: 100%; min-height: 20px; flex: 1;"></div>
                </div>
                <div class="card-footer text-body-secondary">
                    <a href="/lists/${list.id}/add_card">Add a card</a>
                </div>
            </div>
        </div>
    `;

    // Create a temporary container to hold the new HTML
    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = newListHtml;

    // Select the new element from the temporary container
    const newElement = tempContainer.firstElementChild;
    return newElement;
}

function addNewListToBoard(list) {
    // The add list button
    const referenceElement = document.querySelector(
        ".task-lists > div.col:last-of-type"
    );

    // Render new list element
    const newElement = renderListHtml(list);

    // Insert new element
    const newListContainer = referenceElement.closest(".task-lists");
    newListContainer.insertBefore(newElement, referenceElement);
}

function editListToBoard(list) {
    // Find list element by list id
    const oldElement = document
        .querySelector(`#list-id-${list.id}`)
        .closest(".col");

    // Render new list element
    const newElement = renderListHtml(list);

    // Replace new list element
    oldElement.replaceWith(newElement);
}
