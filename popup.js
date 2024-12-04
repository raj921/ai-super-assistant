document.addEventListener('DOMContentLoaded', () => {
  // Tab switching
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      const tabContents = document.querySelectorAll('.tab-content');
      tabContents.forEach(content => {
        content.style.display = 'none';
      });
      
      const targetTab = document.getElementById(`${tab.dataset.tab}-tab`);
      if (targetTab) {
        targetTab.style.display = 'block';
      }
    });
  });

  // Quick action buttons
  const actionButtons = {
    summarize: document.getElementById('summarize'),
    translate: document.getElementById('translate'),
    explain: document.getElementById('explain'),
    rewrite: document.getElementById('rewrite')
  };

  // Handle quick actions
  Object.entries(actionButtons).forEach(([action, button]) => {
    button.addEventListener('click', async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => window.getSelection().toString().trim()
      }, async (results) => {
        const selectedText = results[0].result;
        
        if (!selectedText) {
          showResult('Please select some text first!');
          return;
        }

        showLoading(true);
        try {
          const response = await chrome.runtime.sendMessage({
            action: 'processText',
            text: selectedText,
            type: action
          });

          if (response.error) {
            showResult(`Error: ${response.error}`);
          } else {
            showResult(response.result);
          }
        } catch (error) {
          showResult(`Error: ${error.message}`);
        }
        showLoading(false);
      });
    });
  });

  // Advanced tab processing
  const processButton = document.getElementById('process');
  processButton.addEventListener('click', async () => {
    const inputText = document.getElementById('input-text').value.trim();
    
    if (!inputText) {
      showResult('Please enter some text to process!');
      return;
    }

    showLoading(true);
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'processText',
        text: inputText,
        type: 'analyze'
      });

      if (response.error) {
        showResult(`Error: ${response.error}`);
      } else {
        showResult(response.result);
      }
    } catch (error) {
      showResult(`Error: ${error.message}`);
    }
    showLoading(false);
  });
});

function showResult(text) {
  const resultDiv = document.getElementById('result');
  resultDiv.textContent = text;
  resultDiv.style.display = 'block';
}

function showLoading(show) {
  const loading = document.getElementById('loading');
  loading.style.display = show ? 'block' : 'none';
}
