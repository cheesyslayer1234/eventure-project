const fs = require('fs').promises;
const path = require('path');

const RESOURCES_FILE = path.join(__dirname, 'events.json');

async function editEvent(req) {
    try {
        const id = req.params.id;
        const { name, description, date, time, location, image } = req.body;

        if (!name || !description || !date || !time || !location || !image) {
            return { success: false, message: "All fields are required." };
        }

        let events = JSON.parse(await fs.readFile(RESOURCES_FILE, "utf8"));
        const index = events.findIndex(e => e.id == id);

        if (index === -1) {
            return { success: false, message: "Event not found." };
        }

        events[index] = { ...events[index], name, description, date, time, location, image };
        await fs.writeFile(RESOURCES_FILE, JSON.stringify(events, null, 2));

        return { success: true, message: "Event updated successfully!", updatedEvent: events[index] };

    } catch (error) {
        return { success: false, message: "Server error: " + error.message };
    }
}

module.exports = { editEvent };
