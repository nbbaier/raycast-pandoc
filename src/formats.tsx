import { Detail } from "@raycast/api";
import { INPUT_FORMATS, OUTPUT_FORMATS, checkPandocInstallation } from "./utils/pandoc";

export default function Command() {
  const pandocCheck = checkPandocInstallation();

  const inputFormatsTable = INPUT_FORMATS.map(
    (format) => `| ${format.description} | \`${format.name}\` | ${format.extensions.join(", ")} |`
  ).join("\n");

  const outputFormatsTable = OUTPUT_FORMATS.map(
    (format) => `| ${format.description} | \`${format.name}\` | ${format.extensions.join(", ")} |`
  ).join("\n");

  const markdown = `# Pandoc Supported Formats

${pandocCheck.isInstalled ? `**Pandoc Version:** ${pandocCheck.version}` : `⚠️ ${pandocCheck.error}`}

---

## Input Formats

These are the document formats that Pandoc can read and convert from:

| Format | Pandoc Name | Extensions |
|--------|-------------|------------|
${inputFormatsTable}

---

## Output Formats

These are the formats that Pandoc can convert documents to:

| Format | Pandoc Name | Extensions |
|--------|-------------|------------|
${outputFormatsTable}

---

## Notes

- **PDF Output**: Requires a LaTeX installation (e.g., MacTeX, BasicTeX, or TeX Live)
- **DOCX**: Microsoft Word format (2007 and later)
- **ODT**: OpenDocument Text format
- **EPUB**: E-book format
- **HTML**: Web page format with optional CSS styling
- **Markdown Variants**: Multiple flavors supported (CommonMark, GFM, etc.)

For more information about specific format options, see the [Pandoc User's Guide](https://pandoc.org/MANUAL.html).
`;

  return <Detail markdown={markdown} />;
}
