// Prefer the project's installation; support the existing Codex runtime on this
// machine without requiring NODE_PATH in the user's PowerShell session.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {createRequire} from 'node:module';

const require=createRequire(import.meta.url);
let playwright;
try {
  playwright=require('playwright');
} catch(error) {
  if(error.code!=='MODULE_NOT_FOUND'||!error.message.startsWith("Cannot find module 'playwright'"))throw error;
  const bundled=path.join(os.homedir(),'.cache','codex-runtimes','codex-primary-runtime','dependencies','node','node_modules','playwright');
  if(fs.existsSync(path.join(bundled,'package.json'))) {
    playwright=require(bundled);
    console.log('Using Playwright from the installed Codex runtime.');
  } else {
    throw new Error('Playwright is missing. From the project folder, run npm install, then npx playwright install chromium. Rerun this test afterward.',{cause:error});
  }
}

export const {chromium}=playwright;
