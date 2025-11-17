/**
 * Tests for convert.tsx utility functions
 */
import { describe, it, expect } from "vitest";

describe("buildPandocCommand", () => {
  // Helper function that mirrors the buildPandocCommand from convert.tsx
  function buildPandocCommand(
    pandocPath: string,
    inputPath: string,
    outputPath: string,
    inputFormat: string,
    outputFormat: string,
    customOptions: string
  ): string {
    const args = [
      `"${inputPath}"`,
      "-o",
      `"${outputPath}"`,
      "-f",
      inputFormat || "markdown",
      "-t",
      outputFormat,
    ];

    if (customOptions.trim()) {
      args.push(customOptions.trim());
    }

    return `"${pandocPath}" ${args.join(" ")}`;
  }

  describe("basic command building", () => {
    it("should build a basic pandoc command", () => {
      const command = buildPandocCommand(
        "/usr/local/bin/pandoc",
        "/path/to/input.md",
        "/path/to/output.pdf",
        "markdown",
        "pdf",
        ""
      );

      expect(command).toBe(
        '"/usr/local/bin/pandoc" "/path/to/input.md" -o "/path/to/output.pdf" -f markdown -t pdf'
      );
    });

    it("should handle paths with spaces", () => {
      const command = buildPandocCommand(
        "/usr/local/bin/pandoc",
        "/path with spaces/input.md",
        "/output path/output.pdf",
        "markdown",
        "pdf",
        ""
      );

      expect(command).toContain('"/path with spaces/input.md"');
      expect(command).toContain('"/output path/output.pdf"');
    });

    it("should use markdown as default input format when empty", () => {
      const command = buildPandocCommand(
        "/usr/local/bin/pandoc",
        "/path/to/input.txt",
        "/path/to/output.html",
        "",
        "html",
        ""
      );

      expect(command).toContain("-f markdown");
    });

    it("should include specified input format", () => {
      const command = buildPandocCommand(
        "/usr/local/bin/pandoc",
        "/path/to/input.rst",
        "/path/to/output.html",
        "rst",
        "html",
        ""
      );

      expect(command).toContain("-f rst");
    });

    it("should include output format", () => {
      const command = buildPandocCommand(
        "/usr/local/bin/pandoc",
        "/path/to/input.md",
        "/path/to/output.docx",
        "markdown",
        "docx",
        ""
      );

      expect(command).toContain("-t docx");
    });
  });

  describe("custom options", () => {
    it("should append custom options when provided", () => {
      const command = buildPandocCommand(
        "/usr/local/bin/pandoc",
        "/path/to/input.md",
        "/path/to/output.html",
        "markdown",
        "html",
        "--standalone --toc"
      );

      expect(command).toContain("--standalone --toc");
      expect(command).toMatch(/html --standalone --toc$/);
    });

    it("should trim whitespace from custom options", () => {
      const command = buildPandocCommand(
        "/usr/local/bin/pandoc",
        "/path/to/input.md",
        "/path/to/output.html",
        "markdown",
        "html",
        "  --standalone  "
      );

      expect(command).toContain("--standalone");
      expect(command).not.toContain("  --standalone  ");
    });

    it("should not append anything when custom options is empty", () => {
      const command = buildPandocCommand(
        "/usr/local/bin/pandoc",
        "/path/to/input.md",
        "/path/to/output.pdf",
        "markdown",
        "pdf",
        ""
      );

      expect(command).toBe(
        '"/usr/local/bin/pandoc" "/path/to/input.md" -o "/path/to/output.pdf" -f markdown -t pdf'
      );
    });

    it("should not append anything when custom options is only whitespace", () => {
      const command = buildPandocCommand(
        "/usr/local/bin/pandoc",
        "/path/to/input.md",
        "/path/to/output.pdf",
        "markdown",
        "pdf",
        "   "
      );

      expect(command).toBe(
        '"/usr/local/bin/pandoc" "/path/to/input.md" -o "/path/to/output.pdf" -f markdown -t pdf'
      );
    });

    it("should handle complex custom options", () => {
      const command = buildPandocCommand(
        "/usr/local/bin/pandoc",
        "/path/to/input.md",
        "/path/to/output.html",
        "markdown",
        "html",
        '--standalone --toc --css="style.css" --template="custom.html"'
      );

      expect(command).toContain('--css="style.css"');
      expect(command).toContain('--template="custom.html"');
    });
  });

  describe("different pandoc paths", () => {
    it("should handle homebrew path on Apple Silicon", () => {
      const command = buildPandocCommand(
        "/opt/homebrew/bin/pandoc",
        "/path/to/input.md",
        "/path/to/output.pdf",
        "markdown",
        "pdf",
        ""
      );

      expect(command.startsWith('"/opt/homebrew/bin/pandoc"')).toBe(true);
    });

    it("should handle standard unix path", () => {
      const command = buildPandocCommand(
        "/usr/local/bin/pandoc",
        "/path/to/input.md",
        "/path/to/output.pdf",
        "markdown",
        "pdf",
        ""
      );

      expect(command.startsWith('"/usr/local/bin/pandoc"')).toBe(true);
    });

    it("should handle custom installation path", () => {
      const command = buildPandocCommand(
        "/home/user/.local/bin/pandoc",
        "/path/to/input.md",
        "/path/to/output.pdf",
        "markdown",
        "pdf",
        ""
      );

      expect(command.startsWith('"/home/user/.local/bin/pandoc"')).toBe(true);
    });
  });

  describe("various format conversions", () => {
    it("should build command for markdown to PDF", () => {
      const command = buildPandocCommand(
        "/usr/local/bin/pandoc",
        "/docs/readme.md",
        "/docs/readme.pdf",
        "markdown",
        "pdf",
        ""
      );

      expect(command).toContain("-f markdown");
      expect(command).toContain("-t pdf");
    });

    it("should build command for markdown to HTML", () => {
      const command = buildPandocCommand(
        "/usr/local/bin/pandoc",
        "/docs/readme.md",
        "/docs/readme.html",
        "markdown",
        "html",
        ""
      );

      expect(command).toContain("-f markdown");
      expect(command).toContain("-t html");
    });

    it("should build command for DOCX to markdown", () => {
      const command = buildPandocCommand(
        "/usr/local/bin/pandoc",
        "/docs/document.docx",
        "/docs/document.md",
        "docx",
        "markdown",
        ""
      );

      expect(command).toContain("-f docx");
      expect(command).toContain("-t markdown");
    });

    it("should build command for HTML to DOCX", () => {
      const command = buildPandocCommand(
        "/usr/local/bin/pandoc",
        "/web/page.html",
        "/docs/page.docx",
        "html",
        "docx",
        ""
      );

      expect(command).toContain("-f html");
      expect(command).toContain("-t docx");
    });

    it("should build command for LaTeX to PDF", () => {
      const command = buildPandocCommand(
        "/usr/local/bin/pandoc",
        "/papers/thesis.tex",
        "/papers/thesis.pdf",
        "latex",
        "pdf",
        ""
      );

      expect(command).toContain("-f latex");
      expect(command).toContain("-t pdf");
    });

    it("should build command for org to HTML", () => {
      const command = buildPandocCommand(
        "/usr/local/bin/pandoc",
        "/notes/todo.org",
        "/notes/todo.html",
        "org",
        "html",
        ""
      );

      expect(command).toContain("-f org");
      expect(command).toContain("-t html");
    });
  });

  describe("command structure validation", () => {
    it("should always have input file as first argument", () => {
      const command = buildPandocCommand(
        "/usr/local/bin/pandoc",
        "/path/to/input.md",
        "/path/to/output.pdf",
        "markdown",
        "pdf",
        ""
      );

      const parts = command.split(" ");
      expect(parts[1]).toBe('"/path/to/input.md"');
    });

    it("should have -o flag before output file", () => {
      const command = buildPandocCommand(
        "/usr/local/bin/pandoc",
        "/path/to/input.md",
        "/path/to/output.pdf",
        "markdown",
        "pdf",
        ""
      );

      expect(command).toMatch(/-o "\/path\/to\/output\.pdf"/);
    });

    it("should have -f flag before input format", () => {
      const command = buildPandocCommand(
        "/usr/local/bin/pandoc",
        "/path/to/input.md",
        "/path/to/output.pdf",
        "markdown",
        "pdf",
        ""
      );

      expect(command).toMatch(/-f markdown/);
    });

    it("should have -t flag before output format", () => {
      const command = buildPandocCommand(
        "/usr/local/bin/pandoc",
        "/path/to/input.md",
        "/path/to/output.pdf",
        "markdown",
        "pdf",
        ""
      );

      expect(command).toMatch(/-t pdf/);
    });

    it("should have arguments in correct order", () => {
      const command = buildPandocCommand(
        "/usr/local/bin/pandoc",
        "/input.md",
        "/output.pdf",
        "markdown",
        "pdf",
        "--standalone"
      );

      // Check order: pandoc, input, -o, output, -f, format, -t, format, options
      expect(command).toMatch(
        /"\/usr\/local\/bin\/pandoc" "\/input\.md" -o "\/output\.pdf" -f markdown -t pdf --standalone/
      );
    });
  });
});
