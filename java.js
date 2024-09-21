// Check if the browser supports speech recognition
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.interimResults = false;
recognition.lang = 'en-US';  // Set language to English

const resultDisplay = document.getElementById('result');
const voiceInputDisplay = document.getElementById('voiceInput');
const micButton = document.getElementById('micButton');

// Calculator state
let currentInput = '';
let operator = '';
let firstOperand = '';
let secondOperand = '';

// Update the result display
function updateDisplay(value) {
    resultDisplay.textContent = value;
}

// Clear calculator
function clearCalculator() {
    currentInput = '';
    operator = '';
    firstOperand = '';
    secondOperand = '';
    updateDisplay(0);
}

// Speak the result using SpeechSynthesis
function speakResult(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';  // Set language to English
    window.speechSynthesis.speak(utterance);
}

// Handle calculator button clicks
document.querySelectorAll('.calc-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        const value = e.target.textContent;
        if (value === 'C') {
            clearCalculator();
        } else if (value === '=') {
            // Evaluate the expression
            try {
                const result = eval(currentInput);
                updateDisplay(result);
                speakResult(result);  // Speak the result after calculation
                currentInput = result;
            } catch (error) {
                updateDisplay('Error');
                speakResult('Error');  // Speak error
            }
        } else {
            currentInput += value;
            updateDisplay(currentInput);
        }
    });
});

// Event listener for the mic button to start recognition
micButton.addEventListener('click', () => {
    recognition.start();
    resultDisplay.textContent = "Listening...";
    voiceInputDisplay.textContent = "Listening for input...";
    micButton.disabled = true;  // Disable button while listening
});

// Process voice input for calculation
recognition.addEventListener('result', event => {
    const voiceInput = event.results[0][0].transcript.toLowerCase();
    voiceInputDisplay.textContent = `You said: "${voiceInput}"`;

    // Clean up the voice input to prepare for calculation
    const processedInput = voiceInput.replace(/plus/g, "+")
                                     .replace(/minus/g, "-")
                                     .replace(/times/g, "*")
                                     .replace(/multiplied by/g, "*")
                                      .replace(/Multiplication by/g, "×")
                                     .replace(/multiplication/g, "*")
                                     .replace(/into/g, "*")
                                     .replace(/divided by/g, "/")
                                     .replace(/x/g, "*");  // Added this line to handle "x"

    // Attempt to evaluate the expression
    try {
        const result = eval(processedInput);
        if (isNaN(result) || result === undefined) {
            updateDisplay('Invalid calculation');
            speakResult('Invalid calculation');  // Speak invalid calculation
        } else {
            updateDisplay(result);
            speakResult(result);  // Speak the result
        }
    } catch (error) {
        updateDisplay('Error: Invalid calculation');
        speakResult('Error: Invalid calculation');  // Speak error message
    }

    micButton.disabled = false;
});

// Handle errors in speech recognition
recognition.addEventListener('error', event => {
    resultDisplay.textContent = `Error occurred: ${event.error}`;
    micButton.disabled = false;
    speakResult(`Error occurred: ${event.error}`);  // Speak error
});
