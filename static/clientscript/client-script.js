// client-script.js
'use strict';
// Event listener for the analyze button
// This function triggers when the user clicks the 'Analyze Code' button

async function countTokens(message) {
    const response = await fetch('/tokenize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
    });

    const data = await response.json();
    return data.tokenCount;
}

// Example: Call this function when input changes
document.getElementById('code').addEventListener('input', async function () {
    const message = this.value.trim();
    if (message) {
        const tokens = await countTokens(message); // Await the token count

        const analyzeBtn = document.getElementById('analyzeBtn');
        const codeInfo = document.getElementById('codeInfo');

        if (tokens > 100) {
            analyzeBtn.disabled = true;
            codeInfo.textContent = `Tokens: ${tokens}/100 (Max limit exceeded)`;
            codeInfo.classList.add('text-danger');
        } else {
            analyzeBtn.disabled = false;
            codeInfo.textContent = `Tokens: ${tokens}/100`;
            codeInfo.classList.remove('text-danger');
        }
    }
});

document.getElementById('analyzeBtn').addEventListener('click', async () => {
    console.log("Analyze button clicked");
    const code_messy = document.getElementById('code').value.trim();
    const aiModel = document.getElementById('aiModel').value;
    const temperature = Number(document.getElementById('temperature').value);
    const top_p = Number(document.getElementById('top-p').value);

    const code_no_linebreaks = code_messy.replace(/(\r\n|\n|\r)/gm, "");
    const code = code_no_linebreaks.replace(/\s/g, '');

    if (!code) {
        alert("Please enter some code!");
        return;
    }

    try {
        const response = await fetch('/api/analyze_code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, aiModel, temp: temperature, top_p })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        const outputElement = document.getElementById('output');
        outputElement.innerHTML = `<pre>${escapeHtml(data.suggestions)}</pre>`;

    } catch (error) {
        console.error("Error occurred:", error);
        spinner.classList.add('d-none'); // Hide spinner on error
        document.getElementById('output').textContent = `Error: ${error.message}`;
    }
});


// Function to escape HTML to prevent XSS attacks
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

document.getElementById("clearTextBtn").addEventListener("click", function () {
    document.getElementById("code").value = "";
    document.getElementById('codeInfo').textContent = "Tokens: " + "0/100";
    document.getElementById('codeInfo').classList.remove('text-danger');
});

