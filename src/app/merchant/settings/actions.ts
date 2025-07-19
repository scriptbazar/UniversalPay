
'use server';

import * as fs from 'fs/promises';
import * as path from 'path';

export async function updateGeminiApiKey(apiKey: string) {
  if (!apiKey) {
    throw new Error('API key is required.');
  }

  const envPath = path.resolve(process.cwd(), '.env');
  
  try {
    let envContent = '';
    try {
      envContent = await fs.readFile(envPath, 'utf-8');
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error; // Rethrow if it's not a "file not found" error
      }
      // File doesn't exist, it will be created.
    }

    const lines = envContent.split('\n');
    let keyFound = false;

    const newLines = lines.map(line => {
      if (line.startsWith('GEMINI_API_KEY=')) {
        keyFound = true;
        return `GEMINI_API_KEY=${apiKey}`;
      }
      return line;
    });

    if (!keyFound) {
      newLines.push(`GEMINI_API_KEY=${apiKey}`);
    }

    // Filter out any potential empty lines that might have been created
    const finalContent = newLines.filter(line => line).join('\n') + '\n';

    await fs.writeFile(envPath, finalContent, { encoding: 'utf-8', flag: 'w' });
    console.log('.env file updated successfully.');
  } catch (error) {
    console.error('Failed to write to .env file:', error);
    throw new Error('Could not update the API key.');
  }
}
