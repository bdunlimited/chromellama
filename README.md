<p align="center">
  <img src="https://img.shields.io/badge/Platform-Chrome-4285F4?style=for-the-badge&logo=google-chrome&logoColor=white">
  <img src="https://img.shields.io/badge/Type-Extension-green?style=for-the-badge">
</p>

<div align="center">

<h1>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=40&duration=3000&pause=1000&color=6495ED&center=true&vCenter=true&width=435&lines=ChromeLlama">
    <source media="(prefers-color-scheme: light)" srcset="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=40&duration=3000&pause=1000&color=1E3A8A&center=true&vCenter=true&width=435&lines=ChromeLlama">
    <img alt="ChromeLlama" src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=40&duration=3000&pause=1000&color=1E3A8A&center=true&vCenter=true&width=435&lines=ChromeLlama">
  </picture>
</h1>

<p>A Chrome extension for chatting with your local Ollama models</p>

---
</div>

## 🚀 Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the directory containing this extension

## ⚙️ Configuration

### Server Setup

On your Ollama host system, you may need to set the following environment variable to allow the extension to connect:

```bash
OLLAMA_ORIGINS=chrome-extension://*
```

### Extension Setup

1. In "Details", "Pin" the extension to the toolbar
2. Set your Ollama server URL (default: `http://localhost:11434`)
3. Click "Refresh Models" to load available models from your Ollama server
4. Select a model to use
5. Adjust temperature and context length settings as needed
6. Set a custom system prompt if desired

## ✨ Features

- 🤖 Chat with any Ollama model
- 🌓 Dark/Light theme toggle
- 🎛️ Adjustable model parameters
- 💬 Chat history with option to clear
- 🔧 Server connection settings
- 🎯 Customizable system prompts
- 📝 Send selected text from any webpage to the chat (right-click and choose "Send to ChromeLlama")

## 📋 Using the Text Selection Feature

1. Select text on any webpage
2. Right-click on the selected text
3. Choose "Send to ChromeLlama" from the context menu
4. The extension popup will open with your selected text already inserted in the chat input
5. Press the send button or Enter to send the query

## 📝 Note

Make sure your Ollama server is running and accessible at the configured URL before using the extension.