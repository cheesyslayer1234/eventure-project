function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (err) => {
            console.error("FileReader error:", err);
            reject(err);
        };
        reader.readAsDataURL(file);
    });
}

async function addEvent() {
    const name = document.getElementById("eventName");
    const description = document.getElementById("eventDescription");
    const date = document.getElementById("eventDate");
    const time = document.getElementById("eventTime");
    const location = document.getElementById("eventLocation");
    const imageInput = document.getElementById("eventImage");

    let errorMessage = "";

    // ----- Required field checks -----
    if (!name.value.trim()) errorMessage += "Event name is required.\n";
    if (!description.value.trim()) errorMessage += "Description is required.\n";
    if (!date.value.trim()) errorMessage += "Date is required.\n";
    if (!time.value.trim()) errorMessage += "Time is required.\n";
    if (!location.value.trim()) errorMessage += "Location is required.\n";
    if (!imageInput.files || imageInput.files.length === 0) {
        errorMessage += "Please upload an image.\n";
    } else {
        const file = imageInput.files[0];
        if (file.size > 50 * 1024) {
            errorMessage += "Image size must be less than 50KB.\n";
        }
    }

    // ----- Event name validation -----
    if (name.value && !/[a-zA-Z]/.test(name.value)) {
        errorMessage += "Event name must contain at least 1 alphabetical character.\n";
    }

    // ----- Max character limits -----
    const MAX_NAME = 100;
    const MAX_LOCATION = 150;
    const MAX_DESCRIPTION = 500;

    if (name.value.length > MAX_NAME)
        errorMessage += `Max character limit reached for Event Name (${MAX_NAME}).\n`;
    if (location.value.length > MAX_LOCATION)
        errorMessage += `Max character limit reached for Location (${MAX_LOCATION}).\n`;
    if (description.value.length > MAX_DESCRIPTION)
        errorMessage += `Max character limit reached for Description (${MAX_DESCRIPTION}).\n`;

    // ----- Event date validation -----
    if (date.value) {
        const eventDate = new Date(date.value);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        if (eventDate < now) {
            errorMessage += "Invalid event date. Please select a future date.\n";
        }
    }

    // Stop submission if errors exist
    if (errorMessage) {
        alert(errorMessage);
        return;
    }

    // ----- Convert image to Base64 -----
    let base64Image;
    try {
        base64Image = await fileToBase64(imageInput.files[0]);
    } catch (err) {
        alert("Failed to read image. Please try again.");
        return;
    }

    // ----- Send POST request -----
    try {
        const res = await fetch("/add-event", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: name.value,
                description: description.value,
                date: date.value,
                time: time.value,
                location: location.value,
                image: base64Image,
            }),
        });

        let data = {};
        try {
            data = await res.json();
        } catch { }

        if (!res.ok) {
            alert(data.message ? "Error: " + data.message : "Server error");
            return;
        }

        // ----- Hide modal first -----
        $('#addEventModal').modal('hide');

        // ----- Show alert after modal is hiding -----
        alert("Event created successfully!");
        document.getElementById("addEventForm").reset();
        loadEvents();

    } catch (err) {
        console.error(err);
        alert("Server error");
    }
}
