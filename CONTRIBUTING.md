# Contributing to Email to Google Sheet Extension

First off, thank you for considering contributing to this project! It's people like you that make this extension such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to [contact info].

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps which reproduce the problem** in as many details as possible
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed after following the steps**
- **Explain which behavior you expected to see instead and why**
- **Include screenshots if possible**

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the steps**
- **Describe the current behavior** and **the expected behavior**
- **Explain why this enhancement would be useful**

### Pull Requests

- Fill in the required template
- Follow the TypeScript/JavaScript styleguides
- Include appropriate test cases
- End all files with a newline
- Avoid platform-specific code

## Development Setup

1. Fork and clone the repository
```bash
git clone https://github.com/your-username/email-to-gsheet.git
cd email-to-gsheet
```

2. Install dependencies
```bash
npm install
```

3. Create a branch for your changes
```bash
git checkout -b feature/your-feature-name
```

4. Make your changes
```bash
npm run watch  # Watch for changes
```

5. Test your changes
```bash
npm run compile
npm run lint
npm test
```

## Styleguides

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

Example:
```
Add Gmail filter support

Add ability to filter emails by sender in Gmail provider.
Implements filtering for sender, subject, and labels.

Fixes #123
```

### TypeScript Styleguide

- Use TypeScript strict mode
- Add type annotations where not obvious
- Use interfaces for object types
- Use enums for string constants
- Comment public APIs

Example:
```typescript
/**
 * Filters emails based on the provided rules
 * @param emails - Array of emails to filter
 * @param rules - Filter rules to apply
 * @returns Filtered email array
 */
export function filterEmails(
  emails: Email[],
  rules: FilterRule[]
): Email[] {
  // Implementation
}
```

### JavaScript Styleguide

- Use async/await over callbacks
- Use const by default, let if needed
- Avoid var
- Use template literals for string interpolation

### Documentation Styleguide

- Use Markdown for documentation
- Use present tense
- Be clear and concise
- Include examples where helpful

## Testing

- Write tests for new features
- Ensure all tests pass: `npm test`
- Include both happy path and error cases

## Project Structure

```
email-to-gsheet/
├── src/
│   ├── extension.ts          # Main entry point
│   ├── managers/             # Business logic
│   │   ├── emailSyncManager.ts
│   │   └── googleSheetsManager.ts
│   ├── ui/                   # User interface
│   │   ├── settingsPanel.ts
│   │   └── syncExplorer.ts
│   ├── config/               # Configuration
│   │   └── apiConfig.ts
│   ├── types/                # TypeScript types
│   │   └── index.ts
│   └── utils/                # Utilities
│       └── logger.ts
├── tests/                    # Test files
├── package.json
├── tsconfig.json
├── README.md
└── CHANGELOG.md
```

## Key Files to Understand

- **extension.ts**: Main extension logic and command registration
- **emailSyncManager.ts**: Email fetching and provider integration
- **googleSheetsManager.ts**: Google Sheets API integration
- **settingsPanel.ts**: Settings UI webview
- **syncExplorer.ts**: Sidebar tree view implementation
- **apiConfig.ts**: API endpoints and constants

## Common Tasks

### Adding a New Email Provider

1. Add provider config to `src/config/apiConfig.ts`
2. Implement in `emailSyncManager.ts`:
   - `authorize{Provider}()` method
   - `fetch{Provider}Emails()` method
3. Add filter support
4. Update UI in `settingsPanel.ts`
5. Add tests

### Adding a New Filter Type

1. Update `FilterRule` type in `src/types/index.ts`
2. Add validation rule in `src/config/apiConfig.ts`
3. Implement filter logic in email managers
4. Update settings panel UI
5. Add tests

### Adding a New Setting

1. Add to `package.json` contributions.configuration
2. Add to `ExtensionSettings` type
3. Handle in `settingsPanel.ts`
4. Update defaults in `apiConfig.ts`

## Questions?

Feel free to:
- Open an issue with the label "question"
- Contact maintainers
- Check existing documentation

## Additional Notes

- Check the [issues page](https://github.com/your-repo/issues) for good first issues
- Review [CHANGELOG.md](CHANGELOG.md) for recent changes
- Look at [README.md](README.md) for features and usage

## License

By contributing, you agree that your contributions will be licensed under its MIT License.

---

**Thank you for contributing! 🙏**
