# Create File

A cross-platform Raycast extension for quickly creating files with specified names and extensions.

## Demo

[![Demo Video](https://img.youtube.com/vi/1N16BlI2gOc/0.jpg)](https://youtu.be/1N16BlI2gOc)

Watch the [demo video](https://youtu.be/1N16BlI2gOc) to see how it works!

## Platform Support

- **macOS**: Full support with Finder integration
- **Windows**: Full support with File Explorer integration  
- **Linux**: Full support with file explorer integration

## Features

### 1. Create File Here
Creates a file with the specified name and extension in the current file explorer directory. If no file explorer is focused, it creates the file in `/tmp` and copies it to clipboard (same behavior as "Create File To Clipboard").

**Usage:**
- Command: `Create File Here`
- Argument: File name with extension (e.g., `main.py`, `script.sh`, `notes.txt`)
- Default: If no argument is provided, creates `default.txt`

**Examples:**
- `main.py` → Creates `main.py`
- `script.sh` → Creates `script.sh`
- `document.md` → Creates `document.md`
- (empty) → Creates `default.txt`

**Behavior:**
- **File explorer focused**: Creates file in current directory
- **No file explorer focused**: Creates file in `/tmp` and copies to clipboard (can be disabled in preferences)

**Preferences:**
- **Disable clipboard fallback**: (Disabled by default) If enabled, shows an error instead of creating file in /tmp when no file explorer is focused.

### 2. Create File To Clipboard
Creates a file in `/tmp` and copies the actual file to your clipboard. You can then paste it anywhere.

**Usage:**
- Command: `Create File To Clipboard`
- Argument: File name with extension (e.g., `main.py`)
- Default: If no argument is provided, uses `default.txt`

**Behavior:**
- Creates file in `/tmp/raycast-create-file-<random-hex>/filename.ext`
- Copies the actual file to clipboard (like Cmd+C in Finder)
- Paste with Cmd+V anywhere to place the file
- Each run creates a new isolated directory to avoid collisions

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

### Fix linting issues:
```bash
npm run fix-lint
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

This matches the standard behavior of macOS Finder and most Linux file explorers.

## Platform-Specific Behavior

### macOS
- **Create File Here**: Integrates with Finder using AppleScript
  - Detects if Finder is focused and gets current directory
  - Only creates file when Finder is the active application
- **Create File To Clipboard**: Works normally

### Windows
- **Create File Here**: Integrates with File Explorer using PowerShell
  - Detects current Explorer window location
  - Only creates file when File Explorer is focused
- **Create File To Clipboard**: Works normally

### Linux
- **Create File Here**: Attempts to detect common file explorers (Nautilus, Dolphin, Thunar, etc.)
  - Uses xdotool for window detection
  - Only creates file when file explorer is focused
- **Create File To Clipboard**: Works normally

**Linux users** may need to install `xdotool`:
```bash
# Ubuntu/Debian
sudo apt install xdotool

# Fedora
sudo dnf install xdotool

# Arch
sudo pacman -S xdotool
```

## Icon Setup

You need to add an icon file to the root directory:
- File name: `extension-icon.png`
- Recommended size: 512x512px
- See `assets/README.md` for more information

## License

MIT

## Credits

Inspired by the [Easy New File](https://github.com/raycast/extensions/tree/main/extensions/easy-new-file) extension from the Raycast extensions repository.
