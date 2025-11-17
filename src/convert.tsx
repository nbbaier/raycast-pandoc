import {
  Action,
  ActionPanel,
  Form,
  showToast,
  Toast,
  getPreferenceValues,
  open,
  closeMainWindow,
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

export default function Command() {
  const preferences = getPreferenceValues<Preferences>();
  const [inputFormat, setInputFormat] = useState<string>("");

  // Check if Pandoc is installed
  const pandocCheck = checkPandocInstallation();

  if (!pandocCheck.isInstalled) {
    showToast({
      style: Toast.Style.Failure,
      title: "Pandoc Not Found",
      message: pandocCheck.error || "Please install Pandoc from https://pandoc.org",
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

    try {
      // Build pandoc command
      const args = [
        `"${inputPath}"`,
        "-o",
        `"${outputPath}"`,
        "-f",
        inputFormat || "markdown",
        "-t",
        values.outputFormat,
      ];

      // Add custom options if provided
      if (values.customOptions.trim()) {
        args.push(values.customOptions.trim());
      }

      const command = `"${pandocCheck.path}" ${args.join(" ")}`;

      // Execute conversion
      execSync(command, { encoding: "utf-8", stdio: "pipe" });

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
    } catch (error) {
      await toast.hide();
      await showToast({
        style: Toast.Style.Failure,
        title: "Conversion Failed",
        message: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Convert Document" onSubmit={handleSubmit} />
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
      />

      <Form.TextField
        id="customOptions"
        title="Custom Pandoc Options"
        placeholder="--standalone --toc --css=style.css"
        info="Optional: Additional command-line options for Pandoc"
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
