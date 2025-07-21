---
description: Technical stack and development information
alwaysApply: true
---

# Technical Stack & Development Information

## Tech Stack
- **Language**: TypeScript
- **Platform**: VS Code Extension API
- **Build System**: Webpack
- **Package Manager**: pnpm (with npm compatibility)
- **Testing Framework**: Mocha

## Key Dependencies
- **VS Code API**: Core extension functionality
- **ignore**: For handling .gitignore patterns
- **glob**: For file pattern matching
- **webpack**: For bundling the extension

## Project Architecture
- **Core Pattern**: Dependency Injection
- **Design Pattern**: Service-oriented architecture with clear interfaces
- **Error Handling**: Centralized through ErrorHandler utility

## Common Commands

### Development
```bash
# Install dependencies
npm install

# Compile in development mode
npm run compile

# Watch mode for development
npm run watch
```

### Testing
```bash
# Run tests
npm test

# Compile tests
npm run compile-tests

# Watch tests during development
npm run watch-tests
```

### Building & Publishing
```bash
# Package the extension for production
npm run package

# Publish to VS Code Marketplace
npm run publish:vscode

# Publish to Open VSX Registry
npm run publish:ovsx

# Publish to both marketplaces
npm run publish:all
```

## Extension Settings
- `autoContext.outputList`: Array of output configurations (path, format, prependContent)
- `autoContext.shouldOutput`: Whether to output context files when files change
- `autoContext.ignorePinnedTabs`: Whether to ignore pinned tabs when collecting context

## Extension Commands
- `auto-context.removeTopCommentBlocks`: Removes top comment blocks from files
