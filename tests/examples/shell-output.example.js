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
      dependencies: { lodash: '*' },
    }),
    'index.js': [
      // Feedback: The trailing \n seems missing from the stdout stream, probably
      // because you also forward it to the caller's console.log (which it'd be good
      // to have a way to disable)
      `console.log('testing stdout 1');\n`,
      // Feedback: It seems that process.stdout isn't caught
      `process.stdout.write('testing stdout 2\\n');\n`,

      // Feedback: I didn't find how to retrieve stderr in shell.stderr
      // Feedback:          ^ Why is "fi" in a separate font? 😁
      `console.error('testing stderr 1\\n');\n`,
      `process.stderr.write('testing stderr 2\\n');\n`,

      `process.exit(0);`,
    ].join(``),
  });

  // Feedback: It'd be nice if we could set an `env` object to use
  // with all the binaries started by the shell
  const shell = emulator.shell.create();

  shell.on(`progress`, (status) => {
    console.log(status);
  });

  shell.on(`exit`, (exitCode, error) => {
    console.log(`exit`, exitCode, error);
  });

  shell.stdout.on(`data`, (chunk) => {
    console.log(`stdout`, [chunk]);
  });

  shell.stderr.on(`data`, (chunk) => {
    console.log(`stderr`, [chunk]);
  });

  const shellInfo = await shell.runCommand('node', ['index.js']);
  shell.on('exit', (...data) => console.error('Process exited:', ...data));
  return shellInfo;
};
