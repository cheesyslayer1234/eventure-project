var express = require('express');
var bodyParser = require('body-parser');
var app = express();
const PORT = process.env.PORT || 5050;
var startPage = 'index.html';

// Parse incoming request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Import backend handlers
const { viewEvents } = require('./utils/ViewEventUtil');
const { deleteEvent } = require('./utils/MikealLeowUtil');
const { addEvent } = require('./utils/MalcolmNgUtil');
const { editEvent } = require('./utils/HugoYeeUtil');

// API: View Events (must come before express.static)
app.get('/view-events', viewEvents);

// API: Add Event (from add-event branch)
app.post('/add-event', addEvent);

// API: Edit Event (from edit-event branch)
app.put('/edit-event/:id', async (req, res) => {
  try {
    // Run the update logic
    const result = await editEvent(req, res);

    // Stop if response already sent inside the utility
    if (res.headersSent) return;

    // Send success or error result
    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }

  } catch (error) {
    console.error("Edit event error:", error);
    // Server error fallback
    return res.status(500).json({
      success: false,
      message: "Server error while updating event."
    });
  }
});

// API: Delete Event
app.delete('/delete-event/:id', async (req, res) => {
  const id = req.params.id;
  const result = await deleteEvent(id);

  if (result.success) {
    return res.status(200).json(result);
  } else {
    return res.status(400).json(result);
  }
});


// Serve static frontend files
app.use(express.static('./public'));

// Default route loader
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/' + startPage);
});

// Start server
const server = app.listen(PORT, function () {
  const address = server.address();
  const baseUrl = `http://${address.address === '::' ? 'localhost' : address.address}:${address.port}`;
  console.log(`Demo project at: ${baseUrl}`);
});

module.exports = { app, server };

// Extra comments. 