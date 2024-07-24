function formatDate(isoString) {
    const date = new Date(isoString);

    const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
    };

    // Format the date
    const formattedDate = new Intl.DateTimeFormat("en-US", options).format(
        date
    );

    // Convert AM/PM to lowercase and add periods
    const formattedDateLowerCase = formattedDate
        .replace(" AM", " a.m.")
        .replace(" PM", " p.m.");

    return formattedDateLowerCase.replace(" at", ",");
}

function getBrowserId() {
    let browserId = localStorage.getItem("browserId");
    if (!browserId) {
        browserId = "browser_" + Math.random().toString(36).substr(2, 9);
        localStorage.setItem("browserId", browserId);
    }
    return browserId;
}
