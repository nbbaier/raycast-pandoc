import {
  Action,
  ActionPanel,
  Form,
  showToast,
  Toast,
  getPreferenceValues,
  open,
  closeMainWindow,
  Clipboard,
} from "@raycast/api";
import { useState } from "react";
import { execSync } from "child_process";
import { existsSync, mkdirSync } from "fs";
import { basename, dirname, join, extname } from "path";
import {
  checkPandocInstallation,
  detectInputFormat,
  getOutputExtension,
  INPUT_FORMATS,
  OUTPUT_FORMATS,
} from "./utils/pandoc";

interface Preferences {
  defaultOutputFormat: string;
  outputDirectory?: string;
}

interface FormValues {
  inputFile: string[];
  outputFormat: string;
  outputFile: string;
  customOptions: string;
}

/**
 * Builds the Pandoc command string from form values
 */
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

  // Add custom options if provided
  if (customOptions.trim()) {
    args.push(customOptions.trim());
  }

  return `"${pandocPath}" ${args.join(" ")}`;
}

export default function Command() {
  const preferences = getPreferenceValues<Preferences>();
  const [inputFormat, setInputFormat] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [outputFormat, setOutputFormat] = useState<string>(preferences.defaultOutputFormat);
  const [outputFile, setOutputFile] = useState<string>("");
  const [customOptions, setCustomOptions] = useState<string>("");

  // Check if Pandoc is installed
  const pandocCheck = checkPandocInstallation();

  if (!pandocCheck.isInstalled) {
    showToast({
      style: Toast.Style.Failure,
      title: "Pandoc Not Found",
      message: pandocCheck.error || "Please install Pandoc from https://pandoc.org",
    });
  }

  async function handleCopyCommand() {
    if (!pandocCheck.isInstalled || !pandocCheck.path) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Pandoc Not Available",
        message: "Please install Pandoc first",
      });
      return;
    }

    if (!selectedFile) {
      await showToast({
        style: Toast.Style.Failure,
        title: "No Input File Selected",
        message: "Please select an input file first",
      });
      return;
    }

    // Determine output path
    let outputPath: string;
    if (outputFile.trim()) {
      outputPath = outputFile.trim();
    } else {
      const inputDir = dirname(selectedFile);
      const outputDir = preferences.outputDirectory?.trim() || inputDir;
      const inputBasename = basename(selectedFile, extname(selectedFile));
      const outputExt = getOutputExtension(outputFormat);
      outputPath = join(outputDir, `${inputBasename}${outputExt}`);
    }

    // Build command
    const command = buildPandocCommand(
      pandocCheck.path,
      selectedFile,
      outputPath,
      inputFormat,
      outputFormat,
      customOptions
    );

    await Clipboard.copy(command);
    await showToast({
      style: Toast.Style.Success,
      title: "Command Copied",
      message: "Pandoc command copied to clipboard",
    });
  }

  async function handleSubmit(values: FormValues) {
    if (!pandocCheck.isInstalled || !pandocCheck.path) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Pandoc Not Available",
        message: "Please install Pandoc first",
      });
      return;
    }

    if (!values.inputFile || values.inputFile.length === 0) {
      await showToast({
        style: Toast.Style.Failure,
        title: "No Input File",
        message: "Please select an input file",
      });
      return;
    }

    const inputPath = values.inputFile[0];

    if (!existsSync(inputPath)) {
      await showToast({
        style: Toast.Style.Failure,
        title: "File Not Found",
        message: `Cannot find file: ${inputPath}`,
      });
      return;
    }

    // Determine output path
    let outputPath: string;
    if (values.outputFile.trim()) {
      outputPath = values.outputFile.trim();
    } else {
      const inputDir = dirname(inputPath);
      const outputDir = preferences.outputDirectory?.trim() || inputDir;
      const inputBasename = basename(inputPath, extname(inputPath));
      const outputExt = getOutputExtension(values.outputFormat);
      outputPath = join(outputDir, `${inputBasename}${outputExt}`);

      // Create output directory if it doesn't exist
      const outputDirPath = dirname(outputPath);
      if (!existsSync(outputDirPath)) {
        try {
          mkdirSync(outputDirPath, { recursive: true });
        } catch (error) {
          await showToast({
            style: Toast.Style.Failure,
            title: "Cannot Create Directory",
            message: `Failed to create ${outputDirPath}`,
          });
          return;
        }
      }
    }

    const toast = await showToast({
      style: Toast.Style.Animated,
      title: "Converting Document",
      message: `${basename(inputPath)} → ${values.outputFormat}`,
    });

    // Build pandoc command
    const command = buildPandocCommand(
      pandocCheck.path,
      inputPath,
      outputPath,
      inputFormat,
      values.outputFormat,
      values.customOptions
    );

    try {
      // Execute conversion
      execSync(command, { encoding: "utf-8" });

      await toast.hide();
      await showToast({
        style: Toast.Style.Success,
        title: "Conversion Complete",
        message: `Saved to ${basename(outputPath)}`,
        primaryAction: {
          title: "Open File",
          onAction: async () => {
            await open(outputPath);
          },
        },
        secondaryAction: {
          title: "Reveal in Finder",
          onAction: async () => {
            await open(dirname(outputPath));
          },
        },
      });

      await closeMainWindow();
    } catch (error: any) {
      await toast.hide();

      // Build detailed error message
      const errorDetails: string[] = [];
      errorDetails.push("=== PANDOC CONVERSION ERROR ===\n");
      errorDetails.push(`Command: ${command}\n`);
      errorDetails.push(`\nInput File: ${inputPath}`);
      errorDetails.push(`Output File: ${outputPath}`);
      errorDetails.push(`Input Format: ${inputFormat || "auto-detect"}`);
      errorDetails.push(`Output Format: ${values.outputFormat}\n`);

      if (error.stderr) {
        errorDetails.push(`\nStderr:\n${error.stderr}`);
      }
      if (error.stdout) {
        errorDetails.push(`\nStdout:\n${error.stdout}`);
      }
      if (error.message) {
        errorDetails.push(`\nError Message:\n${error.message}`);
      }

      const fullErrorText = errorDetails.join("\n");

      // Extract short error message for toast
      const shortError = error.stderr
        ? error.stderr.split("\n")[0]
        : error.message || "Unknown error occurred";

      await showToast({
        style: Toast.Style.Failure,
        title: "Conversion Failed",
        message: shortError.substring(0, 100),
        primaryAction: {
          title: "Copy Error Details",
          onAction: async () => {
            await Clipboard.copy(fullErrorText);
            await showToast({
              style: Toast.Style.Success,
              title: "Error Details Copied",
              message: "Full error details copied to clipboard",
            });
          },
        },
        secondaryAction: {
          title: "Copy Command",
          onAction: async () => {
            await Clipboard.copy(command);
            await showToast({
              style: Toast.Style.Success,
              title: "Command Copied",
              message: "Pandoc command copied to clipboard",
            });
          },
        },
      });
    }
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Convert Document" onSubmit={handleSubmit} />
          <Action
            title="Copy Command"
            onAction={handleCopyCommand}
            shortcut={{ modifiers: ["cmd"], key: "c" }}
          />
        </ActionPanel>
      }
    >
      <Form.FilePicker
        id="inputFile"
        title="Input File"
        allowMultipleSelection={false}
        canChooseDirectories={false}
        onChange={(files) => {
          if (files.length > 0) {
            setSelectedFile(files[0]);
            const detectedFormat = detectInputFormat(files[0]);
            if (detectedFormat) {
              setInputFormat(detectedFormat);
            }
          }
        }}
      />

      <Form.Dropdown
        id="inputFormat"
        title="Input Format"
        value={inputFormat}
        onChange={setInputFormat}
        info="Auto-detected from file extension, but you can override it"
      >
        <Form.Dropdown.Item value="" title="Auto-detect" />
        {INPUT_FORMATS.map((format) => (
          <Form.Dropdown.Item key={format.name} value={format.name} title={format.description} />
        ))}
      </Form.Dropdown>

      <Form.Dropdown
        id="outputFormat"
        title="Output Format"
        value={outputFormat}
        onChange={setOutputFormat}
        defaultValue={preferences.defaultOutputFormat}
        storeValue
      >
        {OUTPUT_FORMATS.map((format) => (
          <Form.Dropdown.Item key={format.name} value={format.name} title={format.description} />
        ))}
      </Form.Dropdown>

      <Form.TextField
        id="outputFile"
        title="Output File"
        placeholder="Leave empty to auto-generate based on input filename"
        info="Optional: Specify custom output path, or leave empty to use input filename with new extension"
        value={outputFile}
        onChange={setOutputFile}
      />

      <Form.TextField
        id="customOptions"
        title="Custom Pandoc Options"
        placeholder="--standalone --toc --css=style.css"
        info="Optional: Additional command-line options for Pandoc"
        value={customOptions}
        onChange={setCustomOptions}
      />

      <Form.Description
        title="Status"
        text={
          pandocCheck.isInstalled
            ? `✓ Pandoc ${pandocCheck.version} installed at ${pandocCheck.path}`
            : `✗ ${pandocCheck.error}`
        }
      />
    </Form>
  );
}
