// background.js - Handles context menu and message passing

// Store selected text
let selectedText = '';

// Create a context menu item when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "sendToChromeLlama",
    title: "Send to ChromeLlama",
    contexts: ["selection"]
  });
});

// Listen for context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "sendToChromeLlama" && info.selectionText) {
    // Store the selected text
    selectedText = info.selectionText;
    
    // Open the popup
    chrome.action.openPopup();
  }
});

// Provide the selected text when requested
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getSelectedText") {
    sendResponse({ text: selectedText });
    // Clear the text after sending it
    selectedText = '';
  }
});