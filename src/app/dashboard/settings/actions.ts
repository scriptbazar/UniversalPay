
'use server';

import * as fs from 'fs/promises';
import * as path from 'path';

async function updateEnvFile(updates: Record<string, string>) {
  const envPath = path.resolve(process.cwd(), '.env');
  
  try {
    let envContent = '';
    try {
      envContent = await fs.readFile(envPath, 'utf-8');
    } catch (error: any) {
      if (error.code !== 'ENOENT') throw error;
    }

    let lines = envContent.split('\n');
    const updateKeys = Object.keys(updates);
    const updatedKeys = new Set<string>();

    lines = lines.map(line => {
      const key = line.split('=')[0];
      if (updateKeys.includes(key)) {
        updatedKeys.add(key);
        return `${key}=${updates[key]}`;
      }
      return line;
    }).filter(Boolean); // remove empty lines

    updateKeys.forEach(key => {
      if (!updatedKeys.has(key)) {
        lines.push(`${key}=${updates[key]}`);
      }
    });

    const finalContent = lines.join('\n') + '\n';

    await fs.writeFile(envPath, finalContent, { encoding: 'utf-8', flag: 'w' });
    console.log('.env file updated successfully with:', Object.keys(updates));
    return { success: true };
  } catch (error) {
    console.error('Failed to write to .env file:', error);
    throw new Error('Could not update the .env file.');
  }
}

export async function updateApiKeys(data: {
    geminiApiKey?: string;
    reCaptchaSiteKey?: string;
    reCaptchaSecretKey?: string;
}) {
    const updates: Record<string, string> = {};
    if (data.geminiApiKey) updates['GEMINI_API_KEY'] = data.geminiApiKey;
    if (data.reCaptchaSiteKey) updates['RECAPTCHA_SITE_KEY'] = data.reCaptchaSiteKey;
    if (data.reCaptchaSecretKey) updates['RECAPTCHA_SECRET_KEY'] = data.reCaptchaSecretKey;
    
    if (Object.keys(updates).length === 0) {
        return { success: true, message: "No keys to update." };
    }

    return await updateEnvFile(updates);
}
