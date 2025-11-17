import { describe, it, expect, beforeEach, vi } from "vitest";
import { execSync } from "child_process";
import {
  detectInputFormat,
  getOutputExtension,
  INPUT_FORMATS,
  OUTPUT_FORMATS,
  findPandocPath,
  getPandocVersion,
  checkPandocInstallation,
} from "../pandoc";

// Mock child_process
vi.mock("child_process");
const mockedExecSync = vi.mocked(execSync);

describe("Pandoc Utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("detectInputFormat", () => {
    it("should detect markdown format from .md extension", () => {
      expect(detectInputFormat("document.md")).toBe("markdown");
      expect(detectInputFormat("/path/to/file.md")).toBe("markdown");
    });

    it("should detect markdown format from .markdown extension", () => {
      expect(detectInputFormat("document.markdown")).toBe("markdown");
    });

    it("should detect html format", () => {
      expect(detectInputFormat("page.html")).toBe("html");
      expect(detectInputFormat("page.htm")).toBe("html");
    });

    it("should detect docx format", () => {
      expect(detectInputFormat("document.docx")).toBe("docx");
    });

    it("should detect org format", () => {
      expect(detectInputFormat("notes.org")).toBe("org");
    });

    it("should detect rst format", () => {
      expect(detectInputFormat("readme.rst")).toBe("rst");
    });

    it("should detect latex format", () => {
      expect(detectInputFormat("paper.tex")).toBe("latex");
    });

    it("should detect epub format", () => {
      expect(detectInputFormat("book.epub")).toBe("epub");
    });

    it("should detect ipynb format", () => {
      expect(detectInputFormat("notebook.ipynb")).toBe("ipynb");
    });

    it("should return null for unknown extensions", () => {
      expect(detectInputFormat("file.txt")).toBeNull();
      expect(detectInputFormat("file.pdf")).toBeNull();
      expect(detectInputFormat("noextension")).toBeNull();
    });

    it("should handle case-insensitive extensions", () => {
      expect(detectInputFormat("document.MD")).toBe("markdown");
      expect(detectInputFormat("document.DOCX")).toBe("docx");
      expect(detectInputFormat("document.HTML")).toBe("html");
    });

    it("should handle files with multiple dots", () => {
      expect(detectInputFormat("my.document.name.md")).toBe("markdown");
      expect(detectInputFormat("file.backup.html")).toBe("html");
    });
  });

  describe("getOutputExtension", () => {
    it("should return correct extension for pdf", () => {
      expect(getOutputExtension("pdf")).toBe(".pdf");
    });

    it("should return correct extension for html", () => {
      expect(getOutputExtension("html")).toBe(".html");
    });

    it("should return correct extension for docx", () => {
      expect(getOutputExtension("docx")).toBe(".docx");
    });

    it("should return correct extension for markdown", () => {
      expect(getOutputExtension("markdown")).toBe(".md");
    });

    it("should return correct extension for latex", () => {
      expect(getOutputExtension("latex")).toBe(".tex");
    });

    it("should return correct extension for epub", () => {
      expect(getOutputExtension("epub")).toBe(".epub");
    });

    it("should return .txt for unknown formats", () => {
      expect(getOutputExtension("unknown")).toBe(".txt");
      expect(getOutputExtension("")).toBe(".txt");
    });
  });

  describe("findPandocPath", () => {
    it("should find pandoc using which command", () => {
      mockedExecSync.mockReturnValueOnce("/usr/local/bin/pandoc\n" as any);

      const result = findPandocPath();

      expect(result).toBe("/usr/local/bin/pandoc");
      expect(mockedExecSync).toHaveBeenCalledWith("which pandoc", { encoding: "utf-8" });
    });

    it("should try common paths when which fails", () => {
      mockedExecSync
        .mockImplementationOnce(() => {
          throw new Error("which failed");
        })
        .mockImplementationOnce(() => {
          throw new Error("path not found");
        })
        .mockReturnValueOnce("" as any); // Second common path succeeds

      const result = findPandocPath();

      expect(result).toBe("/usr/local/bin/pandoc");
    });

    it("should return null when pandoc is not found", () => {
      mockedExecSync.mockImplementation(() => {
        throw new Error("not found");
      });

      const result = findPandocPath();

      expect(result).toBeNull();
    });
  });

  describe("getPandocVersion", () => {
    it("should extract version from pandoc --version output", () => {
      const versionOutput = `pandoc 3.1.9
Features: +server +lua
Scripting engine: Lua 5.4
User data directory: /Users/test/.local/share/pandoc`;

      mockedExecSync.mockReturnValueOnce(versionOutput as any);

      const version = getPandocVersion("/usr/local/bin/pandoc");

      expect(version).toBe("3.1.9");
      expect(mockedExecSync).toHaveBeenCalledWith('"/usr/local/bin/pandoc" --version', {
        encoding: "utf-8",
      });
    });

    it("should handle older pandoc version output format", () => {
      mockedExecSync.mockReturnValueOnce("pandoc 2.19.2\nCompiled with..." as any);

      const version = getPandocVersion("/usr/local/bin/pandoc");

      expect(version).toBe("2.19.2");
    });

    it("should return null when version cannot be determined", () => {
      mockedExecSync.mockReturnValueOnce("invalid output" as any);

      const version = getPandocVersion("/usr/local/bin/pandoc");

      expect(version).toBeNull();
    });

    it("should return null when command fails", () => {
      mockedExecSync.mockImplementationOnce(() => {
        throw new Error("command failed");
      });

      const version = getPandocVersion("/usr/local/bin/pandoc");

      expect(version).toBeNull();
    });
  });

  describe("checkPandocInstallation", () => {
    it("should return installed status when pandoc is found", () => {
      mockedExecSync
        .mockReturnValueOnce("/usr/local/bin/pandoc\n" as any) // which pandoc
        .mockReturnValueOnce("pandoc 3.1.9\nFeatures..." as any); // --version

      const result = checkPandocInstallation();

      expect(result.isInstalled).toBe(true);
      expect(result.path).toBe("/usr/local/bin/pandoc");
      expect(result.version).toBe("3.1.9");
      expect(result.error).toBeUndefined();
    });

    it("should return error when pandoc is not found", () => {
      mockedExecSync.mockImplementation(() => {
        throw new Error("not found");
      });

      const result = checkPandocInstallation();

      expect(result.isInstalled).toBe(false);
      expect(result.path).toBeNull();
      expect(result.version).toBeNull();
      expect(result.error).toBe(
        "Pandoc is not installed. Please install it from https://pandoc.org/installing.html"
      );
    });

    it("should return error when version cannot be determined", () => {
      mockedExecSync
        .mockReturnValueOnce("/usr/local/bin/pandoc\n" as any) // which succeeds
        .mockImplementationOnce(() => {
          throw new Error("version failed");
        }); // --version fails

      const result = checkPandocInstallation();

      expect(result.isInstalled).toBe(false);
      expect(result.path).toBe("/usr/local/bin/pandoc");
      expect(result.version).toBeNull();
      expect(result.error).toBe("Found Pandoc but unable to determine version");
    });
  });

  describe("Format Constants", () => {
    describe("INPUT_FORMATS", () => {
      it("should contain common input formats", () => {
        const formatNames = INPUT_FORMATS.map((f) => f.name);

        expect(formatNames).toContain("markdown");
        expect(formatNames).toContain("gfm");
        expect(formatNames).toContain("html");
        expect(formatNames).toContain("docx");
        expect(formatNames).toContain("rst");
        expect(formatNames).toContain("org");
        expect(formatNames).toContain("latex");
        expect(formatNames).toContain("epub");
        expect(formatNames).toContain("ipynb");
      });

      it("should have valid structure for each format", () => {
        INPUT_FORMATS.forEach((format) => {
          expect(format).toHaveProperty("name");
          expect(format).toHaveProperty("extensions");
          expect(format).toHaveProperty("description");
          expect(typeof format.name).toBe("string");
          expect(Array.isArray(format.extensions)).toBe(true);
          expect(format.extensions.length).toBeGreaterThan(0);
          expect(typeof format.description).toBe("string");
        });
      });

      it("should have unique format names", () => {
        const names = INPUT_FORMATS.map((f) => f.name);
        const uniqueNames = new Set(names);
        expect(uniqueNames.size).toBe(names.length);
      });
    });

    describe("OUTPUT_FORMATS", () => {
      it("should contain common output formats", () => {
        const formatNames = OUTPUT_FORMATS.map((f) => f.name);

        expect(formatNames).toContain("pdf");
        expect(formatNames).toContain("html");
        expect(formatNames).toContain("docx");
        expect(formatNames).toContain("epub");
        expect(formatNames).toContain("markdown");
        expect(formatNames).toContain("latex");
        expect(formatNames).toContain("rtf");
      });

      it("should have valid structure for each format", () => {
        OUTPUT_FORMATS.forEach((format) => {
          expect(format).toHaveProperty("name");
          expect(format).toHaveProperty("extensions");
          expect(format).toHaveProperty("description");
          expect(typeof format.name).toBe("string");
          expect(Array.isArray(format.extensions)).toBe(true);
          expect(format.extensions.length).toBeGreaterThan(0);
          expect(typeof format.description).toBe("string");
        });
      });

      it("should have unique format names", () => {
        const names = OUTPUT_FORMATS.map((f) => f.name);
        const uniqueNames = new Set(names);
        expect(uniqueNames.size).toBe(names.length);
      });

      it("should have extensions starting with dot", () => {
        OUTPUT_FORMATS.forEach((format) => {
          format.extensions.forEach((ext) => {
            expect(ext.startsWith(".")).toBe(true);
          });
        });
      });
    });
  });
});
