// client-script.js
'use strict';

// Event listener for the analyze button
// This function triggers when the user clicks the 'Analyze Code' button

document.getElementById('analyzeBtn').addEventListener('click', async () => {
    const code = document.getElementById('code').value;  // Get the code input from the text area
    const aiModel = document.getElementById('aiModel').value;
    var temperature = document.getElementById('temperature').value;
    const temperatureNum = Number(temperature);
    const top_p = document.getElementById('top-p').value;
    const top_pNum = Number(top_p);

    if (!code) {
        alert("Please enter some code!"); // Alert the user if no code is entered
        return;
    }

    // Clean up spaces: remove leading/trailing spaces, replace multiple spaces with a single space
    const cleanedCode = code.replace(/\s+/g, ' ').trim(); // Normalize whitespace for better analysis

    try {
        const response = await fetch('api/analyze_code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: cleanedCode, aiModel: aiModel, temp: temperatureNum, top_p: top_pNum })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`); // Handle HTTP errors
        }

        const data = await response.json(); // Parse the JSON response from the server

        // Display suggestions and highlight code parts
        try {
            const outputElement = document.getElementById('output');
            if (outputElement) {
                const { suggestions, language } = data; // Ensure API returns 'language'
        
                if (suggestions) {
                    const langClass = language ? `language-${language}` : "language-none"; // Default to 'none' if unknown
                    outputElement.innerHTML = `<pre><code class="${langClass}">${escapeHtml(suggestions)}</code></pre>`;
                    Prism.highlightAll(); // Apply Prism formatting
                } else {
                    outputElement.innerText = 'No suggestions received.';
                }
            } else {
                console.error('Element with id "output" not found.');
            }
        } catch (error) {
            console.error('An error occurred:', error);
        }
    } catch (error) {
        console.error("Error occurred:", error); // Log errors to the console
        document.getElementById('output').innerText = `Error: ${error.message}`; // Display error messages to the user
    }
});

// Function to escape HTML (to prevent security issues like XSS)
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Fetch available AI models and populate dropdown with descriptions
async function loadModels() {
    try {
        // Fetch models with descriptions
        const response = await fetch('/models');
        if (!response.ok) throw new Error("Failed to load models");
        const data = await response.json();

        const modelSelect = document.getElementById('aiModel');
        const descriptionContainer = document.getElementById('modelDescription');

        // Populate dropdown with model names
        modelSelect.innerHTML = data.models
            .map(model => `<option value="${model.id}">${model.info.name}</option>`)
            .join('');

        // Display description when a model is selected
        modelSelect.addEventListener('change', function () {
            const selectedModel = data.models.find(m => m.id === this.value);

            if (selectedModel) {
                descriptionContainer.innerHTML = `
                    <h5>${selectedModel.info.name}</h5>
                    <p><strong>Developer:</strong> ${selectedModel.info.developer}</p>
                    <p>${selectedModel.info.description}</p>
                `;
            } else {
                descriptionContainer.innerHTML = "<p class='text-muted'>No description available.</p>";
            }
        });

        // Trigger change event to display the first model's description by default
        modelSelect.dispatchEvent(new Event('change'));

    } catch (error) {
        console.error("Error loading models:", error);
    }
}

// Run the function on page load
document.addEventListener("DOMContentLoaded", loadModels);

document.getElementById('temperature').addEventListener('input', function () {
    document.getElementById('temperatureValue').textContent = this.value;
});

document.getElementById('top-p').addEventListener('input', function () {
    document.getElementById('top_pValue').textContent = this.value;
});

// Enable all tooltips on the page
const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
});

