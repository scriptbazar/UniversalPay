
'use server';

import * as fs from 'fs/promises';
import * as path from 'path';

export async function updateGeminiApiKey(apiKey: string) {
  if (!apiKey) {
    throw new Error('API key is required.');
  }

  const envPath = path.resolve(process.cwd(), '.env');
  const envContent = `GEMINI_API_KEY=${apiKey}\n`;

  try {
    await fs.writeFile(envPath, envContent, { flag: 'w' }); // Use 'w' to overwrite the file
    console.log('.env file updated successfully.');
  } catch (error) {
    console.error('Failed to write to .env file:', error);
    throw new Error('Could not update the API key.');
  }
}

    