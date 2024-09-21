// Check if the browser supports speech recognition
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.interimResults = false;

const resultDisplay = document.getElementById('result');
const voiceInputDisplay = document.getElementById('voiceInput');
const micButton = document.getElementById('micButton');
const historyDisplay = document.getElementById('history');
const languageSelect = document.getElementById('languageSelect');

let currentInput = '';
let history = [];

// Update the result display
function updateDisplay(value) {
    resultDisplay.textContent = value;
}

// Clear calculator
function clearCalculator() {
    currentInput = '';
    updateDisplay(0);
}

// Clear history
function clearHistory() {
    history = [];
    historyDisplay.innerHTML = '';
}

// Speak the result using SpeechSynthesis
function speakResult(text, language) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    window.speechSynthesis.speak(utterance);
}

// Log history
function logHistory(input, result) {
    const timestamp = new Date().toLocaleString();
    history.push({ input, result, timestamp });
    const entry = document.createElement('div');
    entry.classList.add('history-entry');
    entry.textContent = `${timestamp}: ${input} = ${result}`;
    historyDisplay.appendChild(entry);
}

// Handle calculator button clicks
document.querySelectorAll('.calc-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        const value = e.target.textContent;
        if (value === 'C') {
            clearCalculator();
        } else if (value === '←') {
            currentInput = currentInput.slice(0, -1);
            updateDisplay(currentInput || 0);
        } else if (value === '=') {
            try {
                const result = eval(currentInput);
                updateDisplay(result);
                speakResult(result, languageSelect.value);
                logHistory(currentInput, result);
                currentInput = result.toString();
            } catch (error) {
                updateDisplay('Error');
                speakResult('Error', languageSelect.value);
            }
        } else if (value === '%') {
            try {
                currentInput = (eval(currentInput) / 100).toString();
                updateDisplay(currentInput);
                speakResult(currentInput, languageSelect.value);
            } catch (error) {
                updateDisplay('Error');
                speakResult('Error', languageSelect.value);
            }
        } else if (value === '^') {
            currentInput += '**'; // Use ** for exponentiation in JavaScript
            updateDisplay(currentInput);
        } else if (value === '√') {
            try {
                const result = Math.sqrt(eval(currentInput));
                updateDisplay(result);
                speakResult(result, languageSelect.value);
                logHistory(`√${currentInput}`, result);
                currentInput = result.toString();
            } catch (error) {
                updateDisplay('Error');
                speakResult('Error', languageSelect.value);
            }
        } else {
            currentInput += value;
            updateDisplay(currentInput);
        }
    });
});

// Clear history button
document.getElementById('clearHistory-btn').addEventListener('click', clearHistory);

// Event listener for the mic button to start recognition
micButton.addEventListener('click', () => {
    recognition.lang = languageSelect.value;
    recognition.start();
    resultDisplay.textContent = "Listening...";
    voiceInputDisplay.textContent = "Listening for input...";
    micButton.disabled = true;
});

// Process voice input for calculation
recognition.addEventListener('result', event => {
    const voiceInput = event.results[0][0].transcript.toLowerCase();
    voiceInputDisplay.textContent = `You said: "${voiceInput}"`;

    const processedInput = voiceInput
        .replace(/plus/g, "+")
        .replace(/minus/g, "-")
        .replace(/times/g, "*")
        .replace(/multiplied by/g, "*")
        .replace(/multiplication/g, "*")
        .replace(/into/g, "*")
        .replace(/divided by/g, "/")
        .replace(/x/g, "*")
        .replace(/sqrt/g, "√")
        .replace(/power/g, "^"); // Handle voice commands for sqrt and exponentiation

    try {
        const result = eval(processedInput);
        updateDisplay(result);
        speakResult(result, languageSelect.value);
        logHistory(voiceInput, result);
    } catch (error) {
        updateDisplay('Error: Invalid calculation');
        speakResult('Error: Invalid calculation', languageSelect.value);
    }

    micButton.disabled = false;
});

// Handle errors in speech recognition
recognition.addEventListener('error', event => {
    resultDisplay.textContent = `Error occurred: ${event.error}`;
    micButton.disabled = false;
    speakResult(`Error occurred: ${event.error}`, languageSelect.value);
});
