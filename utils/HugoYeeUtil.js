const fs = require('fs').promises;
const path = require('path');

const resourcesFile = path.join(__dirname, 'events.json');

//Update an event by ID. Returns a consistent JSON response object (not res.json here). 
async function editEvent(req) {
    try {
        const id = req.params.id;
        const { name, description, date, time, location, image } = req.body;

        // Basic validation: all fields must be filled
        if (!name || !description || !date || !time || !location || !image) {
            return { success: false, message: "All fields are required." };
        }

        // Load and parse existing events
        const events = JSON.parse(await fs.readFile(resourcesFile, "utf8"));

        // Find event index by ID
        const index = events.findIndex(event => event.id == id);
        if (index === -1) {
            return { success: false, message: "Event not found." };
        }

        // Apply new values
        events[index] = {
            ...events[index],
            name,
            description,
            date,
            time,
            location,
            image
        };

        // Save updated data back to file
        await fs.writeFile(resourcesFile, JSON.stringify(events, null, 2));

        return { success: true, message: "Event updated successfully!", updatedEvent: events[index] };

    } catch (error) {
        // Return structured error message
        return { success: false, message: "Server error: " + error.message };
    }
}

module.exports = { editEvent };
