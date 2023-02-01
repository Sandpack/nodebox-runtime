const fs = require("fs");
const path = require("path");

console.log('Syncing private repo to this public repo...');

const publicEntries = fs.readdirSync(__dirname);
for (const entry of publicEntries) {
  // Skip git content
  if (entry === ".git" || entry === ".github" || entry === "sync-repo.js") {
    continue;
  }
  
  console.log('Cleaning up public repo:', entry);
  fs.rmSync(path.join(__dirname, entry), {
    recursive: true,
  });
}

const privateNodeboxRoot = path.join(__dirname, "../nodebox");
const privateEntries = fs.readdirSync(privateNodeboxRoot);
for (const entry of privateEntries) {
  // Skip git content
  if (entry === ".git" || entry === ".github" || entry === "sync-repo.js" || entry === "node_modules") {
    continue;
  }

  console.log('Copying to public repo:', entry);
  fs.cpSync(path.join(privateNodeboxRoot, entry), path.join(__dirname, entry), {
    recursive: true,
    force: true,
  });
}

console.log('Removing internal/closed-source code...');
const INTERNAL_ENTRIES = ['packages/runtime', 'documentation'];
for (const entry of INTERNAL_ENTRIES) {
  fs.rmSync(path.join(__dirname, entry), {
    recursive: true,
  });
}

console.log('Sync completed! :D');
