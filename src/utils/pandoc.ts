import { execSync } from "child_process";

export interface PandocFormat {
  name: string;
  extensions: string[];
  description: string;
}

export const INPUT_FORMATS: PandocFormat[] = [
  { name: "markdown", extensions: [".md", ".markdown"], description: "Markdown" },
  { name: "gfm", extensions: [".md"], description: "GitHub Flavored Markdown" },
  { name: "commonmark", extensions: [".md"], description: "CommonMark" },
  { name: "html", extensions: [".html", ".htm"], description: "HTML" },
  { name: "docx", extensions: [".docx"], description: "Microsoft Word" },
  { name: "odt", extensions: [".odt"], description: "OpenDocument Text" },
  { name: "rst", extensions: [".rst"], description: "reStructuredText" },
  { name: "org", extensions: [".org"], description: "Org Mode" },
  { name: "latex", extensions: [".tex"], description: "LaTeX" },
  { name: "epub", extensions: [".epub"], description: "EPUB" },
  { name: "ipynb", extensions: [".ipynb"], description: "Jupyter Notebook" },
];

export const OUTPUT_FORMATS: PandocFormat[] = [
  { name: "html", extensions: [".html"], description: "HTML" },
  { name: "pdf", extensions: [".pdf"], description: "PDF (requires LaTeX)" },
  { name: "docx", extensions: [".docx"], description: "Microsoft Word" },
  { name: "odt", extensions: [".odt"], description: "OpenDocument Text" },
  { name: "epub", extensions: [".epub"], description: "EPUB" },
  { name: "latex", extensions: [".tex"], description: "LaTeX" },
  { name: "markdown", extensions: [".md"], description: "Markdown" },
  { name: "gfm", extensions: [".md"], description: "GitHub Flavored Markdown" },
  { name: "rst", extensions: [".rst"], description: "reStructuredText" },
  { name: "org", extensions: [".org"], description: "Org Mode" },
  { name: "rtf", extensions: [".rtf"], description: "Rich Text Format" },
  { name: "mediawiki", extensions: [".wiki"], description: "MediaWiki" },
];

/**
 * Finds the Pandoc executable path
 * @returns The path to pandoc executable or null if not found
 */
export function findPandocPath(): string | null {
  try {
    // Try to find pandoc in PATH using 'which' on Unix-like systems
    const result = execSync("which pandoc", { encoding: "utf-8" }).trim();
    if (result) {
      return result;
    }
  } catch (error) {
    // 'which' failed, try common installation paths
    const commonPaths = ["/opt/homebrew/bin/pandoc", "/usr/local/bin/pandoc", "/usr/bin/pandoc"];

    for (const path of commonPaths) {
      try {
        execSync(`test -x "${path}"`, { encoding: "utf-8" });
        return path;
      } catch {
        // Path doesn't exist or isn't executable, continue
      }
    }
  }

  return null;
}

/**
 * Gets the Pandoc version string
 * @param pandocPath Path to pandoc executable
 * @returns Version string or null if failed
 */
export function getPandocVersion(pandocPath: string): string | null {
  try {
    const output = execSync(`"${pandocPath}" --version`, { encoding: "utf-8" });
    const match = output.match(/pandoc\s+([\d.]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Checks if Pandoc is installed and accessible
 * @returns Object with installation status and path/version if available
 */
export function checkPandocInstallation(): {
  isInstalled: boolean;
  path: string | null;
  version: string | null;
  error?: string;
} {
  const path = findPandocPath();

  if (!path) {
    return {
      isInstalled: false,
      path: null,
      version: null,
      error: "Pandoc is not installed. Please install it from https://pandoc.org/installing.html",
    };
  }

  const version = getPandocVersion(path);

  if (!version) {
    return {
      isInstalled: false,
      path,
      version: null,
      error: "Found Pandoc but unable to determine version",
    };
  }

  return {
    isInstalled: true,
    path,
    version,
  };
}

/**
 * Detects input format from file extension
 * @param filename The filename to check
 * @returns The detected format name or null
 */
export function detectInputFormat(filename: string): string | null {
  const ext = filename.substring(filename.lastIndexOf(".")).toLowerCase();

  for (const format of INPUT_FORMATS) {
    if (format.extensions.includes(ext)) {
      return format.name;
    }
  }

  return null;
}

/**
 * Gets the appropriate file extension for an output format
 * @param format The output format name
 * @returns The file extension (with dot) or .txt as fallback
 */
export function getOutputExtension(format: string): string {
  const formatInfo = OUTPUT_FORMATS.find((f) => f.name === format);
  return formatInfo?.extensions[0] || ".txt";
}
