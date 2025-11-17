# Test Suite

This directory contains tests for the Raycast Pandoc extension.

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (automatically reruns on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Framework

The project uses **Vitest** as the test framework. Vitest is a fast, modern testing framework that's compatible with Jest's API but offers better performance and native ESM support.

## Test Structure

```
src/
├── __tests__/              # Tests for main command components
│   ├── convert.test.ts     # Tests for buildPandocCommand function
│   └── README.md           # This file
└── utils/
    └── __tests__/          # Tests for utility modules
        └── pandoc.test.ts  # Tests for Pandoc utilities
```

## What's Tested

### Utility Functions (`src/utils/pandoc.ts`)

The test suite covers 100% of the utility functions:

- **Format Detection**
  - `detectInputFormat()` - Detects input format from file extensions
  - `getOutputExtension()` - Returns correct extension for output formats

- **Pandoc Installation**
  - `findPandocPath()` - Locates Pandoc executable
  - `getPandocVersion()` - Extracts version from Pandoc output
  - `checkPandocInstallation()` - Validates Pandoc installation

- **Format Constants**
  - `INPUT_FORMATS` - Array of supported input formats
  - `OUTPUT_FORMATS` - Array of supported output formats

### Command Building (`src/__tests__/convert.test.ts`)

Tests for the `buildPandocCommand()` function:

- Basic command construction
- Path handling (including paths with spaces)
- Input/output format specifications
- Custom Pandoc options
- Different Pandoc installation paths
- Various format conversions (MD→PDF, DOCX→MD, etc.)
- Command structure validation

## UI Components

The Raycast UI components (`convert.tsx`, `formats.tsx`, `version.tsx`) are **not tested** because:

1. They rely heavily on the Raycast API runtime
2. Raycast extensions run in a special environment
3. Testing React components with Raycast's custom hooks is complex
4. The business logic is already tested in the utility functions

This is a common pattern in Raycast extension development - focus testing on business logic and utilities rather than UI components.

## Coverage Thresholds

The project maintains high coverage standards for utility code:

- **Lines**: 90%
- **Functions**: 90%
- **Branches**: 85%
- **Statements**: 90%

Current coverage: **100%** for all utility functions ✅

## Adding New Tests

When adding new utility functions:

1. Create a test file in the appropriate `__tests__` directory
2. Import `describe`, `it`, `expect`, and other utilities from `vitest`
3. Group related tests using `describe()` blocks
4. Use `beforeEach()` for test setup
5. Mock external dependencies using `vi.mock()`

### Example Test Structure

```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";
import { myFunction } from "../myModule";

describe("myFunction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should do something specific", () => {
    const result = myFunction("input");
    expect(result).toBe("expected output");
  });

  it("should handle edge cases", () => {
    expect(() => myFunction(null)).toThrow();
  });
});
```

## Mocking

The test suite uses Vitest's mocking utilities:

- `vi.mock()` - Mock entire modules
- `vi.mocked()` - Type-safe mocking
- `vi.clearAllMocks()` - Reset mocks between tests

Example:
```typescript
import { vi } from "vitest";
import { execSync } from "child_process";

vi.mock("child_process");
const mockedExecSync = vi.mocked(execSync);

// In test:
mockedExecSync.mockReturnValueOnce("pandoc 3.1.9" as any);
```

## Continuous Integration

Tests should be run in CI/CD pipelines before:
- Merging pull requests
- Publishing to the Raycast store
- Creating releases

Example GitHub Actions workflow:
```yaml
- name: Run tests
  run: npm test

- name: Check coverage
  run: npm run test:coverage
```

## Troubleshooting

### Tests fail with "Cannot find module"
- Run `npm install` to ensure all dependencies are installed
- Check that imports use the correct relative paths

### Coverage doesn't meet thresholds
- Add tests for uncovered branches/functions
- Review the coverage report in `coverage/index.html`

### Mocks not working
- Ensure `vi.mock()` is called at the top level (not inside tests)
- Use `vi.clearAllMocks()` in `beforeEach()` to reset state

## Resources

- [Vitest Documentation](https://vitest.dev)
- [Testing Best Practices](https://vitest.dev/guide/best-practices.html)
- [Mocking Guide](https://vitest.dev/guide/mocking.html)
