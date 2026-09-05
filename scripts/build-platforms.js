"use strict";

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const platforms = ["chrome", "firefox", "safari"];
const requested = process.argv[2] || "all";
const selected = requested === "all" ? platforms : [requested];

if (selected.some((platform) => !platforms.includes(platform))) {
  throw new Error(`Unknown platform: ${requested}`);
}

const rootFiles = [
  "manifest.json",
  "build-info.js",
  "instance-coordinator.js",
  "background.js",
  "popup.html",
  "popup.css",
  "popup.js",
  "content.js",
  "page-bridge.js",
  "copy-utils.js",
  "date-utils.js",
  "settings-transfer.js"
];
const rootDirectories = ["_locales", path.join("assets", "icons")];
const apiFiles = new Set(["popup.js", "content.js"]);

function buildInfo(platform) {
  const distribution = platform === "chrome" ? "chrome-web-store" : platform === "firefox" ? "mozilla-add-ons" : "safari-macos";
  return `(function () {\n  "use strict";\n\n  globalThis.YTQS_BUILD = Object.freeze({\n    distribution: ${JSON.stringify(distribution)}\n  });\n})();\n`;
}

function copyDirectory(source, destination) {
  fs.mkdirSync(destination, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);
    if (entry.isDirectory()) copyDirectory(sourcePath, destinationPath);
    else fs.copyFileSync(sourcePath, destinationPath);
  }
}

function platformManifest(platform) {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8"));
  if (platform === "firefox") {
    manifest.background = { scripts: ["background.js"] };
    manifest.browser_specific_settings = {
      gecko: {
        id: "youtube-quick-settings-toolbox@ahui3c.com",
        strict_min_version: "142.0",
        data_collection_permissions: { required: ["none"] }
      }
    };
  }
  if (platform === "safari") {
    manifest.browser_specific_settings = {
      safari: { strict_min_version: "17.0" }
    };
  }
  return `${JSON.stringify(manifest, null, 2)}\n`;
}

function build(platform) {
  const destination = path.join(root, `dist-${platform}`);
  fs.rmSync(destination, { recursive: true, force: true });
  fs.mkdirSync(destination, { recursive: true });

  for (const filename of rootFiles) {
    const source = path.join(root, filename);
    const target = path.join(destination, filename);
    if (filename === "manifest.json") {
      if (platform === "chrome") fs.copyFileSync(source, target);
      else fs.writeFileSync(target, platformManifest(platform));
      continue;
    }
    if (filename === "build-info.js") {
      fs.writeFileSync(target, buildInfo(platform));
      continue;
    }
    if (platform !== "chrome" && apiFiles.has(filename)) {
      const transformed = fs.readFileSync(source, "utf8").replace(/\bchrome\./g, "browser.");
      fs.writeFileSync(target, transformed);
      continue;
    }
    fs.copyFileSync(source, target);
  }

  for (const directory of rootDirectories) {
    copyDirectory(path.join(root, directory), path.join(destination, directory));
  }

  process.stdout.write(`Built ${platform}: ${path.relative(root, destination)}\n`);
}

selected.forEach(build);
