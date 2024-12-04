const GEMINI_API_KEY = 'AIzaSyAbEzlFgyk2xOSAjOJXtOThtG4JUhXOOqM';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// Initialize context menu items
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'aiAssistant',
    title: 'AI Assistant',
    contexts: ['selection']
  });
  
  chrome.contextMenus.create({
    id: 'summarize',
    title: 'Summarize',
    parentId: 'aiAssistant',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'explain',
    title: 'Explain',
    parentId: 'aiAssistant',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'translate',
    title: 'Translate',
    parentId: 'aiAssistant',
    contexts: ['selection']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const selectedText = info.selectionText;
  let prompt = '';

  switch (info.menuItemId) {
    case 'summarize':
      prompt = `Summarize this text concisely: ${selectedText}`;
      break;
    case 'explain':
      prompt = `Explain this in simple terms: ${selectedText}`;
      break;
    case 'translate':
      prompt = `Translate this text to English if it's not in English, or to Spanish if it's in English: ${selectedText}`;
      break;
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    const data = await response.json();
    const result = data.candidates[0].content.parts[0].text;

    // Send result to content script
    chrome.tabs.sendMessage(tab.id, {
      action: 'showResult',
      result: result
    });
  } catch (error) {
    console.error('Error:', error);
    chrome.tabs.sendMessage(tab.id, {
      action: 'showError',
      error: 'Failed to process request'
    });
  }
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'processText') {
    processWithGemini(request.text, request.type)
      .then(result => sendResponse({ result }))
      .catch(error => sendResponse({ error: error.message }));
    return true; // Will respond asynchronously
  }
});

async function processWithGemini(text, type) {
  let prompt = '';
  switch (type) {
    case 'summarize':
      prompt = `Provide a concise summary of: ${text}`;
      break;
    case 'analyze':
      prompt = `Analyze this text and provide key insights: ${text}`;
      break;
    case 'simplify':
      prompt = `Simplify this text for better understanding: ${text}`;
      break;
    default:
      prompt = text;
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    })
  });

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}
