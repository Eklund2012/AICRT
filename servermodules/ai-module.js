//ai-module.js
'use strict';

// Import OpenAI SDK
require('dotenv').config();
const { OpenAI } = require("openai");

// Load environment variables
const API_KEY = process.env.API_KEY
const BASE_URL = process.env.BASE_URL;
const systemPrompt = process.env.SYSTEM_PROMPT;
const userPrompt = process.env.USER_PROMPT_SHORT;

if (!API_KEY) {
  throw new Error("Missing API key.");
}

const api = new OpenAI({
  apiKey: API_KEY,
  baseURL: BASE_URL,
});

/**
 * Function to analyze code using AI model.
 * @param {string} code - The input code to be analyzed.
 * @returns {Promise<string>} - AI-generated feedback and suggestions.
 */
const analyze_with_ai = async (code, aiModel, temp, _top_p) => {
  const body = {
    model: aiModel, // AI model used for analysis
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userPrompt + code,
      },
    ],
    temperature: 0.7, // Controls randomness of responses
    //top_p: _top_p, // Controls diversity of responses
    max_tokens: 512, // Limits response length
  };

  try {
    console.log("Sending request to AIML API:", body);

    // Request AI-generated response
    const completion = await api.chat.completions.create(body);
    const response = completion.choices[0].message.content;

    console.log("Response from AIML API:", response);
    return response;  // Return the AI response
  } catch (error) {
    if (error.status == 429) {
      console.error('Rate limit exceeded. Please wait and try again later.');
      return "Rate limit exceeded. Please wait and try again later.";
    } else {
      console.error('An error occurred:', error);
      return 'Error in ai-module.js';
    }
  }
};

// Export function for use in other modules
module.exports = { analyze_with_ai };