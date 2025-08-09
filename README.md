# 🚀 Multi-Pilot Extension v1.1.0

Multi-Pilot is a Visual Studio Code extension that enables developers to interact with multiple AI language models simultaneously, allowing for direct comparison of responses from different AI models. Now with enhanced prompt engineering capabilities!

## 🚀 Getting Started

1. 📥 **Install** the Multi-Pilot extension from the VS Code Marketplace
2. 📂 **Open** the chat view in the VS Code sidebar
3. 💬 **Use** the chat participant `@multi-pilot` and ask your question
4. ✅ **Select** the AI models you want to interact with using the "Select Models" command

### 🌟 Core Features
- 🌐 **Multi-Model Support**: Interact with multiple AI models simultaneously (supports up to 6 models)
- 🖥️ **Real-Time Response Comparison**: View responses from different AI models side by side in a split view
- 🎛️ **Model Selection**: Choose which AI models to use through a simple selection interface
- 💾 **Persistent Settings**: Your model preferences are saved between sessions
- 🧠 **Enhanced Prompts**: Automatic prompt enhancement using available AI models to improve response quality
- 🕒 **Conversation History**: Maintains context from previous interactions for more coherent responses
- 🔄 **Dynamic Response Updates**: Real-time streaming of AI responses with typing indicators
- 👁️ **Model Visibility Control**: Toggle visibility of individual model responses

## 🎯 Using the New Prompt Enhancement Features

### Command Palette
- Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
- Run `Multi-Pilot: Enhance Prompt`

### Enhancement Options
When you enhance a prompt, you can choose to:
- **Copy to Clipboard**: Copy the enhanced prompt for use anywhere
- **Open in New Document**: View the enhanced prompt in a new markdown document

## ⚙️ Configuration

### Model Selection
- Use the Command Palette: `Multi-Pilot: Select Models` to choose which AI models to use
- Your model preferences are automatically saved and persist between sessions
- The extension automatically detects and uses the best available models

### Settings
- Adjust extension settings in VS Code settings panel under the "Multi-Pilot" section
- Model selections are stored in your workspace for consistency

## 🔧 Commands

| Command | Description |
|---------|-------------|
| `Multi-Pilot: Select Models` | Choose which AI models to use | 
| `Multi-Pilot: Enhance Prompt` | Enhance selected text or clipboard content |
| `Multi-Pilot Search` | Open Multi-Pilot chat interface |

## 🆕 What's New in v1.1.0

### Enhanced Prompt Engineering
The Enhanced Prompt Engineering feature helps you intelligently improve prompts using the AI models in your VS Code environment. It transforms simple prompts into optimized, detailed instructions, resulting in better AI responses. Importantly, you don’t need the @multi-pilot chat participant to use this feature you can access it directly from the command palette. Simply copy text from any source, then use the feature to enhance it.
#### 🚀 Quick Start
1. **Command Palette**: Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS)
2. **Select Command**: Choose `Multi-Pilot: Enhance Prompt`
3. **Choose Input**: The extension will intelligently detect text from:
   - Clipboard content from your last copy
   - Manual input via dialog box

### Improved Architecture
- **Modular Design**: Refactored prompt templates into separate modules for better maintainability
- **Template System**: Extensible prompt template system supporting basic, advanced, and custom enhancement strategies
- **Error Handling**: Improved error handling and fallback mechanisms
- **Performance**: Optimized model initialization and selection processes


## ⚠️ Limitations

- 🚫 Model availability depends on your VS Code environment and installed AI capabilities.
- ❌ Does not provide default chat support features from GitHub Copilot, such as attaching context or hash/slash functions.
- 🗂️ Conversation history is not saved between sessions.

## 🤝 Contributing

Contributions are welcome! If you'd like to contribute:
1. 🍴 **Fork** the repository.
2. ✏️ **Make** your changes.
3. 🔄 **Submit** a pull request.

For major changes, please open an issue first to discuss what you would like to change.

## 📜 License

This extension is released under the MIT License. See the [LICENSE](./LICENSE) file for details.

## 📂 Repository

The source code for this extension is available on GitHub: [Multi-Pilot Repository](https://github.com/xtharakax/multi-pilot.git)
