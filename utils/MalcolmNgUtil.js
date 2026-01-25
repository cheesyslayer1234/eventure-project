const fs = require('fs').promises; // Promises API for file operations
const path = require('path'); // For handling file paths
const { Event } = require('../models/Event'); // Import Event model
const RESOURCES_FILE = path.join(__dirname, 'events.json'); // Path to events.json

// Simple write lock to ensure sequential writes
let writeLock = Promise.resolve();
async function addEvent(eventData) {
    const { name, description, date, time, location, image } = eventData;

    // Basic validation
    if (!name || !description || !date || !time || !location || !image) {
        throw new Error('VALIDATION_ERROR');
    }

    const newEvent = new Event(name, description, date, time, location, image);
    let newResources = [];

    // --- Sequential write to avoid race conditions ---
    writeLock = writeLock.then(async () => {
        let resources = [];

        // Read existing events (if any)
        try {
            const data = await fs.readFile(RESOURCES_FILE, 'utf8');
            if (data && data.trim() !== '') {
                resources = JSON.parse(data);
            }
        } catch (err) {
            if (err.code !== 'ENOENT') throw err; // Only ignore if file doesn't exist
            resources = [];
        }

        resources.push(newEvent);

        // Write updated events; will throw if write fails
        await fs.writeFile(RESOURCES_FILE, JSON.stringify(resources, null, 2));

        newResources = resources;
    });

    // Wait for writeLock; any error in the above block will propagate
    await writeLock;

    return newResources;
}

module.exports = { addEvent };
