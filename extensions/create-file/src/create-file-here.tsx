import { LaunchProps, closeMainWindow, showHUD, Clipboard, getPreferenceValues } from "@raycast/api";
import path from "path";
import {
  getCurrentExplorerPath,
  parseFileName,
  buildUniqueFileName,
  createFile,
  isDirectoryWritable,
  createFileInTmp,
} from "./utils";

interface CreateFileHereArguments {
  fileName: string;
}

export default async (props: LaunchProps<{ arguments: CreateFileHereArguments }>) => {
  await closeMainWindow();

  try {
    const preferences = getPreferenceValues<Preferences.CreateFileHere>();

    // Parse the filename
    const { name, extension } = parseFileName(props.arguments.fileName || "default.txt");

    // Try to get current directory from file explorer (cross-platform)
    const explorerPath = await getCurrentExplorerPath();

    // Only create file if we have an explorer path (file explorer is focused)
    if (explorerPath && isDirectoryWritable(explorerPath)) {
      // Create the file in the current explorer directory
      const locationName = path.basename(explorerPath);
      const uniqueFileName = buildUniqueFileName(explorerPath, name, extension);
      createFile(explorerPath, uniqueFileName);

      await showHUD(`✅ Created ${uniqueFileName} in ${locationName}`);
    } else {
      // No file explorer focused
      if (preferences.disableClipboardFallback) {
        // Show error (clipboard fallback disabled)
        await showHUD("❌ No file explorer focused. Cannot create file here.");
      } else {
        // Default: create file in /tmp and copy to clipboard (same as "Create File To Clipboard")
        const fileName = `${name}.${extension}`;
        const filePath = createFileInTmp(name, extension);

        console.log("Created file in tmp:", filePath);

        // Copy the actual file to clipboard (not the path)
        await Clipboard.copy({ file: filePath });

        console.log("Successfully copied file to clipboard");

        await showHUD(`📋 No file explorer focused. Created ${fileName} and copied to clipboard`);
      }
    }
  } catch (error) {
    console.error("Error creating file:", error);
    await showHUD("❌ Failed to create file");
  }
};
