# 🚀 Multi-Pilot Extension v1.1.0

Multi-Pilot brings two powerful capabilities to VS Code:

1. Multi-model comparison to view and analyze responses from several AI models side by side.
2. Advanced prompt engineering to intelligently enhance your prompts.

## 🚀 Getting Started

1. 📥 **Install** the Multi-Pilot extension from the VS Code Marketplace
2. 📂 **Open** the chat view in the VS Code sidebar
3. 💬 **Use** the chat participant `@multi-pilot` and ask your question
4. ✅ **Select** the AI models you want to interact with using the "Select Models" command


### 🌟 Core Features
- Compare answers from multiple AI models side by side
- Instantly enhance prompts for better AI results
- Choose and save your favorite models
- Streamlined, real-time response updates

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


## 🆕 What's New in v1.2.0

### Parallel Prompt Enhancement & Context Awareness
- Enhance selected text or clipboard content with full document context for smarter results
- Compare prompt enhancements using both Lite and Full templates side by side
- Context menu integration for quick access to enhancement features

### Template & Performance Improvements
- Advanced template system with Lite versions for reduced token usage
- Optimized prompt service architecture for faster processing
- Improved text extraction logic and editor context detection

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
