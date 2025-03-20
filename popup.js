// Global variables to store our chat history and settings
let chatHistory = [];
let ollamaSettings = {
  serverUrl: "http://localhost:11434",
  model: "",
  temperature: 0.7,
  numCtx: 4096,
  systemPrompt: "You are a helpful assistant.",
  theme: "light",
  settingsVisible: true
};

// DOM elements
const serverUrlInput = document.getElementById('server-url');
const modelSelect = document.getElementById('model-select');
const refreshModelsButton = document.getElementById('refresh-models');
const temperatureInput = document.getElementById('temperature');
const temperatureValue = document.getElementById('temperature-value');
const numCtxInput = document.getElementById('num-ctx');
const systemPromptInput = document.getElementById('system-prompt');
const saveSettingsButton = document.getElementById('save-settings');
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendMessageButton = document.getElementById('send-message');
const themeToggleButton = document.getElementById('theme-toggle');
const settingsToggleButton = document.getElementById('settings-toggle');
const settingsPanel = document.getElementById('settings-panel');
const clearChatButton = document.getElementById('clear-chat');
const settingsNotification = document.getElementById('settings-notification');
const refreshNotification = document.getElementById('refresh-notification');

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Load settings from storage
  loadSettings();
  
  // Add event listeners
  refreshModelsButton.addEventListener('click', fetchModels);
  temperatureInput.addEventListener('input', updateTemperatureValue);
  saveSettingsButton.addEventListener('click', saveSettings);
  sendMessageButton.addEventListener('click', sendMessage);
  themeToggleButton.addEventListener('click', toggleTheme);
  settingsToggleButton.addEventListener('click', toggleSettings);
  clearChatButton.addEventListener('click', clearChat);
  
  userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Check for selected text from context menu
  checkForSelectedText();
});

// Check if there's selected text from the background script
function checkForSelectedText() {
  chrome.runtime.sendMessage({ action: "getSelectedText" }, (response) => {
    if (response && response.text) {
      // Insert the text into the input field
      userInput.value = response.text;
      
      // Focus the input field
      userInput.focus();
      
      // Show a notification to the user
      showNotification("Text from browser page added to chat input");
    }
  });
}

// Load settings from Chrome storage
function loadSettings() {
  chrome.storage.sync.get(['ollamaSettings', 'chatHistory'], (data) => {
    if (data.ollamaSettings) {
      ollamaSettings = data.ollamaSettings;
      
      // Update UI with loaded settings
      serverUrlInput.value = ollamaSettings.serverUrl;
      temperatureInput.value = ollamaSettings.temperature;
      temperatureValue.textContent = ollamaSettings.temperature;
      numCtxInput.value = ollamaSettings.numCtx;
      systemPromptInput.value = ollamaSettings.systemPrompt;
      
      // Apply theme
      document.body.setAttribute('data-theme', ollamaSettings.theme);
      
      // Apply settings visibility
      if (!ollamaSettings.settingsVisible) {
        settingsPanel.classList.add('hidden');
      }
      
      // Fetch models and select the saved one
      fetchModels(ollamaSettings.model);
    }
    
    if (data.chatHistory) {
      chatHistory = data.chatHistory;
      renderChatHistory();
    }
  });
}

// Toggle theme between light and dark
function toggleTheme() {
  ollamaSettings.theme = ollamaSettings.theme === 'light' ? 'dark' : 'light';
  document.body.setAttribute('data-theme', ollamaSettings.theme);
  saveSettings();
}

// Toggle settings panel visibility
function toggleSettings() {
  ollamaSettings.settingsVisible = !ollamaSettings.settingsVisible;
  settingsPanel.classList.toggle('hidden');
  saveSettings();
}

// Save settings to Chrome storage
function saveSettings() {
  ollamaSettings = {
    serverUrl: serverUrlInput.value.trim(),
    model: modelSelect.value,
    temperature: parseFloat(temperatureInput.value),
    numCtx: parseInt(numCtxInput.value),
    systemPrompt: systemPromptInput.value.trim(),
    theme: ollamaSettings.theme,
    settingsVisible: ollamaSettings.settingsVisible
  };
  
  chrome.storage.sync.set({ ollamaSettings }, () => {
    showButtonNotification(settingsNotification, 'Settings saved!');
  });
}

