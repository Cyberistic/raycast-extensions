import { LaunchProps, closeMainWindow, showHUD, Clipboard } from "@raycast/api";
import { parseFileName, createFileInTmp } from "./utils";

interface CreateFileToClipboardArguments {
  fileName: string;
}

export default async (props: LaunchProps<{ arguments: CreateFileToClipboardArguments }>) => {
  await closeMainWindow();

  try {
    // Parse the filename
    const { name, extension } = parseFileName(props.arguments.fileName || "default.txt");
    const fileName = `${name}.${extension}`;

    // Create file in /tmp
    const filePath = createFileInTmp(name, extension);

    console.log("Created file in tmp:", filePath);

    // Copy the actual file to clipboard (not the path)
    await Clipboard.copy({ file: filePath });

    console.log("Successfully copied file to clipboard");

    await showHUD(`📋 Created ${fileName} and copied to clipboard`);
  } catch (error) {
    console.error("Error creating file and copying to clipboard:", error);
    await showHUD(`❌ Failed: ${error}`);
  }
};
