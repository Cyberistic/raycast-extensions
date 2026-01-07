import { runAppleScript } from "@raycast/utils";
import { homedir, platform, tmpdir } from "os";
import path from "path";
import fs from "fs";
import { exec } from "child_process";
import { promisify } from "util";
import { randomBytes } from "crypto";

const execAsync = promisify(exec);

/**
 * Get the current platform
 */
export const getPlatform = (): "macos" | "windows" | "linux" => {
  const p = platform();
  if (p === "darwin") return "macos";
  if (p === "win32") return "windows";
  return "linux";
};

/**
 * Check if Finder is the frontmost (focused) application (macOS only)
 */
const scriptFinderIsFrontmost = `
tell application "System Events"
    set frontApp to name of first application process whose frontmost is true
    if frontApp is "Finder" then
        return "true"
    else
        return "false"
    end if
end tell
`;

export const finderIsFrontmost = async (): Promise<boolean> => {
  if (getPlatform() !== "macos") return false;

  try {
    const result = await runAppleScript(scriptFinderIsFrontmost);
    return result.trim() === "true";
  } catch (e) {
    console.error("Error checking if Finder is frontmost:", e);
    return false;
  }
};

/**
 * Check if Finder has any open windows (macOS only)
 */
const scriptFinderHasWindows = `
if application "Finder" is not running then
    return "false"
end if

tell application "Finder"
    if (count of windows) > 0 then
        return "true"
    else
        return "false"
    end if
end tell
`;

export const finderHasOpenWindows = async (): Promise<boolean> => {
  if (getPlatform() !== "macos") return false;

  try {
    const result = await runAppleScript(scriptFinderHasWindows);
    return result.trim() === "true";
  } catch (e) {
    console.error("Error checking Finder windows:", e);
    return false;
  }
};

/**
 * Get the current Finder directory path (macOS only)
 */
const scriptFinderPath = `
if application "Finder" is not running then
    return "Finder not running"
end if

tell application "Finder"
    return POSIX path of ((insertion location) as alias)
end tell
`;

export const getFinderPath = async (): Promise<string | null> => {
  if (getPlatform() !== "macos") return null;

  try {
    // Check if Finder is frontmost (actually focused by user)
    const isFrontmost = await finderIsFrontmost();
    if (!isFrontmost) {
      return null;
    }

    const finderHasWindows = await finderHasOpenWindows();
    if (finderHasWindows) {
      const directory = await runAppleScript(scriptFinderPath);
      return directory.trim();
    }
    return null;
  } catch (e) {
    console.error("Error getting Finder path:", e);
    return null;
  }
};

/**
 * Get current file explorer path on Windows
 */
export const getWindowsExplorerPath = async (): Promise<string | null> => {
  try {
    // Use PowerShell to get the current Explorer window path
    const script = `
      Add-Type @"
        using System;
        using System.Runtime.InteropServices;
        public class Shell {
          [DllImport("shell32.dll")]
          public static extern int SHGetFolderPath(IntPtr hwndOwner, int nFolder, IntPtr hToken, uint dwFlags, System.Text.StringBuilder pszPath);
        }
"@
      $shell = New-Object -ComObject Shell.Application
      $window = $shell.Windows() | Where-Object { $_.Name -eq 'File Explorer' } | Select-Object -First 1
      if ($window) { $window.Document.Folder.Self.Path } else { '' }
    `.replace(/\n/g, " ");

    const { stdout } = await execAsync(`powershell -Command "${script}"`);
    const path = stdout.trim();
    return path || null;
  } catch (e) {
    console.error("Error getting Windows Explorer path:", e);
    return null;
  }
};

/**
 * Get current file explorer path on Linux
 */
export const getLinuxFileManagerPath = async (): Promise<string | null> => {
  try {
    // Try to get the current directory from common Linux file explorers
    // This is a best-effort approach as Linux file explorers vary widely

    // Try xdotool to get the focused window's working directory
    const { stdout } = await execAsync('xdotool getactivewindow getwindowname 2>/dev/null || echo ""');

    // Parse common file explorer window titles
    const windowTitle = stdout.trim();

    // Try to extract path from Nautilus, Dolphin, Thunar, etc.
    const pathMatch = windowTitle.match(/^(.*?)\s*[-–—]\s*(?:Files|Dolphin|Thunar)/);
    if (pathMatch) {
      return pathMatch[1].trim();
    }

    return null;
  } catch (e) {
    console.error("Error getting Linux file explorer path:", e);
    return null;
  }
};

/**
 * Get current file explorer path (cross-platform)
 */
export const getCurrentExplorerPath = async (): Promise<string | null> => {
  const currentPlatform = getPlatform();

  switch (currentPlatform) {
    case "macos":
      return await getFinderPath();
    case "windows":
      return await getWindowsExplorerPath();
    case "linux":
      return await getLinuxFileManagerPath();
    default:
      return null;
  }
};

/**
 * Get Desktop path
 */
export const getDesktopPath = (): string => {
  return path.join(homedir(), "Desktop");
};

/**
 * Parse filename to extract name and extension
 */
export const parseFileName = (fileName: string): { name: string; extension: string } => {
  if (!fileName || fileName.trim() === "") {
    return { name: "default", extension: "txt" };
  }

  const trimmed = fileName.trim();

  // If it contains a dot, try to split it
  if (trimmed.includes(".")) {
    const lastDotIndex = trimmed.lastIndexOf(".");
    const name = trimmed.substring(0, lastDotIndex);
    const extension = trimmed.substring(lastDotIndex + 1);

    // If name is empty, use the extension as both name and extension
    if (!name) {
      return { name: extension, extension: extension };
    }

    return { name, extension };
  }

  // No dot found, treat entire string as name with default extension
  return { name: trimmed, extension: "txt" };
};

/**
 * Build unique filename if file already exists
 * Follows system convention: "filename 2.ext", "filename 3.ext", etc.
 */
export const buildUniqueFileName = (directory: string, name: string, extension: string): string => {
  let fileName = `${name}.${extension}`;
  let filePath = path.join(directory, fileName);
  let counter = 2;

  while (fs.existsSync(filePath)) {
    fileName = `${name} ${counter}.${extension}`;
    filePath = path.join(directory, fileName);
    counter++;
  }

  return fileName;
};

/**
 * Create a new file with the given name and extension
 */
export const createFile = (directory: string, fileName: string): string => {
  const filePath = path.join(directory, fileName);
  fs.writeFileSync(filePath, "");
  return filePath;
};

/**
 * Check if directory exists and is writable
 */
export const isDirectoryWritable = (directory: string): boolean => {
  try {
    if (!fs.existsSync(directory)) {
      return false;
    }
    const stats = fs.statSync(directory);
    if (!stats.isDirectory()) {
      return false;
    }
    // Try to access the directory
    fs.accessSync(directory, fs.constants.W_OK);
    return true;
  } catch {
    return false;
  }
};

/**
 * Create file in /tmp and return the path
 * Used by both "Create File Here" (fallback) and "Create File To Clipboard"
 */
export const createFileInTmp = (name: string, extension: string): string => {
  const fileName = `${name}.${extension}`;

  // Create a random subdirectory in /tmp to avoid collisions
  const randomDirName = `raycast-create-file-${randomBytes(8).toString("hex")}`;
  const tmpDirectory = path.join(tmpdir(), randomDirName);

  // Create the directory
  fs.mkdirSync(tmpDirectory, { recursive: true });

  // Create file in the random tmp subdirectory
  const filePath = createFile(tmpDirectory, fileName);

  return filePath;
};
