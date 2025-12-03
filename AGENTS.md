# AGENTS.md

## Build/Lint/Test Commands

- **Build**: `npm run build` - Builds the extension for distribution
- **Development**: `npm run dev` - Runs in development mode
- **Lint**: `npm run lint` - Runs ESLint with Raycast config
- **Fix Lint**: `npm run fix-lint` - Auto-fixes linting issues
- **Publish**: `npm run publish` - Publishes to Raycast Store

## Code Style Guidelines

### TypeScript/React

- Use TypeScript strict mode (configured in tsconfig.json)
- React JSX transform is enabled
- Target ES2021 with CommonJS modules

### Formatting (Prettier)

- Print width: 120 characters
- Use double quotes for strings
- No semicolons (follow existing patterns)

### Imports

- Use ES6 import syntax
- Raycast API imports from `@raycast/api`
- Utility imports from `@raycast/utils`
- Node.js built-ins without path (e.g., `import { cpus } from "os"`)

### Naming Conventions

- Components: PascalCase (e.g., `Detail`, `Command`)
- Functions: camelCase (e.g., `directoryExists`)
- Constants: camelCase (e.g., `pandocPath`)
- File names: camelCase (e.g., `checkPath.ts`)

### Error Handling

- Use try-catch for file system operations
- Return boolean or appropriate fallback values
- Avoid throwing uncaught exceptions in UI components
