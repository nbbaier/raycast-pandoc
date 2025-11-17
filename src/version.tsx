import { Detail } from "@raycast/api";
import { useExec } from "@raycast/utils";
import { checkPandocInstallation } from "./utils/pandoc";

export default function Command() {
  const pandocCheck = checkPandocInstallation();

  const { isLoading, data, error } = useExec(
    pandocCheck.path || "pandoc",
    ["--version"],
    {
      execute: pandocCheck.isInstalled,
    }
  );

  let markdown = "";

  if (!pandocCheck.isInstalled) {
    markdown = `# Pandoc Not Found

${pandocCheck.error}

## Installation Instructions

### macOS
\`\`\`bash
# Using Homebrew
brew install pandoc

# For PDF support, also install LaTeX
brew install basictex
\`\`\`

### Linux
\`\`\`bash
# Debian/Ubuntu
sudo apt-get install pandoc

# Fedora
sudo dnf install pandoc

# Arch Linux
sudo pacman -S pandoc
\`\`\`

### Windows
Download the installer from [pandoc.org/installing.html](https://pandoc.org/installing.html)

## Verification
After installation, restart Raycast and run this command again to verify the installation.
`;
  } else if (error) {
    markdown = `# Error Checking Pandoc

\`\`\`
${error.message}
\`\`\`

**Path:** ${pandocCheck.path}
`;
  } else if (data) {
    markdown = `# Pandoc Installation

**Version:** ${pandocCheck.version}
**Path:** \`${pandocCheck.path}\`

---

## Full Version Information

\`\`\`
${data}
\`\`\`
`;
  }

  return <Detail isLoading={isLoading} markdown={markdown} />;
}
