const fs = require('fs').promises;
const path = require('path');
const { Event } = require('../models/Event');

const RESOURCES_FILE = path.join(__dirname, 'events.json');
const TEMPLATE_FILE = path.join(__dirname, 'event.template.json');

async function addEvent(req, res) {
    try {
        const { name, description, date, time, location, image } = req.body;

        if (!name || !description || !date || !time || !location || !image) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const newEvent = new Event(name, description, date, time, location, image);

        let resources = [];

        try {
            const data = await fs.readFile(RESOURCES_FILE, 'utf8');
            resources = JSON.parse(data);
        } catch (err) {
            if (err.code === 'ENOENT') {
                const templateData = await fs.readFile(TEMPLATE_FILE, 'utf8');
                resources = JSON.parse(templateData);
                await fs.writeFile(RESOURCES_FILE, JSON.stringify(resources, null, 2));
            } else {
                throw err;
            }
        }

        resources.push(newEvent);
        await fs.writeFile(RESOURCES_FILE, JSON.stringify(resources, null, 2));

        return res.status(201).json(newEvent);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
}

module.exports = { addEvent };