// Fetch available models from Ollama server directly
async function fetchModels(selectedModel = null) {
  const serverUrl = serverUrlInput.value.trim() || "http://localhost:11434";
  
  // Clear existing options except the first one
  while (modelSelect.options.length > 1) {
    modelSelect.remove(1);
  }
  
  try {
    const response = await fetch(`${serverUrl}/api/tags`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.models && data.models.length > 0) {
      // Add models to the select element
      data.models.forEach(model => {
        const option = document.createElement('option');
        option.value = model.name;
        option.textContent = model.name;
        modelSelect.appendChild(option);
        
        // Select the previously selected model if provided
        if (selectedModel && model.name === selectedModel) {
          modelSelect.value = selectedModel;
        }
      });
      
      showButtonNotification(refreshNotification, `Found ${data.models.length} models!`);
    } else {
      showButtonNotification(refreshNotification, 'No models found on the server');
    }
  } catch (error) {
    console.error('Error fetching models:', error);
    showButtonNotification(refreshNotification, `Error connecting to server: ${error.message}`);
  }
}

// Update the temperature value display
function updateTemperatureValue() {
  temperatureValue.textContent = temperatureInput.value;
}

// Send a message to the Ollama server directly
async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;
  
  // Check if model is selected
  if (!ollamaSettings.model && !modelSelect.value) {
    showNotification('Please select a model first');
    return;
  }
  
  // Add user message to chat
  addMessageToChat('user', message);
  userInput.value = '';
  
  // Show typing indicator
  showTypingIndicator();
  
  // Prepare the messages array for the chat API
  const messages = [];
  
  // Add system message if present
  const systemPrompt = systemPromptInput.value.trim() || ollamaSettings.systemPrompt;
  if (systemPrompt) {
    messages.push({
      role: "system",
      content: systemPrompt
    });
  }
  
  // Add chat history
  chatHistory.forEach(msg => {
    messages.push({
      role: msg.role,
      content: msg.content
    });
  });
  
  // Add current message
  messages.push({
    role: "user",
    content: message
  });

  try {
    const serverUrl = serverUrlInput.value.trim() || ollamaSettings.serverUrl;
    const response = await fetch(`${serverUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: modelSelect.value || ollamaSettings.model,
        messages: messages,
        stream: false,
        options: {
          temperature: parseFloat(temperatureInput.value),
          num_ctx: parseInt(numCtxInput.value)
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Remove typing indicator
    removeTypingIndicator();
    
    if (data.message && data.message.content) {
      // Add assistant message to chat
      addMessageToChat('assistant', data.message.content);
      
      // Save updated chat history to storage
      chrome.storage.sync.set({ chatHistory });
    } else {
      showNotification('Invalid response format from Ollama server');
      console.error('Unexpected response format:', data);
    }
  } catch (error) {
    // Remove typing indicator
    removeTypingIndicator();
    console.error('Error sending message:', error);
    showNotification(`Error communicating with Ollama server: ${error.message}`);
  }
}

// Add a message to the chat UI
function addMessageToChat(role, content) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message');
  
  if (role === 'user') {
    messageDiv.classList.add('user-message');
    messageDiv.textContent = content;
  } else {
    messageDiv.classList.add('bot-message');
    messageDiv.textContent = content;
  }
  
  // Add to chat history
  chatHistory.push({ role, content });
  
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show typing indicator in the chat
function showTypingIndicator() {
  const typingDiv = document.createElement('div');
  typingDiv.classList.add('typing-indicator');
  typingDiv.id = 'typing-indicator';
  
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement('span');
    typingDiv.appendChild(dot);
  }
  
  chatMessages.appendChild(typingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Remove typing indicator from the chat
function removeTypingIndicator() {
  const typingIndicator = document.getElementById('typing-indicator');
  if (typingIndicator) {
    typingIndicator.remove();
  }
}

// Render the entire chat history
function renderChatHistory() {
  chatMessages.innerHTML = '';
  chatHistory.forEach(message => {
    addMessageToChat(message.role, message.content);
  });
}

// Clear chat history
function clearChat() {
  chatHistory = [];
  chrome.storage.sync.set({ chatHistory });
  chatMessages.innerHTML = '';
}

// Show a notification for a specific button
function showButtonNotification(element, message) {
  element.textContent = message;
  element.style.opacity = '1';
  setTimeout(() => {
    element.style.opacity = '0';
    setTimeout(() => {
      element.textContent = '';
    }, 300);
  }, 2000);
}

// Show a notification message
function showNotification(message) {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.classList.add('notification');
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 2000);
  }, 10);
}