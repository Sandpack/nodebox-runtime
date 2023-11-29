/**
 * @typedef { typeof import("../../packages/nodebox").Nodebox } Nodebox
 * @type {Nodebox} */
const Nodebox = window.Nodebox;

/**
 * @param {string} emulatorUrl
 */
window.runExample = async function (emulatorUrl) {
  const foo = async () => {
    const { Nodebox } = window;

    const emulator = new Nodebox({
      runtimeUrl: emulatorUrl,
      iframe: document.getElementById('frame'),
    });

    await emulator.connect();
    await emulator.fs.init({
      'index.mjs': `console.group("a", "b");
      console.log("test");
      console.group("bla");
      console.warn("tada");
      console.groupEnd();
      console.error("woops");
      console.groupEnd();
      console.table({a: "b", nested: {aa: "bbb"}});
      console.table(["aaa", "bbb"]);
      console.table(["aaa", "bbb"], []);
      console.table({a: "b", nested: {aa: "bbb", bb: "aaa"}}, ["aa"]);`,
    });

    const shellProcess = emulator.shell.create();
    shellProcess.stdout.on('data', (data) => {
      console.log(data);
    });
    shellProcess.stderr.on('data', (data) => {
      console.error(data);
    });
    await shellProcess.runCommand('node', ['index.mjs']);
  };

  foo();
};
