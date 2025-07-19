
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
    const newEnv = { ...currentEnv, ...updates };

    const newEnvContent = Object.entries(newEnv)
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
        isCaptchaEnabled: env['ENABLE_ADMIN_CAPTCHA'] !== 'false', // default to true
        isMerchantCaptchaRequired: env['ENABLE_MERCHANT_CAPTCHA'] !== 'false', // default to true
        isAdmin2faEnabled: env['ENABLE_ADMIN_2FA'] !== 'false', // default to true
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
    // Only add keys to the update object if they have a non-empty value
    if (data.geminiApiKey) updates['GEMINI_API_KEY'] = data.geminiApiKey;
    if (data.reCaptchaSiteKey) updates['NEXT_PUBLIC_RECAPTCHA_SITE_KEY'] = data.reCaptchaSiteKey;
    if (data.reCaptchaSecretKey) updates['RECAPTCHA_SECRET_KEY'] = data.reCaptchaSecretKey;
    
    updates['ENABLE_ADMIN_CAPTCHA'] = String(data.isCaptchaEnabled);
    updates['ENABLE_MERCHANT_CAPTCHA'] = String(data.isMerchantCaptchaRequired);
    updates['ENABLE_ADMIN_2FA'] = String(data.isAdmin2faEnabled);

    return await updateEnvFile(updates);
}
