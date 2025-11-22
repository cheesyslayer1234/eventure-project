function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = err => reject(err);
    });
}

function editEvent(selectedEvent) {
    console.log("editEvent() clicked!");

    const eventData = typeof selectedEvent === "string"
        ? JSON.parse(selectedEvent)
        : selectedEvent;

    document.getElementById("editName").value = eventData.name;
    document.getElementById("editDescription").value = eventData.description;
    document.getElementById("editDate").value = eventData.date;
    document.getElementById("editTime").value = eventData.time;
    document.getElementById("editLocation").value = eventData.location;
    document.getElementById("existingImage").value = eventData.image;

    const oldButton = document.getElementById("updateButton");
    const newButton = oldButton.cloneNode(true); 
    oldButton.parentNode.replaceChild(newButton, oldButton);

    newButton.onclick = () => updateEvent(eventData.id);

    $('#editEventModal').modal('show');
}

async function updateEvent(id) {
    const name = document.getElementById("editName");
    const description = document.getElementById("editDescription");
    const date = document.getElementById("editDate");
    const time = document.getElementById("editTime");
    const location = document.getElementById("editLocation");
    const imageInput = document.getElementById("editImage");
    const existingImage = document.getElementById("existingImage").value;

    let errorMessage = "";
    let finalImageBase64 = existingImage;

    if (!name.value.trim()) errorMessage += "Event name is required.\n";
    if (!description.value.trim()) errorMessage += "Description is required.\n";
    if (!date.value.trim()) errorMessage += "Date is required.\n";
    if (!time.value.trim()) errorMessage += "Time is required.\n";
    if (!location.value.trim()) errorMessage += "Location is required.\n";

    if (imageInput.files.length > 0) {
        const file = imageInput.files[0];
        if (file.size > 50 * 1024) {
            errorMessage += "Image size must be less than 50KB.\n";
        } else {
            finalImageBase64 = await fileToBase64(file);
        }
    }

    if (name.value && !/[a-zA-Z]/.test(name.value)) {
        errorMessage += "Event name must contain at least 1 alphabetical character.\n";
    }

    const MAX_NAME = 100;
    const MAX_LOCATION = 150;
    const MAX_DESCRIPTION = 500;

    if (name.value.length > MAX_NAME) errorMessage += `Max characters for Event Name: ${MAX_NAME}.\n`;
    if (location.value.length > MAX_LOCATION) errorMessage += `Max characters for Location: ${MAX_LOCATION}.\n`;
    if (description.value.length > MAX_DESCRIPTION) errorMessage += `Max characters for Description: ${MAX_DESCRIPTION}.\n`;

    if (date.value) {
        const eventDate = new Date(date.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (eventDate < today) errorMessage += "Event date must be in the future.\n";
    }

    if (errorMessage) {
        alert(errorMessage.trim());
        return;
    }

    try {
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

        if (!res.ok) {
            alert("Error: " + data.message);
            return;
        }

        alert("Event updated successfully!");
        $('#editEventModal').modal('hide');

        if (typeof loadEvents === "function") {
            loadEvents();
        }

    } catch (err) {
        console.error(err);
        alert("Server error");
    }
}
