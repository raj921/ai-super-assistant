// Create and inject the floating UI
const createFloatingUI = () => {
  const container = document.createElement('div');
  container.id = 'ai-assistant-container';
  container.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: white;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    z-index: 10000;
    max-width: 300px;
    display: none;
  `;

  const resultBox = document.createElement('div');
  resultBox.id = 'ai-assistant-result';
  resultBox.style.cssText = `
    margin-bottom: 10px;
    padding: 10px;
    background: #f8f9fa;
    border-radius: 4px;
    font-size: 14px;
    line-height: 1.4;
  `;

  const closeButton = document.createElement('button');
  closeButton.textContent = 'Close';
  closeButton.style.cssText = `
    background: #4285f4;
    color: white;
    border: none;
    padding: 8px 15px;
    border-radius: 4px;
    cursor: pointer;
  `;

  closeButton.onclick = () => {
    container.style.display = 'none';
  };

  container.appendChild(resultBox);
  container.appendChild(closeButton);
  document.body.appendChild(container);
};

// Initialize the UI
createFloatingUI();

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const container = document.getElementById('ai-assistant-container');
  const resultBox = document.getElementById('ai-assistant-result');

  if (message.action === 'showResult') {
    resultBox.textContent = message.result;
    container.style.display = 'block';
  } else if (message.action === 'showError') {
    resultBox.textContent = 'Error: ' + message.error;
    container.style.display = 'block';
  }
});

// Add keyboard shortcut to hide the UI
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const container = document.getElementById('ai-assistant-container');
    if (container) {
      container.style.display = 'none';
    }
  }
});

// Function to handle text selection
document.addEventListener('mouseup', () => {
  const selectedText = window.getSelection().toString().trim();
  if (selectedText.length > 0) {
    // Show the context menu (handled by Chrome)
  }
});
