const fs = require('fs').promises;
const path = require('path');

const RESOURCES_FILE = path.join(__dirname, 'events.json');

async function editEvent(req, res) {
    try {
        const id = req.params.id;
        const { name, description, date, time, location, image } = req.body;

        // Validation
        if (!name || !description || !date || !time || !location || !image) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Load existing events
        let events = JSON.parse(await fs.readFile(RESOURCES_FILE, "utf8"));

        // Find by ID
        const index = events.findIndex(e => e.id == id);

        if (index === -1) {
            return res.status(404).json({ message: "Event not found" });
        }

        // Update event fields
        events[index] = {
            ...events[index],
            name,
            description,
            date,
            time,
            location,
            image
        };

        // Save back to file
        await fs.writeFile(RESOURCES_FILE, JSON.stringify(events, null, 2));

        return res.status(200).json({ message: "Event updated successfully!" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
}

module.exports = { editEvent };
