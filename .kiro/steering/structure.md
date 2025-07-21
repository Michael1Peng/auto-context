---
description: Project structure and organization
alwaysApply: true
---

# Project Structure

## Directory Organization

```
src/
├── core/                   # Core functionality
│   ├── ContextTracker.ts   # Main tracking logic
│   └── FileCollector.ts    # File collection logic
├── services/               # Service components
│   ├── ConfigurationManager.ts  # Manages extension configuration
│   ├── FileFilter.ts       # Filters files based on rules
│   ├── OutputFormatter.ts  # Formats output content
│   └── OutputWriter.ts     # Writes output to files
├── types/
│   └── interfaces.ts       # TypeScript interfaces
├── utils/
│   └── ErrorHandler.ts     # Error handling utilities
├── test/                   # Test files
│   ├── runTest.ts          # Test runner
│   └── suite/              # Test suites
└── extension.ts            # Extension entry point
```

## Key Files
- **extension.ts**: Entry point that activates the extension
- **ContextTracker.ts**: Core class that manages the context tracking process
- **FileCollector.ts**: Collects open files from VS Code tabs
- **interfaces.ts**: Defines all interfaces used throughout the project

## Architecture Patterns

### Component Organization
- **Core**: Contains the main business logic
- **Services**: Provides specific functionality to core components
- **Types**: Defines interfaces and types
- **Utils**: Contains utility functions

### Code Conventions
1. **Interface-based Development**: All components implement interfaces defined in `types/interfaces.ts`
2. **Dependency Injection**: Components receive dependencies through constructors
3. **Error Handling**: Centralized through the ErrorHandler utility
4. **Configuration Management**: Handled by ConfigurationManager service

## Output Structure
The extension generates context files in the following locations:
- `.cursor/rules/opened-files.mdc`: For Cursor AI
- `.roo/rules/opened-files.md`: For Roo AI
- `.clinerules/opened-files.md`: For Cline AI
- `output/opened-files.xml`: Generic XML format

## Extension Settings Structure
Settings are defined in `package.json` under the `contributes.configuration` section and managed by the ConfigurationManager service.

## Testing Structure
Tests are organized in the `src/test` directory with:
- Unit tests for individual components
- Integration tests for the extension as a whole
