# Project Management Tool

## Overview

This project is a web-based project management tool built with Django. It enables users to manage projects using boards, lists, and cards. Users can create tasks, assign members, upload attachments, and receive real-time notifications for updates. The application is fully responsive and designed to be usable across various devices.

## Distinctiveness and Complexity

### Distinctiveness

-   **Dynamic Updates**: Real-time project changes keep all users informed of the latest modifications.
-   **Real-Time Notifications**: Instant alerts for critical updates enhance communication and collaboration.
-   **File Handling**: Attachments can be added to tasks, allowing direct management and reference of documents within the application.
-   **Drag-and-Drop Functionality**: Intuitive organization and prioritization of tasks with drag-and-drop for cards and lists, enhancing user experience with flexible task management.

### Complexity

-   **Board and Task Management**: CRUD operations for boards, lists, and cards, including drag-and-drop reordering and member assignments, managing frontend interactions and transitions.
-   **Member Management**: Effective collaboration through assigning and managing board and card members.
-   **File Attachments**: Secure handling of file uploads and retrieval for task-related documents.
-   **Real-Time Updates**: APIs and WebSockets provide real-time notifications and updates, synchronizing changes across all users.
-   **Responsive Design**: Ensures usability across different devices, offering a good experience on both desktop and mobile.

## File Descriptions

### Views

