function editEvent(selectedEvent) {
    // Parse the event data if it's a JSON string
    const eventData = typeof selectedEvent === "string"
        ? JSON.parse(selectedEvent)
        : selectedEvent;

    // Populate modal input fields with event data
    document.getElementById("editName").value = eventData.name;
    document.getElementById("editDescription").value = eventData.description;
    document.getElementById("editDate").value = eventData.date;
    document.getElementById("editTime").value = eventData.time;
    document.getElementById("editLocation").value = eventData.location;
    document.getElementById("existingImage").value = eventData.image;

    // Replace the old update button to remove previous event listeners
    const oldButton = document.getElementById("updateButton");
    const newButton = oldButton.cloneNode(true);
    oldButton.parentNode.replaceChild(newButton, oldButton);

    // Set click handler for the new update button
    newButton.onclick = () => updateEvent(eventData.id);

    // Show the edit event modal
    $('#editEventModal').modal('show');
}


async function updateEvent(id) {
    // Get input field values
    const name = document.getElementById("editName");
    const description = document.getElementById("editDescription");
    const date = document.getElementById("editDate");
    const time = document.getElementById("editTime");
    const location = document.getElementById("editLocation");
    const imageInput = document.getElementById("editImage");
    const existingImage = document.getElementById("existingImage").value;

    let errorMessage = "";             // Collect validation errors
    let finalImageBase64 = existingImage; // Default to existing image if no new file

    // Basic validation checks
    if (!name.value.trim()) errorMessage += "Event name is required.\n";
    if (!description.value.trim()) errorMessage += "Description is required.\n";
    if (!date.value.trim()) errorMessage += "Date is required.\n";
    if (!time.value.trim()) errorMessage += "Time is required.\n";
    if (!location.value.trim()) errorMessage += "Location is required.\n";

    // Handle image file conversion to Base64 if a new image is selected
    if (imageInput.files.length > 0) {
        const file = imageInput.files[0];
        if (file.size > 50 * 1024) { // Limit file size to 50KB
            errorMessage += "Image size must be less than 50KB.\n";
        } else {
            finalImageBase64 = await fileToBase64(file);
        }
    }

    // Check that the event name contains at least 1 alphabetical character
    if (name.value && !/[a-zA-Z]/.test(name.value)) {
        errorMessage += "Event name must contain at least 1 alphabetical character.\n";
    }

    // Maximum length constraints
    const MAX_NAME = 100;
    const MAX_LOCATION = 150;
    const MAX_DESCRIPTION = 500;
    if (name.value.length > MAX_NAME) errorMessage += `Max characters for Event Name: ${MAX_NAME}.\n`;
    if (location.value.length > MAX_LOCATION) errorMessage += `Max characters for Location: ${MAX_LOCATION}.\n`;
    if (description.value.length > MAX_DESCRIPTION) errorMessage += `Max characters for Description: ${MAX_DESCRIPTION}.\n`;

    // Ensure the event date is in the future
    if (date.value) {
        const eventDate = new Date(date.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Compare only dates, ignore time
        if (eventDate < today) errorMessage += "Event date must be in the future.\n";
    }

    // If there are validation errors, alert the user and stop
    if (errorMessage) {
        alert(errorMessage.trim());
        return;
    }

    try {
        // Send updated event data to server via PUT request
        const res = await fetch(`/edit-event/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: name.value,
                description: description.value,
                date: date.value,
                time: time.value,
                location: location.value,
                image: finalImageBase64
            })
        });

        const data = await res.json();

        // Show error if server response is not ok
        if (!res.ok) {
            alert("Error: " + data.message);
            return;
        }

        // Success: close modal and refresh event list
        alert("Event updated successfully!");
        $('#editEventModal').modal('hide');

        if (typeof loadEvents === "function") {
            loadEvents(); // Refresh the event list without page reload
        }

    } catch (err) {
        console.error(err);
        alert("Server error");
    }
}
