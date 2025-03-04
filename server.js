// server.js
'use strict';

// Import required modules
const express = require("express");
const app = express();
const http = require("http").createServer(app);
const cors = require("cors");
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const { encode } = require("gpt-3-encoder"); // Import encoder

// Define the port for the server to listen on
const PORT = process.env.PORT || 5000;
let server = http.listen(PORT, () => {
  console.log(`Server running at http://127.0.0.1:${PORT}`);
});

// Middleware setup
app.use(cors()); // Enable Cross-Origin Resource Sharing (CORS)
app.use(express.static(__dirname + '/static')); // Serve static files from the 'static' directory
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(express.json()); // Parse JSON request bodies

// Import and use AI-related routes
const aiRoutes = require('./routes/aiRoutes');
app.use('/api', aiRoutes);

// Define the root route to serve the index.html file
app.get('/', function (request, response) {
  response.sendFile(__dirname + '/static/html/index.html', function (err) {
    if (err) {
      response.send(err.message); // Send error message if file cannot be served
    }
  });
});

app.post("/tokenize", (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }
    const tokenCount = encode(message).length;
    res.json({ tokenCount });
  } catch (error) {
    console.error("Tokenization error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// Serve models.json as an API response
app.get('/models', (req, res) => {
  const modelsPath = path.join(__dirname, 'config/models.json'); // ✅ Ensure this path is correct

  fs.readFile(modelsPath, 'utf8', (err, data) => {
    if (err) {
      console.error("Error reading models.json:", err);
      return res.status(500).json({ error: "Failed to load models" });
    }

    try {
      const models = JSON.parse(data);
      res.json(models);
    } catch (parseError) {
      console.error("Error parsing models.json:", parseError);
      res.status(500).json({ error: "Invalid JSON format in models.json" });
    }
  });
});
