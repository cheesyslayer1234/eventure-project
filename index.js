var express = require('express');
var bodyParser = require('body-parser');
var app = express();
const PORT = process.env.PORT || 5050;
var startPage = 'index.html';

// Parse request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Import the View Events handler
const { viewEvents } = require('./utils/ViewEventUtil');

// ✅ API route to return events as JSON (must come BEFORE express.static)
app.get('/view-events', viewEvents);

// Serve static files (HTML, CSS, JS) from the public folder
app.use(express.static('./public'));

// Default route – serve main page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/' + startPage);
});

// Start server
const server = app.listen(PORT, function () {
  const address = server.address();
  const baseUrl = `http://${address.address == '::' ? 'localhost' : address.address}:${address.port}`;
  console.log(`Demo project at: ${baseUrl}`);
});

module.exports = { app, server };
