import { readFileSync } from "fs";
import { join } from "path";

export async function GET() {
  try {
    // Read the backup file from the public directory
    // First, let's try to read from the home directory
    const backupPath = join(process.env.HOME || "/home/swapnaj", "Downloads/vault-backup-2025-12-27.json");
    const fileContent = readFileSync(backupPath, "utf-8");
    const data = JSON.parse(fileContent);

    return Response.json(data);
  } catch (error) {
    return Response.json(
      { error: `Failed to load backup: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}
