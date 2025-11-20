const fs = require('fs').promises;
const path = require('path');

const RESOURCES_FILE = path.join('utils', 'events.json');

async function viewEvents(req, res) {
    try {
        const data = await fs.readFile(RESOURCES_FILE, 'utf8');
        const events = JSON.parse(data);
        return res.status(200).json(events);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return res.status(200).json([]); // empty list
        }
        return res.status(500).json({ message: error.message });
    }
}

module.exports = { viewEvents };
