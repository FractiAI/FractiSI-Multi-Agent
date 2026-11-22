#!/usr/bin/env node
/**
 * One-time OS install for automatic Soft Story helper start:
 *   • Register fractisi-skin:// protocol (web page can launch helper)
 *   • Write ~/.config/fractisi-skin/helper.json (portable starter)
 *   • Register login/startup autostart so the helper is always there
 *   • Start the helper now
 *
 *   npm run skin:auto-session:install
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawn, spawnSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SCRIPT = path.join(ROOT, 'scripts', 'holographic-auto-session.mjs');
const NODE = process.execPath;
const PROTOCOL = 'fractisi-skin';
const CONFIG_DIR = path.join(os.homedir(), '.config', 'fractisi-skin');
const CONFIG_FILE = path.join(CONFIG_DIR, 'helper.json');

function shQuote(s) {
  return `'${String(s).replace(/'/g, `'\\''`)}'`;
}

function writeHelperConfig() {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
  const cfg = {
    root: ROOT,
    node: NODE,
    script: SCRIPT,
    protocol: PROTOCOL,
    port: 18765,
    installedAt: new Date().toISOString(),
  };
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2), 'utf8');
  return CONFIG_FILE;
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
    /* optional */
  }
  try {
    execFileSync('update-desktop-database', [apps], { stdio: 'ignore' });
  } catch {
    /* optional */
  }

  // Login autostart
  const autostartDir = path.join(os.homedir(), '.config', 'autostart');
  fs.mkdirSync(autostartDir, { recursive: true });
  const autoDesktop = path.join(autostartDir, 'fractisi-skin-helper.desktop');
  fs.writeFileSync(
    autoDesktop,
    `[Desktop Entry]
Type=Application
Name=FractiSI Soft Story Helper
Exec=${NODE} ${SCRIPT} --companion-only --no-open
X-GNOME-Autostart-enabled=true
NoDisplay=true
`,
    'utf8',
  );
  return { desktop, autoDesktop };
}

function installMac() {
  const appDir = path.join(os.homedir(), 'Applications', 'FractiSI Skin Auto Session.app');
  const contents = path.join(appDir, 'Contents');
  const macos = path.join(contents, 'MacOS');
  fs.mkdirSync(macos, { recursive: true });
  const runner = path.join(macos, 'FractiSISkinAutoSession');
  fs.writeFileSync(
    runner,
    `#!/bin/bash
exec ${shQuote(NODE)} ${shQuote(SCRIPT)} --companion-only --no-open "$@"
`,
    { mode: 0o755 },
  );
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
  try {
    spawnSync(
      '/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister',
      ['-f', appDir],
    );
  } catch {
    /* optional */
  }

  // Login LaunchAgent
  const agents = path.join(os.homedir(), 'Library', 'LaunchAgents');
  fs.mkdirSync(agents, { recursive: true });
  const agentPlist = path.join(agents, 'com.fractiai.fractisi.skin-helper.plist');
  const agentBody = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>com.fractiai.fractisi.skin-helper</string>
  <key>ProgramArguments</key>
  <array>
    <string>${NODE}</string>
    <string>${SCRIPT}</string>
    <string>--companion-only</string>
    <string>--no-open</string>
  </array>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>StandardOutPath</key><string>${path.join(CONFIG_DIR, 'helper.log')}</string>
  <key>StandardErrorPath</key><string>${path.join(CONFIG_DIR, 'helper.err')}</string>
</dict>
</plist>
`;
  fs.writeFileSync(agentPlist, agentBody, 'utf8');
  try {
    spawnSync('launchctl', ['unload', agentPlist], { stdio: 'ignore' });
  } catch {
    /* ok */
  }
  try {
    spawnSync('launchctl', ['load', agentPlist], { stdio: 'ignore' });
  } catch {
    /* optional */
  }
  return { appDir, agentPlist };
}

function installWindows() {
  const bat = path.join(ROOT, 'scripts', 'holographic-auto-session-launch.cmd');
  fs.writeFileSync(bat, `@echo off\r\n"${NODE}" "${SCRIPT}" --companion-only --no-open %*\r\n`, 'utf8');
  const reg = path.join(ROOT, 'scripts', 'fractisi-skin-protocol.reg');
  const batEsc = bat.replace(/\\/g, '\\\\');
  const regBody = `Windows Registry Editor Version 5.00\r\n\r\n[HKEY_CURRENT_USER\\Software\\Classes\\${PROTOCOL}]\r\n@="URL:FractiSI Skin Auto Session"\r\n"URL Protocol"=""\r\n\r\n[HKEY_CURRENT_USER\\Software\\Classes\\${PROTOCOL}\\shell\\open\\command]\r\n@="\\"${batEsc.replace(/"/g, '\\"')}\\" \\"%1\\""\r\n`;
  fs.writeFileSync(reg, regBody, 'utf8');
  try {
    execFileSync('reg', ['import', reg], { stdio: 'inherit' });
  } catch {
    console.log(`[hl-auto-session] Open this file to finish Windows protocol install: ${reg}`);
  }

  // Startup folder shortcut via a small cmd
  const startup = path.join(os.homedir(), 'AppData', 'Roaming', 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Startup');
  try {
    fs.mkdirSync(startup, { recursive: true });
    const startCmd = path.join(startup, 'FractiSI-Skin-Helper.cmd');
    fs.writeFileSync(startCmd, `@echo off\r\nstart "" /min "${NODE}" "${SCRIPT}" --companion-only --no-open\r\n`, 'utf8');
  } catch (e) {
    console.log(`[hl-auto-session] Could not write Windows Startup item: ${e.message}`);
  }
  return { bat, reg };
}

function startHelperNow() {
  const child = spawn(NODE, [SCRIPT, '--companion-only', '--no-open'], {
    detached: true,
    stdio: 'ignore',
    cwd: ROOT,
  });
  child.unref();
  console.log('[hl-auto-session] Helper process started now (background).');
}

const plat = process.platform;
writeHelperConfig();
let where = '';
if (plat === 'linux') where = installLinux();
else if (plat === 'darwin') where = installMac();
else if (plat === 'win32') where = installWindows();
else {
  console.error(`[hl-auto-session] Unsupported platform: ${plat}`);
  process.exit(1);
}

startHelperNow();

console.log(`[hl-auto-session] Registered ${PROTOCOL}:// → ${SCRIPT}`);
console.log(`[hl-auto-session] Config: ${CONFIG_FILE}`);
console.log(`[hl-auto-session] Install artifact: ${JSON.stringify(where)}`);
console.log(`[hl-auto-session] Login autostart enabled — helper should be running.`);
console.log(`[hl-auto-session] Autodetect Start on the web page will auto-launch via ${PROTOCOL}://start`);
