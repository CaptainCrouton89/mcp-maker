/**
 * File operation utilities for MCP Maker
 */
import chalk from "chalk";
import fs from "fs-extra";
import path from "path";

/**
 * Ensures a directory exists, creating it if necessary
 */
export const ensureDir = async (dirPath: string): Promise<void> => {
  try {
    await fs.ensureDir(dirPath);
  } catch (error) {
    console.error(chalk.red(`Error creating directory ${dirPath}:`), error);
    throw error;
  }
};

/**
 * Writes content to a file, creating directories if needed
 */
export const writeFile = async (
  filePath: string,
  content: string
): Promise<void> => {
  try {
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, content);
  } catch (error) {
    console.error(chalk.red(`Error writing file ${filePath}:`), error);
    throw error;
  }
};

/**
 * Reads content from a file
 */
export const readFile = async (filePath: string): Promise<string> => {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch (error) {
    console.error(chalk.red(`Error reading file ${filePath}:`), error);
    throw error;
  }
};

/**
 * Copies a file from source to destination
 */
export const copyFile = async (
  source: string,
  destination: string
): Promise<void> => {
  try {
    await fs.ensureDir(path.dirname(destination));
    await fs.copyFile(source, destination);
  } catch (error) {
    console.error(
      chalk.red(`Error copying file from ${source} to ${destination}:`),
      error
    );
    throw error;
  }
};

/**
 * Copies a directory recursively
 */
export const copyDir = async (
  source: string,
  destination: string
): Promise<void> => {
  try {
    await fs.copy(source, destination, { overwrite: true });
  } catch (error) {
    console.error(
      chalk.red(`Error copying directory from ${source} to ${destination}:`),
      error
    );
    throw error;
  }
};

/**
 * Checks if a path exists
 */
export const pathExists = async (filePath: string): Promise<boolean> => {
  try {
    return await fs.pathExists(filePath);
  } catch (error) {
    console.error(
      chalk.red(`Error checking if path exists ${filePath}:`),
      error
    );
    throw error;
  }
};

/**
 * Safely create a file path by replacing unsafe characters
 */
export const safeFilePath = (filePath: string): string => {
  return filePath
    .replace(/[<>:"/\\|?*]/g, "_") // Replace unsafe characters with underscore
    .replace(/\s+/g, "_"); // Replace spaces with underscore
};
