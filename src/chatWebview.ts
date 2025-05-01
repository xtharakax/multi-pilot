import * as vscode from "vscode";
import { marked } from 'marked';

/**
 * Enhanced ChatWebView implementation with a split view for multiple models
 */
export class ChatWebView {
  private static instance: ChatWebView | undefined;
  private panel: vscode.WebviewPanel | undefined;
  private lastUserMessage: string = '';
  private responses: Map<string, string> = new Map(); // model -> response
  private modelNames: string[] = []; // Track available models
  private hiddenModels: Set<string> = new Set(); // Track which models are hidden
  private messageListenerRegistered: boolean = false;
  
  private constructor() {}
  
  /**
   * Get singleton instance of ChatWebView
   */
  public static getInstance(): ChatWebView {
    if (!ChatWebView.instance) {
      ChatWebView.instance = new ChatWebView();
    }
    return ChatWebView.instance;
  }
  
  /**
   * Create or show the webview panel
   */
  public createOrShowWebview(context: vscode.ExtensionContext) {
    // If we already have a panel, show it
    if (this.panel) {
      this.panel.reveal(vscode.ViewColumn.Beside);
      return;
    }
    
    // Otherwise, create a new panel
    this.panel = vscode.window.createWebviewPanel(
      'enhancedChatResponse',
      'AI Model Comparison',
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          vscode.Uri.joinPath(context.extensionUri, 'media')
        ]
      }
    );
    
    // Reset message listener state when panel is disposed
    this.panel.onDidDispose(() => {
      this.panel = undefined;
      this.messageListenerRegistered = false;
    });
    
    // Initial HTML content
    this.panel.webview.html = this.getWebviewContent();
    
    // Set up message handling - only register once per panel instance
    this.setupMessageListener();
  }
  
  /**
   * Set the user message
   */
  public setUserMessage(message: string) {
    this.lastUserMessage = message;
    this.updateWebview();
  }
  
  /**
   * Update response for a specific model
   */
  public async updateModelResponse(modelName: string, response: string) {
    // Add to model names array if not already present
    if (!this.modelNames.includes(modelName)) {
      this.modelNames.push(modelName);
    }

    // Await the formatted response
    const formattedResponse = await this.formatMarkdown(response);

    // Store the resolved string in the responses map
    this.responses.set(modelName, formattedResponse);

    // Update the webview
    this.updateWebview();
  }
  
  /**
   * Toggle model visibility
   */
  public toggleModelVisibility(modelName: string, isVisible: boolean) {
    if (isVisible) {
      this.hiddenModels.delete(modelName);
    } else {
      this.hiddenModels.add(modelName);
    }
    this.updateWebview();
  }
  
  /**
   * Start showing typing indicator for a model
   */
  public startModelResponse(modelName: string) {
    // Add to model names array if not already present
    if (!this.modelNames.includes(modelName)) {
      this.modelNames.push(modelName);
    }

    // Set a loading animation as the initial response
    this.responses.set(modelName, `<div class="typing-indicator">
      <span></span>
      <span></span>
      <span></span>
    </div>`);
    this.updateWebview();
  }
  
  /**
   * Clear the chat
   */
  public clearChat() {
    this.lastUserMessage = '';
    this.responses.clear();
    // Keep the model names to maintain column structure
    this.updateWebview();
  }

  /**
   * Reset model list to clear any previous models
   */
  public resetModels(): void {
    this.modelNames = [];
    this.responses.clear();
    // Note: We don't clear lastUserMessage to preserve context
    this.updateWebview();
    console.log('Model list has been reset');
  }
  
  /**
   * Update the webview content
   */
  private updateWebview() {
    if (this.panel) {
      this.panel.webview.html = this.getWebviewContent();
    }
  }
  
  /**
   * Set up message listener for the webview
   */
  private setupMessageListener(): void {
    if (!this.panel || this.messageListenerRegistered) {
      return;
    }
    
    console.log("Setting up ChatWebView message listener");
    
    this.panel.webview.onDidReceiveMessage(async (message) => {
      console.log("ChatWebView received message:", message);
      switch (message.command) {
        case "clearChat":
          this.clearChat();
          break;
        case "openModelSelection":
          console.log("Received openModelSelection command");
          try {
            await vscode.commands.executeCommand("multi-model-chat-extension.selectModels");
          } catch (error) {
            console.error("Error executing model selection command:", error);
          }
          break;
        case "toggleModelVisibility":
          console.log(`Toggling visibility for model: ${message.modelName}, visible: ${message.isVisible}`);
          this.toggleModelVisibility(message.modelName, message.isVisible);
          break;
      }
    });
    
    this.messageListenerRegistered = true;
  }
  
  /**
   * Generate the HTML content for the webview
   */
  private getWebviewContent(): string {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>AI Model Comparison</title>
      <style>
        :root {
          --user-message-bg: var(--vscode-button-background);
          --user-message-fg: var(--vscode-button-foreground);
          --border-color: var(--vscode-panel-border);
          --hover-bg: var(--vscode-list-hoverBackground);
          --ai-message-bg: var(--vscode-editor-background);
          --ai-message-fg: var(--vscode-editor-foreground);
        }
        
        body {
          font-family: var(--vscode-font-family);
          padding: 0;
          margin: 0;
          color: var(--vscode-editor-foreground);
          background-color: var(--vscode-editor-background);
          display: flex;
          flex-direction: column;
          height: 100vh;
          overflow: hidden;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 15px;
          background-color: var(--vscode-editor-background);
          border-bottom: 1px solid var(--border-color);
        }
        
        .header h2 {
          margin: 0;
          font-size: 16px;
        }
        
        .actions button {
          background: none;
          border: none;
          color: var(--vscode-button-foreground);
          background-color: var(--vscode-button-background);
          padding: 4px 12px;
          border-radius: 3px;
          cursor: pointer;
          font-size: 12px;
          margin-left: 8px;
        }
        
        .actions button:hover {
          background-color: var(--vscode-button-hoverBackground);
        }
        
        .split-container {
          display: flex;
          flex: 1;
          overflow: hidden;
        }
        
        .model-column {
          flex: 1;
          display: flex;
          flex-direction: column;
          border-right: 1px solid var(--border-color);
          overflow: hidden;
        }
        
        .model-column:last-child {
          border-right: none;
        }
        
        .model-header {
          padding: 8px 15px;
          background-color: var(--vscode-sideBar-background);
          border-bottom: 1px solid var(--border-color);
          font-weight: bold;
          text-align: center;
        }
        
        .model-content {
          flex: 1;
          overflow-y: auto;
          padding: 15px;
        }
        
        .user-query {
          padding: 15px;
          background-color: var(--vscode-editor-lineHighlightBackground);
          margin-bottom: 15px;
          border-bottom: 1px solid var(--border-color);
        }
        
        .user-query-label {
          font-size: 12px;
          color: var(--vscode-descriptionForeground);
          margin-bottom: 5px;
        }
        
        .user-query-text {
          font-weight: 500;
        }
        
        .message {
          padding: 10px 14px;
          border-radius: 8px;
          position: relative;
          line-height: 1.5;
        }
        
        .message-container {
          margin-bottom: 16px;
          animation: fadeIn 0.3s ease-in-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        pre {
          background-color: var(--vscode-textCodeBlock-background);
          padding: 10px;
          border-radius: 4px;
          overflow-x: auto;
          margin: 8px 0;
        }
        
        code {
          font-family: var(--vscode-editor-font-family);
          color: var(--vscode-textPreformat-foreground);
          background-color: var(--vscode-textCodeBlock-background);
          padding: 2px 4px;
          border-radius: 3px;
        }
        
        pre code {
          padding: 0;
          background: none;
        }
        
        /* Loading indicator */
        .typing-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 10px;
        }

        .typing-indicator span {
          height: 8px;
          width: 8px;
          margin: 0 4px;
          background-color: var(--vscode-button-background);
          border-radius: 50%;
          display: inline-block;
          animation: bounce 1.2s infinite ease-in-out;
        }

        .typing-indicator span:nth-child(1) {
          animation-delay: -0.32s;
        }

        .typing-indicator span:nth-child(2) {
          animation-delay: -0.16s;
        }

        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
          } 40% {
            transform: scale(1);
          }
        }
        
        .no-models-message {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
          text-align: center;
          color: var(--vscode-descriptionForeground);
          padding: 20px;
        }
        
        /* Model visibility controls */
        .model-visibility-controls {
          display: flex;
          flex-wrap: wrap;
          padding: 8px 15px;
          background-color: var(--vscode-editor-background);
          border-bottom: 1px solid var(--border-color);
        }
        
        .model-checkbox-container {
          display: flex;
          align-items: center;
          margin-right: 16px;
          margin-bottom: 8px;
        }
        
        .model-checkbox {
          margin-right: 6px;
        }
        
        .model-checkbox-label {
          font-size: 13px;
          cursor: pointer;
          user-select: none;
        }
        
        .hidden-model {
          display: none;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>AI Model Comparison</h2>
        <div class="actions">
          <button id="clearBtn">Clear Chat</button>
          <button id="modelSelectionButton">Select Models</button>
        </div>
      </div>
      
      ${this.renderModelVisibilityControls()}
      
      ${this.renderUserQuery()}
      
      <div class="split-container">
        ${this.renderModelColumns()}
      </div>
      <script>
        (function() {
          const vscode = acquireVsCodeApi();
          
          // Auto-scroll both columns to bottom on load
          document.querySelectorAll('.model-content').forEach(el => {
            el.scrollTop = el.scrollHeight;
          });
          
          // Clear button handler - add with direct event handler
          document.getElementById('clearBtn').onclick = function() {
            vscode.postMessage({ command: 'clearChat' });
          };

          // Model selection button handler - add with direct event handler
          document.getElementById('modelSelectionButton').onclick = function() {
            console.log("Model selection button clicked");
            vscode.postMessage({ command: 'openModelSelection' });
          };
          
          // Model visibility toggle handlers
          document.querySelectorAll('.model-checkbox').forEach(checkbox => {
            checkbox.onchange = function() {
              const modelName = this.getAttribute('data-model');
              const isVisible = this.checked;
             
              if (!modelName) {
                console.error('Error: data-model attribute is missing or invalid.');
                return;
              }

              vscode.postMessage({ 
                command: 'toggleModelVisibility',
                modelName: modelName,
                isVisible: isVisible
              });
            };
          });
        })();
      </script>
    </body>
    </html>`;
  }
  
  /**
   * Render model visibility controls (checkboxes)
   */
  private renderModelVisibilityControls(): string {
    // Only show controls if we have models
    if (this.modelNames.length === 0) {
      return '';
    }
    
    const checkboxes = this.modelNames.map(modelName => {
      const isChecked = !this.hiddenModels.has(modelName);
      return `
        <div class="model-checkbox-container">
          <input 
            type="checkbox" 
            id="checkbox-${this.escapeHtml(modelName)}" 
            class="model-checkbox"
            data-model="${this.escapeHtml(modelName)}"
            ${isChecked ? 'checked' : ''}
          >
          <label 
            for="checkbox-${this.escapeHtml(modelName)}" 
            class="model-checkbox-label"
          >
            ${this.escapeHtml(modelName)}
          </label>
        </div>
      `;
    }).join('');
    
    return `
      <div class="model-visibility-controls">
        ${checkboxes}
      </div>
    `;
  }
  
  /**
   * Render model columns dynamically based on available models
   */
  private renderModelColumns(): string {
    // If no models available yet, show default message
    if (this.modelNames.length === 0) {
      return `
        <div class="no-models-message">
          <div>
            <h3>Waiting for models to respond</h3>
            <p>Your response will appear here shortly.</p>
          </div>
        </div>
      `;
    }
    
    // Otherwise render a column for each available model
    return this.modelNames.map(modelName => {
      // Check if this model is hidden
      const isHidden = this.hiddenModels.has(modelName);
      const hiddenClass = isHidden ? 'hidden-model' : '';
      
      return `
      <div class="model-column ${hiddenClass}" data-model="${this.escapeHtml(modelName)}">
        <div class="model-header">${this.escapeHtml(modelName)}</div>
        <div class="model-content">
          ${this.renderModelResponse(modelName)}
        </div>
      </div>
    `}).join('');
  }
  
  /**
   * Render the user query section
   */
  private renderUserQuery(): string {
    if (!this.lastUserMessage) {
      return '';
    }
    
    return `
      <div class="user-query">
        <div class="user-query-label">Your Query:</div>
        <div class="user-query-text">${this.escapeHtml(this.lastUserMessage)}</div>
      </div>
    `;
  }
  
  /**
   * Render response for a specific model
   */
  private renderModelResponse(modelName: string): string {
    const response = this.responses.get(modelName);

    if (!response) {
      return `<div class="message-container">
        <div class="message">
          <p>Waiting for your question...</p>
        </div>
      </div>`;
    }

    if (response === "") {
      return `<div class="message-container">
        <div class="message">
          <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>`;
    }

    // Render the resolved string
    return `<div class="message-container">
      <div class="message">
        ${response}
      </div>
    </div>`;
  }
  
  /**
   * Format markdown text to HTML using the 'marked' library
   */
  private async formatMarkdown(markdown: string): Promise<string> {
    if (!markdown) {
      return '<div class="typing-indicator"><span></span><span></span><span></span></div>';
    }

    // Use the 'marked' library to convert Markdown to HTML
    return await marked.parse(markdown);
  }
  
  /**
   * Escape HTML special characters
   */
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}