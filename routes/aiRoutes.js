// routes/aiRoutes.js - Handles AI-based code analysis requests
'use strict';

const express = require('express');
const router = express.Router(); // Create a new router instance

// Error handling for AI module import
let analyze_with_ai;
try {
  ({ analyze_with_ai } = require("../servermodules/ai-module"));
} catch (error) {
  console.error("Error loading AI module:", error.message);
  process.exit(1); // Exit if AI module can't be loaded
}

function isNumber(n) { return !isNaN(parseFloat(n)) && !isNaN(n - 0) }

// Define the route for '/analyze' under the '/api' prefix
router.post('/analyze_code', async (req, res) => {
  const { code, aiModel, temp, top_p } = req.body; // Extract 'code' and 'aiModel' from request body

  // Validate input
  if (!code) {
    return res.status(400).json({ error: "No code provided" });
  }

  if (!aiModel) {
    return res.status(400).json({ error: "No AI model selected" }); // Ensure aiModel is selected
  }

  if (!temp || !isNumber(temp)) {
    return res.status(400).json({ error: "No temperature selected" }); // Ensure temp is selected
  }

  if (!top_p || !isNumber(top_p)) {
    return res.status(400).json({ error: "No top_p selected" }); // Ensure temp is selected
  }

  try {
    // Process the code using AI analysis module
    const aiResponse = await analyze_with_ai(code, aiModel, temp, top_p); // Pass the aiModel to the analyze function
    return res.json({ suggestions: aiResponse }); // Send AI suggestions as JSON response
  } catch (error) {
    console.error("Error analyzing code:", error.message);
    return res.status(500).json({ error: "Something went wrong with AI analysis." });
  }
});

// Export the router to be used in the main server file
module.exports = router;
