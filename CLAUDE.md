# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Raycast extension for running Pandoc directly from Raycast. Raycast extensions are built using React with TypeScript and packaged as macOS applications that integrate with the Raycast launcher.

## Development Commands

### Build & Development
- `npm run dev` - Start development mode with hot reload (uses `ray develop`)
- `npm run build` - Build the extension for distribution (outputs to `dist/`)
- `npm run lint` - Run ESLint to check for issues
- `npm run fix-lint` - Auto-fix linting issues where possible
- `npm run publish` - Publish extension to Raycast store

### Code Quality
- ESLint config extends from `@raycast` (Raycast's official ESLint configuration)
- Prettier configuration: 120 character line width, double quotes

## Architecture & Key Concepts

### Raycast Extension Structure

**Extension Definition**: The `package.json` file serves as the extension manifest (schema: `https://www.raycast.com/schemas/extension.json`). It defines:
- Extension metadata (title, description, icon, author)
- Commands exposed to Raycast (currently has one command: "Pandoc")
- Extension preferences (defined in `raycast-env.d.ts`)

**Commands**: Each command in `package.json` maps to a React component that serves as the entry point. Commands have:
- `name`: Internal identifier (e.g., "index")
- `title`: Display name in Raycast
- `mode`: Display mode ("view" renders a UI component)

**Type Generation**: The `raycast-env.d.ts` file is auto-generated from `package.json`. It provides TypeScript types for:
- Extension preferences (e.g., `defaultOutputFormat`, `outputDirectory`)
- Command-specific preferences
- Command arguments

### Platform-Specific Executable Paths

The extension detects the Pandoc installation path based on the CPU architecture (src/index.tsx:8-9):
- Apple Silicon: `/opt/homebrew/bin/pandoc`
- Intel: `/usr/local/bin/pandoc`

This pattern should be followed for any other system executables that have different paths on Apple Silicon vs Intel Macs.

### Raycast API Patterns

**useExec Hook**: From `@raycast/utils`, this hook executes shell commands and manages loading states. Pattern used in src/index.tsx:13-15:
```typescript
const { isLoading, data } = useExec(pandocPath, ["-v"], { cwd: homedir() });
```

**Detail Component**: From `@raycast/api`, renders markdown content in Raycast's detail view. The component automatically handles loading states and displays formatted output.

## File Organization

- `/src` - Source code for extension commands
  - `index.tsx` - Main command entry point (Pandoc version display)
  - `checkPath.ts` - Utility for checking directory existence (appears unused)
- `raycast-env.d.ts` - Auto-generated type definitions (DO NOT EDIT)
- `package.json` - Extension manifest and dependencies
- `assets/` - Extension icons and images

## Important Notes

- The `raycast-env.d.ts` file comments indicate multiple commands (convert, version, formats) but `package.json` currently only defines one command ("index"). This suggests planned features or incomplete refactoring.
- The extension requires Pandoc to be installed locally via Homebrew (or in `/usr/local` on Intel Macs).
- When modifying extension preferences or commands, update `package.json` - the type definitions will regenerate automatically.
