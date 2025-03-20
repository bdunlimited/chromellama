# ChromeLlama

A Chrome extension for chatting with your local Ollama models.

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the directory containing this extension

## Configuration

1. On your Ollama host system, you may need to set the following environment variable to allow the extension to connect:

OLLAMA_ORIGINS=chrome-extension://*


2. In the extension:
   - In "Details", "Pin" the extension to the toolbar.
   - Set your Ollama server URL (default: http://localhost:11434)
   - Click "Refresh Models" to load available models from your Ollama server
   - Select a model to use
   - Adjust temperature and context length settings as needed
   - Set a custom system prompt if desired

## Features

- Chat with any Ollama model
- Dark/Light theme toggle
- Adjustable model parameters
- Chat history with option to clear
- Server connection settings
- Customizable system prompts

## Note

Make sure your Ollama server is running and accessible at the configured URL before using the extension.