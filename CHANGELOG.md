# Change Log

All notable changes to the "Multi-Pilot" extension will be documented in this file.

## [1.2.0] - 2025-08-17

### Added
- Enhanced prompt engineering with context-aware improvements wil less steps
- Parallel processing with both Lite and Full templates for efficiency comparison
- Support for selected text enhancement while maintaining full document context
- Parallel enhancement processing with comparison documents
- Advanced template system with lite and full versions for token optimization

### Changed
- Optimized prompt templates for 50-70% token reduction with Lite versions
- Enhanced clipboard fallback mechanism for better user experience
- Improved logging for better debugging and user feedback
- Improved text extraction logic for better selected text handling
- Enhanced editor context detection and processing
- Optimized prompt service architecture for better performance

### Fixed
- Fixed text extraction logic to properly handle selected text vs full document context
- Resolved TypeScript typing issues with editor context
- Fixed command registration and menu integration
- Fixed SonarQube violations in command registration
- Resolved text extraction issues in enhance prompt commands
- Improved TypeScript type safety across the extension

## [1.1.0] - 2025-08-09

### Added
- Enhanced Prompt Engineering feature accessible via Command Palette
- Intelligent text detection from clipboard content and manual input
- Modular prompt template system for better maintainability
- Extensible template system supporting basic, advanced, and custom enhancement strategies
- Direct access to prompt enhancement without requiring @multi-pilot chat participant

### Changed
- Refactored prompt templates into separate modules for better maintainability
- Improved error handling and fallback mechanisms
- Optimized model initialization and selection processes

### Fixed
- Enhanced architecture with modular design principles

## [1.0.0] - 2025-01-16

### Added
- Initial release
- Multi-model AI chat support with up to 6 models
- Real-time response comparison in split view
- Model selection interface with persistent settings
- GitHub Copilot Chat integration
- Basic prompt enhancement capabilities
- Conversation history maintenance
- Dynamic response streaming with typing indicators