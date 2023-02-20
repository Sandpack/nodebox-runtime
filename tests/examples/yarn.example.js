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

  const yarn = await fetch(`https://repo.yarnpkg.com/4.0.0-rc.39/packages/yarnpkg-cli/bin/yarn.js`).then((res) =>
    res.text()
  );

  await emulator.fs.init({
    'package.json': JSON.stringify({
      dependencies: { lodash: '*' },
    }),
    'yarn.js': yarn.replace(/^(.*)\n/, `$1\nprocess.env.FORCE_COLOR = '3'; process.env.YARN_ENABLE_TELEMETRY = '0';\n`),
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
    console.log(chunk);
  });

  shell.stderr.on(`data`, (chunk) => {
    console.error(chunk);
  });

  const shellInfo = await shell.runCommand('node', ['yarn.js']);
  shell.on('exit', (...data) => console.error('Process exited:', ...data));
  return shellInfo;
};
