# raycast-pandoc Changelog

## [2.0.0] - 2025-11-17

### Major Rewrite

Complete rewrite of the extension with modern Raycast API and full document conversion functionality.

### Added

- **Document Conversion**: Full-featured conversion interface with file selection and format options
- **Multiple Commands**:
  - Convert Document - Main conversion command with comprehensive options
  - Check Pandoc Version - View installation status and version information
  - List Supported Formats - Browse all available input/output formats
- **Smart Pandoc Detection**: Automatically finds Pandoc installation across different paths and platforms
- **Input Format Auto-Detection**: Automatically detects input format based on file extension
- **Extension Preferences**:
  - Default output format setting
  - Custom output directory configuration
- **Custom Pandoc Options**: Support for passing additional command-line arguments to Pandoc
- **Output File Handling**:
  - Auto-generate output filename based on input file
  - Option to specify custom output path
  - Automatic output directory creation
- **Rich User Feedback**:
  - Loading indicators during conversion
  - Success notifications with quick actions
  - Error messages with helpful context
  - Installation instructions when Pandoc is not found
- **Quick Actions**: Open converted file or reveal in Finder from success notification
- **Format Support**: Support for 11+ input formats and 12+ output formats including:
  - Input: Markdown, HTML, DOCX, ODT, reStructuredText, Org, LaTeX, EPUB, Jupyter Notebook
  - Output: PDF, HTML, DOCX, ODT, EPUB, LaTeX, Markdown, RTF, MediaWiki

### Changed

- **Updated Dependencies**:
  - @raycast/api: 1.61.1 → 1.103.3 (major update)
  - @raycast/utils: 1.10.0 → 1.17.0
- **Improved Architecture**: Modular structure with separate utility files
- **Better Error Handling**: Comprehensive error checking and user-friendly messages
- **Platform Detection**: Replaced CPU model string detection with proper PATH-based Pandoc discovery

### Removed

- Old single-view command (replaced with multiple specialized commands)
- Unused `checkPath.ts` file with hardcoded paths
- Dead code and commented imports

### Fixed

- Hardcoded Pandoc paths that didn't work across different systems
- Missing error handling for Pandoc installation detection
- No actual document conversion functionality (extension only showed version)

### Developer Notes

- Complete TypeScript rewrite with proper type definitions
- Organized code structure with `src/utils/` for shared utilities
- Comprehensive documentation and examples in README
- Modern Raycast API patterns and best practices

## [Initial Version] - 2023-07-22

Initial release with basic Pandoc version display functionality.
