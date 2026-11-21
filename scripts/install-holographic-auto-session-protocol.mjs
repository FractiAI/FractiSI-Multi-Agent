#!/usr/bin/env node
/**
 * One-time OS install: register fractisi-skin:// so the Auto Session web page
 * can auto-launch the local helper when Autodetect is selected.
 *
 *   npm run skin:auto-session:install
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawnSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SCRIPT = path.join(ROOT, 'scripts', 'holographic-auto-session.mjs');
const NODE = process.execPath;
const PROTOCOL = 'fractisi-skin';

function shQuote(s) {
  return `'${String(s).replace(/'/g, `'\\''`)}'`;
}

function installLinux() {
  const apps = path.join(os.homedir(), '.local', 'share', 'applications');
  fs.mkdirSync(apps, { recursive: true });
  const desktop = path.join(apps, 'fractisi-skin-auto-session.desktop');
  const execLine = `${NODE} ${SCRIPT} --companion-only --no-open %u`;
  const body = `[Desktop Entry]
Type=Application
Name=FractiSI Holographic Auto Session
Exec=${execLine}
StartupNotify=false
MimeType=x-scheme-handler/${PROTOCOL};
NoDisplay=true
`;
  fs.writeFileSync(desktop, body, 'utf8');
  try {
    execFileSync('xdg-mime', ['default', 'fractisi-skin-auto-session.desktop', `x-scheme-handler/${PROTOCOL}`]);
  } catch {
    /* xdg-mime optional */
  }
  try {
    execFileSync('update-desktop-database', [apps], { stdio: 'ignore' });
  } catch {
    /* optional */
  }
  return desktop;
}

function installMac() {
  const appDir = path.join(os.homedir(), 'Applications', 'FractiSI Skin Auto Session.app');
  const contents = path.join(appDir, 'Contents');
  const macos = path.join(contents, 'MacOS');
  const resources = path.join(contents, 'Resources');
  fs.mkdirSync(macos, { recursive: true });
  fs.mkdirSync(resources, { recursive: true });
  const runner = path.join(macos, 'FractiSISkinAutoSession');
  const script = `#!/bin/bash
exec ${shQuote(NODE)} ${shQuote(SCRIPT)} --companion-only --no-open "$@"
`;
  fs.writeFileSync(runner, script, { mode: 0o755 });
  const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleExecutable</key><string>FractiSISkinAutoSession</string>
  <key>CFBundleIdentifier</key><string>com.fractiai.fractisi.skin-auto-session</string>
  <key>CFBundleName</key><string>FractiSI Skin Auto Session</string>
  <key>CFBundlePackageType</key><string>APPL</string>
  <key>CFBundleURLTypes</key>
  <array>
    <dict>
      <key>CFBundleURLName</key><string>FractiSI Skin Auto Session</string>
      <key>CFBundleURLSchemes</key>
      <array><string>${PROTOCOL}</string></array>
    </dict>
  </array>
</dict>
</plist>
`;
  fs.writeFileSync(path.join(contents, 'Info.plist'), plist, 'utf8');
  // Refresh Launch Services
  try {
    spawnSync('/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister', [
      '-f',
      appDir,
    ]);
  } catch {
    /* optional */
  }
  return appDir;
}

function installWindows() {
  const bat = path.join(ROOT, 'scripts', 'holographic-auto-session-launch.cmd');
  const batBody = `@echo off\r\n"${NODE}" "${SCRIPT}" --companion-only --no-open %*\r\n`;
  fs.writeFileSync(bat, batBody, 'utf8');
  const reg = path.join(ROOT, 'scripts', 'fractisi-skin-protocol.reg');
  const batEsc = bat.replace(/\\/g, '\\\\');
  const regBody = `Windows Registry Editor Version 5.00\r\n\r\n[HKEY_CURRENT_USER\\Software\\Classes\\${PROTOCOL}]\r\n@="URL:FractiSI Skin Auto Session"\r\n"URL Protocol"=""\r\n\r\n[HKEY_CURRENT_USER\\Software\\Classes\\${PROTOCOL}\\shell]\r\n\r\n[HKEY_CURRENT_USER\\Software\\Classes\\${PROTOCOL}\\shell\\open]\r\n\r\n[HKEY_CURRENT_USER\\Software\\Classes\\${PROTOCOL}\\shell\\open\\command]\r\n@="\\"${batEsc.replace(/"/g, '\\"')}\\" \\"%1\\""\r\n`;
  fs.writeFileSync(reg, regBody, 'utf8');
  try {
    execFileSync('reg', ['import', reg], { stdio: 'inherit' });
  } catch {
    console.log(`[hl-auto-session] Open this file to finish Windows install: ${reg}`);
  }
  return reg;
}

const plat = process.platform;
let where = '';
if (plat === 'linux') where = installLinux();
else if (plat === 'darwin') where = installMac();
else if (plat === 'win32') where = installWindows();
else {
  console.error(`[hl-auto-session] Unsupported platform: ${plat}`);
  process.exit(1);
}

console.log(`[hl-auto-session] Registered ${PROTOCOL}:// → ${SCRIPT}`);
console.log(`[hl-auto-session] Install artifact: ${where}`);
console.log(`[hl-auto-session] Autodetect on the web page can now auto-start the helper.`);
console.log(`[hl-auto-session] Test: open ${PROTOCOL}://start`);
