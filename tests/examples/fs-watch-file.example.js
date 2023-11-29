/**
 * @typedef { typeof import("../../packages/nodebox").Nodebox } Nodebox
 * @type {Nodebox} */
const Nodebox = window.Nodebox;

/**
 * @param {string} emulatorUrl
 */
window.runExample = async function (emulatorUrl) {
  const emulator = new Nodebox({
    runtimeUrl: emulatorUrl,
    iframe: document.getElementById('frame'),
  });

  await emulator.connect();

  await emulator.fs.init({
    'package.json': JSON.stringify({
      dependencies: {},
    }),
    'index.js': `const fs = require("fs");

// start watching a file
fs.watchFile("example_file.txt", (curr, prev) => {
  console.log("The file was edited");
  console.log("Previous Modified Time:", prev.mtime);
  console.log("Current Modified Time:", curr.mtime);
});

// make changes to the file before it has been stopped watching
setTimeout(() => fs.writeFileSync("example_file.txt", "File Contents are Edited"), 1000);

// Stop watching the file
setTimeout(() => {
  fs.unwatchFile("example_file.txt");
  console.log("File has been stopped watching");
}, 6000);

// Make Changes to the file after it has stopped watching
setTimeout(() => {
  fs.writeFileSync("example_file.txt", "File Contents are Edited Again");
  console.log("Edited file again after watcher stopped");
}, 7000);
`,
  });

  const shellProcess = emulator.shell.create();
  return await shellProcess.runCommand('node', ['index.js']);
};
