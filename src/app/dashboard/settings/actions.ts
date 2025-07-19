
'use server';

import * as fs from 'fs/promises';
import * as path from 'path';

async function readEnvFile(): Promise<Record<string, string>> {
  const envPath = path.resolve(process.cwd(), '.env');
  const envVars: Record<string, string> = {};
  
  try {
    const envContent = await fs.readFile(envPath, 'utf-8');
    const lines = envContent.split('\n');

    for (const line of lines) {
      if (line.trim() && !line.startsWith('#')) {
        const eqIndex = line.indexOf('=');
        if (eqIndex !== -1) {
          const key = line.substring(0, eqIndex).trim();
          const value = line.substring(eqIndex + 1).trim();
          envVars[key] = value;
        }
      }
    }
  } catch (error: any) {
    if (error.code !== 'ENOENT') {
      console.error('Failed to read .env file:', error);
      throw new Error('Could not read the .env file.');
    }
    // File doesn't exist, return empty object. It will be created on write.
  }
  return envVars;
}


async function updateEnvFile(updates: Record<string, string>) {
  const envPath = path.resolve(process.cwd(), '.env');
  
  try {
    const currentEnv = await readEnvFile();
    
    // Create a new object with all keys, then apply updates.
    // This ensures that even if a key was previously undefined, it gets added.
    const newEnv = { ...currentEnv, ...updates };

    // Handle keys that might be missing in the update but exist in currentEnv
    const allKeys = [...Object.keys(currentEnv), ...Object.keys(updates)];
    const uniqueKeys = [...new Set(allKeys)];

    for (const key of uniqueKeys) {
        if (updates.hasOwnProperty(key)) {
            newEnv[key] = updates[key];
        } else {
            // This preserves existing keys that are not part of this specific update
            // newEnv[key] = currentEnv[key]; 
        }
    }
    
    // Only save non-empty values, except for the boolean flags
    const newEnvContent = Object.entries(newEnv)
      .filter(([key, value]) => {
          if (key.startsWith('NEXT_PUBLIC_ENABLE_')) {
              return true;
          }
          return value !== '' && value !== undefined && value !== null;
      })
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    await fs.writeFile(envPath, newEnvContent + '\n', { encoding: 'utf-8' });
    console.log('.env file updated successfully with:', Object.keys(updates));
    return { success: true };
  } catch (error) {
    console.error('Failed to write to .env file:', error);
    throw new Error('Could not update the .env file.');
  }
}

export async function getSecuritySettings() {
    const env = await readEnvFile();
    return {
        geminiApiKey: env['GEMINI_API_KEY'] || '',
        reCaptchaSiteKey: env['NEXT_PUBLIC_RECAPTCHA_SITE_KEY'] || '',
        reCaptchaSecretKey: env['RECAPTCHA_SECRET_KEY'] || '',
        isCaptchaEnabled: env['NEXT_PUBLIC_ENABLE_ADMIN_CAPTCHA'] !== 'false', // default to true
        isMerchantCaptchaRequired: env['NEXT_PUBLIC_ENABLE_MERCHANT_CAPTCHA'] !== 'false', // default to true
        isAdmin2faEnabled: env['NEXT_PUBLIC_ENABLE_ADMIN_2FA'] !== 'false', // default to true
    };
}


export async function updateSecuritySettings(data: {
    geminiApiKey?: string;
    reCaptchaSiteKey?: string;
    reCaptchaSecretKey?: string;
    isCaptchaEnabled: boolean;
    isMerchantCaptchaRequired: boolean;
    isAdmin2faEnabled: boolean;
}) {
    const updates: Record<string, string> = {};

    updates['GEMINI_API_KEY'] = data.geminiApiKey || '';
    updates['NEXT_PUBLIC_RECAPTCHA_SITE_KEY'] = data.reCaptchaSiteKey || '';
    updates['RECAPTCHA_SECRET_KEY'] = data.reCaptchaSecretKey || '';
    
    updates['NEXT_PUBLIC_ENABLE_ADMIN_CAPTCHA'] = String(data.isCaptchaEnabled);
    updates['NEXT_PUBLIC_ENABLE_MERCHANT_CAPTCHA'] = String(data.isMerchantCaptchaRequired);
    updates['NEXT_PUBLIC_ENABLE_ADMIN_2FA'] = String(data.isAdmin2faEnabled);

    return await updateEnvFile(updates);
}