-   **views/**init**.py**:

    -   Combines or imports the following files.
    -   Each file below contains view functions for rendering templates and handling user interactions.

-   **views/board_views.py**:

    -   Board view functions: `create_board_view`, `board_view`, `edit_board_view`, `delete_board`, `create_board_member_view`, `board_members_view`, `delete_board_member`

-   **views/list_views.py**:

    -   List view functions: `create_list_view`, `edit_list_view`, `delete_list`

-   **views/card_views.py**:

    -   Card functions: `create_card_view`, `card_view`, `edit_card_title_view`, `edit_card_view`, `delete_card`, `card_members_view`, `delete_card_member`, `create_attachment_file_view`, `delete_attachment_file`, `serve_file`

-   **views/user_views.py**:
    -   User view functions: `index`, `login_view`, `register_view`, `logout_view`, `profile_view`, `edit_profile_view`

### API

-   **api.py**: Contains the API endpoints for handling AJAX requests and providing data to the frontend.
    -   Endpoints: `boards`, `add_list`, `move_list`, `add_card`, `move_card`, `board_member`, `get_notifications`, `read_notification`

### Templates

-   **apology.html**: Displays error messages or apologies with meme image and message inside.
-   **index.html**: Home page displaying boards of the user.
-   **layout.html**: Template for consistent site layout.
-   **form_snippet.html**: Template for custom Django form.

-   **register.html**: Form for user registration.
-   **login.html**: Form for user login.
-   **profile.html**: Displays user profile information.
-   **edit_profile.html**: Form to edit user profile.

-   **board.html**: Displays board details and task lists.
-   **board_members.html**: Displays and manages board members.
-   **create_board.html**: Form to create a new board.
-   **create_board_member.html**: Form to add a new board member.
-   **edit_board.html**: Form to edit board details.

-   **create_list.html**: Form to create a new list.
-   **edit_list.html**: Form to edit list details.

-   **card.html**: Displays card details.
-   **create_card.html**: Form to create a new card.
-   **edit_card.html**: Form to edit card details.
-   **edit_card_title.html**: Form to edit the card title.
-   **card_members.html**: Displays and manages card members.
-   **create_attachment_file.html**: Form to add attachments to a card.

### Static Files

-   **styles.css**: Custom CSS for styling the application.
-   **scripts.js**: JavaScript for handling frontend interactions.
-   **drag.js**: JavaScript for handling drag-and-drop functionality.
-   **boardWebsocket.js**: JavaScript for handling real-time updates for boards, lists, cards, and members.
-   **notificationWebsocket.js**: JavaScript for handling real-time notifications.
-   **templates.js**: JavaScript for rendering HTML or DOM elements for lists, cards, members, and notifications.
-   **utils.js**: JavaScript utility functions: `formatDate`, `getBrowserId`.

### URL Configurations

-   **urls.py**: Contains the URL patterns for routing requests to the appropriate views and API endpoints.

### Models

-   **models.py**: Contains the database models for users, profiles, boards, lists, cards, and attachments.

### Other Files

-   **forms.py**: Django forms that support generating forms and validating data: `EditProfileForm`, `EditBoardForm`, `EditListForm`, `EditCardTitleForm`, `EditCardForm`, `CreateAttachmentForm`

-   **notifications.py**: Notification functions that send app notifications in real-time:
    -   Group of `board_id`
    -   Send direct to user by members info

### Websockets

-   **capstone/asgi.py**: Sets up ASGI configuration for handling asynchronous requests.
-   **realtime/consumers.py**: Defines WebSocket consumers for real-time communication.
-   **realtime/routing.py**: Maps WebSocket URL patterns to consumers.

## How to Run the Application

1. **Clone the repository:**

    ```bash
    git clone https://github.com/yourusername/project-management-tool.git
    cd project-management-tool
    ```

2. **Install dependencies:**
   Make sure you have Python and pip installed. Then, install the required packages:

    ```bash
    pip install -r requirements.txt
    ```

3. **Apply migrations:**

    ```bash
    python manage.py migrate
    ```

4. **Create a superuser:**

    ```bash
    python manage.py createsuperuser
    ```

5. **Run the development server:**

    ```bash
    python manage.py runserver
    ```

6. **Access the application:**
   Open your web browser and navigate to `http://127.0.0.1:8000` to access the application.

## Additional Information

### User Authentication:

-   **Register:** Visit the website, click "Register," and sign up with a username and email.
-   **Login:** Click "Login" and log in with your username and password.
-   **Post-Login:** Verify that a random avatar with your username is displayed at the top left. Click the avatar to see the "Logout" option.
-   **Logout:** Click the "Logout" option to log out.

### Create a New Board:

-   **Create Board:** Once logged in, click the "Create" button in the top menu to add a new board. Enter the board's name and description.

### View All Boards:

-   **Side Menu:** The left side menu displays all boards you have created, as well as boards where you have been added as a member by others.

### Board Page:

-   Show the board name at the top.
-   Show board members at the top.
-   Show task lists in the content section:
    -   Each task list has a title.
-   Show task cards inside the task list:
    -   Each task card has a name.
-   Show buttons to edit, show board members, add members, and delete the board.

### Create a New List:

-   Click the "Add another list" button on the board page to redirect to the "Create List" page. The page should:
    -   Show a form to create a new list with a name field.
    -   Show success or error alerts with messages.

### Create a Card:

-   Click the "Add card" button inside the created task list to redirect to the "Create Card" page. The page should:
    -   Show a form to create a card with a title field.
    -   Show success or error alerts with messages.

### Add Board Members:

-   Click the "Share" button on the board page to redirect to the "Add Board Member" page. The page should:
    -   Show a form to add a board member with the user's email.
    -   Show success or error alerts with messages.
    -   Ensure the user must register and not already be added to the board.

### View Card Details:

-   Click a task card to redirect to the card detail page.
-   Show the card title, task list name, description, due date, members, and attached files.

### Drag-and-Drop:

-   Move lists and cards within the board.
-   Save the new order even after reloading the page.

### Edit Card:

-   Provide a button to edit the card, redirecting to the edit card page.
-   Show a form to edit card details (title, description, due date).
-   Add card members: show options for board members to pick.
-   Add card attachment files: click the "Add" button to redirect to a page to upload attachments with a title and file.

### Edit Features:

-   Edit the board title and description.
-   Edit the list title and description.

### Manage Members:

-   Click the "Members" button on the board page to redirect to the "Board Members" page showing: username, email, random avatar.
-   Click the "Manage" button on the card page to redirect to the "Card Members" page.
-   Click the "Delete" button to remove a member from the board/card.

### Real-Time Updates:

-   ## Real-time updates for:

Boards, lists, and cards: using WebSocket.

-   Notifications: using WebSocket.
-   Board members, card members, and attachments.
-   Ensure real-time updates work without page reloads.

### Notification Features:

-   Show real-time notifications at the top right.
-   Show a list of notifications.
-   Mark notifications as read by clicking "Mark as read."
