# Raycast Pandoc Extension

A powerful Raycast extension for converting documents between different formats using [Pandoc](https://pandoc.org), the universal document converter.

## Features

- **Convert Documents**: Transform files between multiple formats with an intuitive interface
- **Auto-Detection**: Automatically detects input format based on file extension
- **Multiple Commands**:
  - 🔄 **Convert Document** - Main conversion interface with full control
  - ℹ️ **Check Pandoc Version** - View installed Pandoc version and installation status
  - 📋 **List Supported Formats** - Browse all available input/output formats
- **Customizable Preferences**: Set default output format and output directory
- **Advanced Options**: Support for custom Pandoc command-line options
- **Smart Output**: Automatically generates output filename or specify custom path
- **Quick Actions**: Open converted file or reveal in Finder directly from success notification

## Prerequisites

This extension requires **Pandoc** to be installed on your system.

### Installing Pandoc

#### macOS (Homebrew)
```bash
brew install pandoc
```

For PDF conversion support, also install LaTeX:
```bash
brew install basictex
```

#### Linux
```bash
# Debian/Ubuntu
sudo apt-get install pandoc

# Fedora
sudo dnf install pandoc

# Arch Linux
sudo pacman -S pandoc
```

#### Windows
Download the installer from [pandoc.org/installing.html](https://pandoc.org/installing.html)

## Usage

### Converting Documents

1. Open Raycast and type "Convert Document"
2. Select your input file
3. Choose the output format (PDF, HTML, DOCX, etc.)
4. Optionally specify custom output path or Pandoc options
5. Press Enter to convert

The extension will:
- Auto-detect the input format from file extension
- Convert the document using Pandoc
- Save the output file (either to custom path or auto-generated)
- Show success notification with options to open file or reveal in Finder

### Checking Pandoc Version

Run "Check Pandoc Version" to view:
- Installed Pandoc version
- Installation path
- Full version information
- Installation instructions if Pandoc is not found

### Viewing Supported Formats

Run "List Supported Formats" to browse:
- All supported input formats
- All supported output formats
- File extensions for each format
- Format descriptions and notes

## Supported Formats

### Input Formats
- Markdown (including GitHub Flavored Markdown, CommonMark)
- HTML
- Microsoft Word (DOCX)
- OpenDocument (ODT)
- reStructuredText
- Org Mode
- LaTeX
- EPUB
- Jupyter Notebook
- And many more...

### Output Formats
- PDF (requires LaTeX)
- HTML
- Microsoft Word (DOCX)
- OpenDocument (ODT)
- EPUB
- LaTeX
- Markdown variants
- Rich Text Format (RTF)
- MediaWiki
- And many more...

## Extension Preferences

Configure the extension behavior in Raycast Preferences:

- **Default Output Format**: Choose your preferred output format (PDF, HTML, DOCX, etc.)
- **Output Directory**: Set a default directory for converted files (leave empty to use source directory)

## Custom Pandoc Options

The extension supports passing additional command-line options to Pandoc. Some useful examples:

- `--standalone` - Produce a standalone document (e.g., complete HTML with headers)
- `--toc` - Generate table of contents
- `--css=style.css` - Include custom CSS for HTML output
- `--template=mytemplate.tex` - Use custom LaTeX template
- `--bibliography=refs.bib` - Include bibliography
- `--citeproc` - Process citations

See the [Pandoc User's Guide](https://pandoc.org/MANUAL.html) for all available options.

## Examples

### Convert Markdown to PDF
1. Input File: `document.md`
2. Output Format: `PDF`
3. Result: `document.pdf` (requires LaTeX)

### Convert DOCX to HTML with Custom Styling
1. Input File: `report.docx`
2. Output Format: `HTML`
3. Custom Options: `--standalone --css=style.css`
4. Result: `report.html` with custom styling

### Batch Processing
For converting multiple files, you can run the Convert Document command multiple times. Each file will be processed independently.

## Troubleshooting

### "Pandoc Not Found" Error
- Make sure Pandoc is installed (see Prerequisites)
- Verify installation by running `which pandoc` in Terminal
- Supported installation paths:
  - `/opt/homebrew/bin/pandoc` (Apple Silicon)
  - `/usr/local/bin/pandoc` (Intel Mac)
  - `/usr/bin/pandoc` (Linux)

### PDF Conversion Fails
- PDF output requires a LaTeX installation
- Install BasicTeX: `brew install basictex`
- Or download full MacTeX from [tug.org/mactex](https://tug.org/mactex/)

### Permission Errors
- Ensure you have write permissions to the output directory
- Try specifying a different output directory in preferences

## Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/nbbaier/raycast-pandoc.git
cd raycast-pandoc

# Install dependencies
npm install

# Development mode
npm run dev

# Build extension
npm run build
```

### Project Structure

```
raycast-pandoc/
├── src/
│   ├── convert.tsx           # Main conversion command
│   ├── version.tsx           # Version check command
│   ├── formats.tsx           # Formats listing command
│   └── utils/
│       └── pandoc.ts         # Pandoc utilities and detection
├── assets/
│   └── command-icon.png      # Extension icon
└── package.json              # Extension metadata
```

## License

MIT

## Author

[nbbaier](https://github.com/nbbaier)

## Links

- [Pandoc Official Website](https://pandoc.org)
- [Pandoc User's Guide](https://pandoc.org/MANUAL.html)
- [Raycast Store](https://www.raycast.com/store)
