var express = require('express');
var bodyParser = require('body-parser');
var app = express();
const PORT = process.env.PORT || 5050;
var startPage = 'index.html';

app.use(bodyParser.urlencoded({ extended: true })); // Parse incoming request bodies
app.use(bodyParser.json());

const { viewEvents } = require('./utils/ViewEventUtil'); // API: View Events (must come before express.static)
app.get('/view-events', viewEvents);

// Import backend handlers
const { addEvent } = require('./utils/MalcolmNgUtil'); // API: Add Event (from add-event branch)
app.post('/add-event', async (req, res) => {
  try {
    const events = await addEvent(req.body);
    res.status(201).json(events);
  } catch (err) {
    if (err.message === 'VALIDATION_ERROR') {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    res.status(500).json({ message: err.message });
  }
});


const { editEvent } = require('./utils/HugoYeeUtil'); // API: Edit Event (from edit-event branch)
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

const { deleteEvent } = require('./utils/MikealLeowUtil'); // API: Delete Event
app.delete('/delete-event/:id', async (req, res) => {
  const id = req.params.id;
  const result = await deleteEvent(id);

  if (result.success) {
    return res.status(200).json(result);
  } else {
    return res.status(400).json(result);
  }
});

app.use(express.static('./public')); // Serve static frontend files
app.get('/', (req, res) => { // Default route loader
  res.sendFile(__dirname + '/public/' + startPage);
});

const server = app.listen(PORT, function () { // Start server
  const address = server.address();
  const baseUrl = `http://${address.address === '::' ? 'localhost' : address.address}:${address.port}`;
  console.log(`Demo project at: ${baseUrl}`);
});

module.exports = { app, server };