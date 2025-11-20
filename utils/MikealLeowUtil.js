// utils/MikealLeowUtil.js
const fs = require('fs').promises;

async function deleteEvent(id) {
  try {
    // Read events file
    const data = await fs.readFile('./utils/events.json', 'utf8');
    const events = data ? JSON.parse(data) : [];

    if (!Array.isArray(events)) {
      return {
        success: false,
        message: 'Invalid events data.'
      };
    }

    // Find event by id
    const index = events.findIndex(event => String(event.id) === String(id));

    if (index === -1) {
      return {
        success: false,
        message: 'Event not found.'
      };
    }

    // Remove event
    events.splice(index, 1);

    // Save updated list
    await fs.writeFile('./utils/events.json', JSON.stringify(events, null, 2));

    return {
      success: true,
      message: 'Event deleted successfully.'
    };
  } catch (error) {
    console.error('Error in deleteEvent:', error);
    return {
      success: false,
      message: 'Internal Server Error.'
    };
  }
}

module.exports = { deleteEvent };
