# Claude Conversation Export Script

A utility script for exporting Claude conversations to markdown format, with options for creating Claude-friendly summaries.

## Features

- Export full conversations to markdown
- Generate Claude-friendly summaries with context
- Automatic topic extraction
- Timestamp-based organization
- Support for saving to Claude's project files

## Installation

1. Navigate to the scripts directory:
```bash
cd servers/scripts
```

2. Install dependencies:
```bash
npm install
```

3. Build the script:
```bash
npm run build
```

## Usage

### Basic Export
To export a conversation to markdown:
```bash
npm start
```
This will save the conversation to the `conversations` directory with a timestamp.

### Export with Claude Summary
To export a conversation and create a Claude-friendly summary:
```bash
npm run claude
```
This will:
1. Save the full conversation to the `conversations` directory
2. Create a summary in Claude's Projects directory (`~/Library/Application Support/Claude/Projects`)

## Summary Format

The Claude-friendly summary includes:
- Title (extracted from first user message)
- Last update timestamp
- Context (last 3 messages)
- Recent messages (last 5 substantial messages)
- Metadata (total messages, topics, conversation ID)

## Directory Structure

```
servers/scripts/
├── conversations/           # Full conversation exports
│   └── conversation-*.md
├── dist/                   # Compiled JavaScript files
├── export-conversation.ts  # Source code
└── package.json           # Dependencies and scripts
```

## Customization

To modify the script for your needs:

1. Edit `export-conversation.ts` to:
   - Change the number of messages in summaries
   - Modify topic extraction
   - Adjust the summary format

2. Rebuild the script:
```bash
npm run build
```

## Development

To run the script in development mode:
```bash
npm run dev
```

## Notes

- The script automatically creates necessary directories
- Summaries are designed to fit within Claude's context window
- Files are named with ISO timestamps for easy sorting
- The script uses Node.js native modules (fs/promises, path)

## License

MIT License - See the main project LICENSE file for details. 