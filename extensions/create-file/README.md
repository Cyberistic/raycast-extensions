# Create File

A cross-platform Raycast extension for quickly creating files with specified names and extensions.
Brings the ability to create empty files To Mac! No longer will you have to open a terminal and do `touch <filename>`!

Also, has an option to create an empty file straight to clipboard.

Fun fact: The touch command was initially released in January 1979 as part of the 7th Edition Unix. Now, you can have the same functionality 50 years later, right from your Raycast! thanks a lot apple.

## Demo

[![Demo Video](https://img.youtube.com/vi/1N16BlI2gOc/0.jpg)](https://youtu.be/1N16BlI2gOc)

Watch the [demo video](https://youtu.be/1N16BlI2gOc) to see how it works!

## Platform Support

- **macOS**: Full support with Finder integration
- **Windows**: Full support with File Explorer integration

## Features

### 1. Create File Here

Creates a file with the specified name and extension in the current file explorer directory. If no file explorer is focused, it creates the file and copies it to your clipboard (can be disabled in preferences).

### 2. Create File To Clipboard

Creates a file in `/tmp` and copies the actual file to your clipboard. You can then paste it anywhere.

## Installation

### Prerequisites

- [Raycast](https://www.raycast.com/) installed on your system
- Node.js and npm

### Setup

1. Clone or download this extension to your local machine

2. Navigate to the extension directory:

```bash
cd create-file
```

3. Install dependencies:

```bash
npm install
```

4. Build the extension:

```bash
npm run build
```

5. Import the extension in Raycast:
   - Open Raycast
   - Go to Extensions
   - Click "+" and choose "Add Script Directory"
   - Select the `create-file` directory

## Development

### Run in development mode:

```bash
npm run dev
```

### Build for production:

```bash
npm run build
```

### Lint code:

```bash
npm run lint
```

## File Naming

The extension intelligently parses file names:

- `main.py` → name: `main`, extension: `py`
- `.gitignore` → name: `.gitignore`, extension: `gitignore`
- `document` → name: `document`, extension: `txt` (default)
- (empty) → name: `default`, extension: `txt`

### Auto-increment Convention

If a file with the same name already exists in the directory (for "Create File Here"), the extension follows system naming conventions:

- `main.py` → `main 2.py` → `main 3.py` → etc.

This matches the standard behavior of macOS Finder.

## License

MIT

## Credits

Inspired by the [Easy New File](https://github.com/raycast/extensions/tree/main/extensions/easy-new-file) extension from the Raycast extensions repository. Their extension overcomplicates file creation and a file type must be specified, with a limited number of file types supported. This extension aims to simplify the process while adding clipboard functionality.
